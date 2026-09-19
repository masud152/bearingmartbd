export type CategoryProduct = { model:string; slug:string; type:string; brand:string; image:string; availability:"Normally stocked"|"Available on order" };

const stocked = ["SKF","NSK","NTN","KOYO/JTEKT","TIMKEN","NACHI"];
const onOrder = ["FAG","INA","IKO"];
const productSlug = (model:string) => model.toLowerCase().replaceAll("×","x").replaceAll(/[^a-z0-9]+/g,"-").replaceAll(/(^-|-$)/g,"");
const legacyImage = (category:string, brand:string, model:string) => {
  if (category === "roller-bearings") return `/catalogue/brands/roller/${({ SKF:"skf.jpg", NSK:"nsk.png", NTN:"ntn.jpg", "KOYO/JTEKT":"koyo.jpg", TIMKEN:"timken.jpg", NACHI:"nachi.jpg", FAG:"fag.jpg", INA:"ina.webp", IKO:"iko.jpg" } as Record<string,string>)[brand] ?? (model === "30205" ? "tapered.jpg" : "cylindrical.jpg")}`;
  if (category === "pillow-block-bearings") return `/catalogue/brands/pillow/${({ SKF:"skf.png", NSK:"nsk.jpg", NTN:"ntn.jpg", "KOYO/JTEKT":"koyo.jpg", TIMKEN:"timken.jpg", FAG:"fag.png", INA:"ina.jpg" } as Record<string,string>)[brand] ?? "skf.png"}`;
  if (category === "linear-bearings") { const image=({ SKF:"skf.jpg", NSK:"nsk.png", INA:"ina.jpg", IKO:"iko.jpg" } as Record<string,string>)[brand]; return image ? `/catalogue/brands/linear/${image}` : `/catalogue/linear/${model.includes("LM") ? "bushing.webp" : "block.png"}`; }
  if (category === "bearing-housings") { const image=({ FAG:"fag.jpg", INA:"ina.jpg" } as Record<string,string>)[brand]; return image ? `/catalogue/brands/housing/${image}` : "/catalogue/housings/plummer.jpg"; }
  return `/catalogue/accessories/${model === "CIR-25" ? "circlip.jpg" : model === "KM5" ? "locknut.jpg" : model === "EP2" ? "grease.jpg" : model.includes("25") ? "oil-seal.jpg" : "adapter.jpg"}`;
};
const build = (category:string, items:readonly [string,string][]):CategoryProduct[] => items.map(([model,type],index) => {
  const brand=index % 4 === 3 ? onOrder[index % onOrder.length] : stocked[index % stocked.length];
  return {model,slug:productSlug(model),type,image:legacyImage(category,brand,model),brand,availability:index % 4 === 3 ? "Available on order" : "Normally stocked"};
});

export const categoryCatalogues:Record<string,CategoryProduct[]> = {
  "roller-bearings": build("roller-bearings", [["30205","Tapered Roller Bearings"],["NU 205","Cylindrical Roller Bearings"],["22205","Spherical Roller Bearings"],["HK 1010","Needle Roller Bearings"],["81105","Thrust Roller Bearings"],["NCF 2920","Full Complement Roller Bearings"]]),
  "pillow-block-bearings": build("pillow-block-bearings", [["UCP 205","UCP"],["UCF 205","UCF"],["UCFL 205","UCFL"],["UCT 205","UCT"],["UCFC 205","UCFC"],["UCPA 205","UCPA"],["UCPH 205","UCPH"],["UC 205","Insert Bearings UC/UK/SA/SB"]]),
  "linear-bearings": build("linear-bearings", [["LM10UU","LM Series"],["LME10UU","LME Series"],["LB 10","Linear Bushings"],["SC10UU","Linear Bearing Blocks"],["HGR15","Linear Guide Rails"],["HGW15CC","Linear Carriages"],["SK10","Shaft Supports"]]),
  "bearing-housings": build("bearing-housings", [["SN 205","Plummer Blocks"],["SNL 205","Split Housings"],["SNH 205","SN/SNL Housings"],["F 205","Flange Housings"],["TU 205","Take-Up Housings"],["H 205","Adapter Sleeves"],["AH 205","Withdrawal Sleeves"]]),
  "industrial-accessories": build("industrial-accessories", [["25 × 47 × 7","Oil Seals"],["CIR-25","Circlips"],["KM5","Lock Nuts"],["MB5","Lock Washers"],["EP2","Grease"],["BPH-2","Bearing Pullers"],["CPL-24","Couplings"],["A-42","Belts"],["08B","Chains"],["12B-1","Sprockets"],["O-25","O-Rings and related maintenance items"]]),
};

export const getCategoryProduct = (categorySlug:string, productSlug:string) => categoryCatalogues[categorySlug]?.find(product => product.slug === productSlug);
