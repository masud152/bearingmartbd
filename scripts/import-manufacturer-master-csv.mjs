import { access, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { createPool } from "mysql2/promise";

const [file,...flags]=process.argv.slice(2);
const dryRun=flags.includes("--dry-run"),reportIndex=flags.indexOf("--report"),reportFile=reportIndex>=0?flags[reportIndex+1]:null;
if(!file)throw new Error("Usage: node scripts/import-manufacturer-master-csv.mjs <file.csv> [--dry-run] [--report report.json]");

const normalize=value=>String(value??"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const slug=value=>String(value??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const parseLine=line=>{const values=[];let value="",quoted=false;for(let index=0;index<line.length;index+=1){const char=line[index];if(char==='"'){if(quoted&&line[index+1]==='"'){value+='"';index+=1;}else quoted=!quoted;}else if(char===","&&!quoted){values.push(value.trim());value="";}else value+=char;}if(quoted)throw new Error("CSV contains an unclosed quoted value.");values.push(value.trim());return values;};
const parseCsv=text=>{const [header,...rows]=text.replace(/^\uFEFF/,"").trim().split(/\r?\n/);const keys=parseLine(header);return rows.filter(Boolean).map((line,index)=>({...Object.fromEntries(parseLine(line).map((value,column)=>[keys[column],value])),_line:index+2}));};
const required=["brand","category","bearing_type","basic_model","manufacturer_designation","bore_mm","od_mm","width_mm","availability","source_url","source_title","source_document","source_document_version","source_verified_at","data_verification_status","published"];
const officialDomains={"SKF":["skf.com"],"NTN":["ntnamericas.com"],"NSK":["nsk.com"],"KOYO/JTEKT":["jtekt.co.jp"],"TIMKEN":["timken.com"],"NACHI":["nachi-fujikoshi.co.jp","nachiamerica.com"]};
const verificationStates=new Set(["verified","incomplete","manual_review","rejected"]);
const isPositive=value=>Number.isFinite(Number(value))&&Number(value)>0;
const isOfficialSource=(brand,url)=>{try{const host=new URL(url).hostname.toLowerCase();return new URL(url).protocol==="https:"&&(officialDomains[brand]??[]).some(domain=>host===domain||host.endsWith(`.${domain}`));}catch{return false;}};
const report={accepted:[],incomplete:[],manualReview:[],rejected:[],duplicates:[],imageProblems:[],wouldInsert:[],wouldUpdate:[],autoPublishBlocked:[]};
const rows=parseCsv(await readFile(resolve(file),"utf8")),seen=new Set();

for(const row of rows){
  const designation=normalize(row.manufacturer_designation),identity=`${row.brand}|${designation}`,missing=required.filter(key=>!row[key]);
  const dimensions=[row.bore_mm,row.od_mm,row.width_mm].every(isPositive),loadValues=[row.dynamic_load_value,row.static_load_value].every(value=>!value||isPositive(value)),units=[row.dynamic_load_unit,row.static_load_unit].every(unit=>!unit||unit==="N");
  const imageTokens=String(row.brand??"").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),imageStem=normalize(basename(row.image_path??"")),imageBrandOk=!row.image_path||imageTokens.some(token=>imageStem.includes(normalize(token)));
  if(!verificationStates.has(row.data_verification_status)){report.rejected.push({line:row._line,designation:row.manufacturer_designation,reason:"invalid verification status"});continue;}
  if(row.data_verification_status==="incomplete"){report.incomplete.push({line:row._line,designation:row.manufacturer_designation,reason:"marked incomplete"});continue;}
  if(row.data_verification_status==="manual_review"){report.manualReview.push({line:row._line,designation:row.manufacturer_designation,reason:"marked for manual review"});continue;}
  if(row.data_verification_status==="rejected"){report.rejected.push({line:row._line,designation:row.manufacturer_designation,reason:"marked rejected"});continue;}
  if(row.published!=="no"){report.autoPublishBlocked.push({line:row._line,designation:row.manufacturer_designation});continue;}
  if(missing.length||!officialDomains[row.brand]||!designation||!dimensions||!loadValues||!units||!isOfficialSource(row.brand,row.source_url)){report.rejected.push({line:row._line,designation:row.manufacturer_designation,missing,reason:!officialDomains[row.brand]?"unsupported manufacturer":!isOfficialSource(row.brand,row.source_url)?"source is not an official manufacturer HTTPS domain":!dimensions?"invalid dimensions":!loadValues?"invalid load value":"missing or invalid required data"});continue;}
  if(seen.has(identity)){report.duplicates.push({line:row._line,identity,reason:"duplicate row in file"});continue;} seen.add(identity);
  if(row.image_path){if(!imageBrandOk){report.imageProblems.push({line:row._line,image:row.image_path,reason:"image filename does not identify selected brand"});continue;}try{await access(resolve(row.image_path));}catch{report.imageProblems.push({line:row._line,image:row.image_path,reason:"image file not found"});continue;}}
  report.accepted.push(row);
}

const requiredEnvironment=["DB_HOST","DB_USER","DB_PASSWORD","DB_NAME"];for(const key of requiredEnvironment)if(!process.env[key])throw new Error(`${key} is required for database import preview`);
const pool=createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
try{
  for(const row of report.accepted){
    const brandSlug=slug(row.brand),designation=normalize(row.manufacturer_designation),[[brand]]=await pool.query("SELECT id,name FROM brands WHERE slug=?",[brandSlug]),[[category]]=await pool.query("SELECT id FROM categories WHERE slug=?",[row.category]);
    if(!brand||!category){report.rejected.push({line:row._line,designation:row.manufacturer_designation,reason:"brand or category missing from database"});continue;}
    const [[existing]]=await pool.query("SELECT id FROM products WHERE brand_id=? AND normalized_manufacturer_designation=?",[brand.id,designation]);
    if(existing)report.wouldUpdate.push({line:row._line,designation:row.manufacturer_designation});else report.wouldInsert.push({line:row._line,designation:row.manufacturer_designation});
    if(dryRun)continue;
    const now=new Date().toISOString(),id=crypto.randomUUID(),productSlug=slug(`${brandSlug}-${row.manufacturer_designation}`),sku=row.sku||`${String(brand.name).replace(/[^a-z0-9]/gi,"").toUpperCase()}-${row.manufacturer_designation}`;
    const values=[`${brand.name} ${row.manufacturer_designation} ${row.bearing_type}`,productSlug,row.manufacturer_designation,sku,row.bearing_type,Number(row.bore_mm),Number(row.od_mm),Number(row.width_mm),row.series||null,row.basic_model,row.manufacturer_designation,designation,row.seal_shield||null,row.clearance||null,row.cage||null,row.dynamic_load_value?Number(row.dynamic_load_value):null,row.dynamic_load_unit||null,row.static_load_value?Number(row.static_load_value):null,row.static_load_unit||null,row.speed_rpm?Number(row.speed_rpm):null,row.speed_note||null,row.source_url,row.source_title,row.source_verified_at,row.source_document,row.source_document_version,row.data_verification_status,row.availability];
    if(existing){await pool.query("UPDATE products SET name=?,slug=?,bearing_number=?,sku=?,product_type=?,bore_diameter=?,outside_diameter=?,width=?,series=?,basic_model=?,manufacturer_designation=?,normalized_manufacturer_designation=?,seal_shield=?,clearance=?,cage=?,dynamic_load_value=?,dynamic_load_unit=?,static_load_value=?,static_load_unit=?,speed_rpm=?,speed_note=?,source_url=?,source_title=?,source_verified_at=?,source_document=?,source_document_version=?,data_verification_status=?,stock_status=?,image_key=image_key,updated_at=? WHERE id=?",[...values,now,existing.id]);}
    else{await pool.query("INSERT INTO products (id,name,slug,bearing_number,sku,mpn,category_id,brand_id,product_type,bore_diameter,outside_diameter,width,series,basic_model,manufacturer_designation,normalized_manufacturer_designation,seal_shield,clearance,cage,dynamic_load_value,dynamic_load_unit,static_load_value,static_load_unit,speed_rpm,speed_note,source_url,source_title,source_verified_at,source_document,source_document_version,data_verification_status,stock_status,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,values[0],values[1],values[2],values[3],values[2],category.id,brand.id,...values.slice(4),"draft",now,now]);}
  }
}finally{await pool.end();}

const output={...report,summary:{accepted:report.accepted.length,incomplete:report.incomplete.length,manualReview:report.manualReview.length,rejected:report.rejected.length,duplicates:report.duplicates.length,imageProblems:report.imageProblems.length,wouldInsert:report.wouldInsert.length,wouldUpdate:report.wouldUpdate.length,autoPublishBlocked:report.autoPublishBlocked.length,dryRun}};
if(reportFile)await writeFile(resolve(reportFile),JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
