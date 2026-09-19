export type CategoryProduct = { model:string; slug:string; type:string; brand:string; image:string; availability:"Normally stocked"|"Available on order" };

const stocked = ["SKF","NSK","NTN","KOYO/JTEKT","TIMKEN","NACHI"];
const onOrder = ["FAG","INA","IKO"];
const productSlug = (model:string) => model.toLowerCase().replaceAll("×","x").replaceAll(/[^a-z0-9]+/g,"-").replaceAll(/(^-|-$)/g,"");
const build = (items:readonly [string,string][],image:string):CategoryProduct[] => items.map(([model,type],index) => ({model,slug:productSlug(model),type,image,brand:index % 4 === 3 ? onOrder[index % onOrder.length] : stocked[index % stocked.length],availability:index % 4 === 3 ? "Available on order" : "Normally stocked"}));

export const categoryCatalogues:Record<string,CategoryProduct[]> = {
  "roller-bearings": build([["30205","Tapered Roller Bearings"],["NU 205","Cylindrical Roller Bearings"],["22205","Spherical Roller Bearings"],["HK 1010","Needle Roller Bearings"],["81105","Thrust Roller Bearings"],["NCF 2920","Full Complement Roller Bearings"]],"/bearing-products/official-skf-tapered-roller.png"),
  "pillow-block-bearings": build([["UCP 205","UCP"],["UCF 205","UCF"],["UCFL 205","UCFL"],["UCT 205","UCT"],["UCFC 205","UCFC"],["UCPA 205","UCPA"],["UCPH 205","UCPH"],["UC 205","Insert Bearings UC/UK/SA/SB"]],"/bearing-products/official-skf-pillow-block.png"),
  "linear-bearings": build([["LM10UU","LM Series"],["LME10UU","LME Series"],["LB 10","Linear Bushings"],["SC10UU","Linear Bearing Blocks"],["HGR15","Linear Guide Rails"],["HGW15CC","Linear Carriages"],["SK10","Shaft Supports"]],"/bearing-products/official-thk-linear-guide.png"),
  "bearing-housings": build([["SN 205","Plummer Blocks"],["SNL 205","Split Housings"],["SNH 205","SN/SNL Housings"],["F 205","Flange Housings"],["TU 205","Take-Up Housings"],["H 205","Adapter Sleeves"],["AH 205","Withdrawal Sleeves"]],"/bearing-products/official-skf-bearing-housing.png"),
  "industrial-accessories": build([["25 × 47 × 7","Oil Seals"],["CIR-25","Circlips"],["KM5","Lock Nuts"],["MB5","Lock Washers"],["EP2","Grease"],["BPH-2","Bearing Pullers"],["CPL-24","Couplings"],["A-42","Belts"],["08B","Chains"],["12B-1","Sprockets"],["O-25","O-Rings and related maintenance items"]],"/bearing-products/official-skf-industrial-seal.png"),
};

export const getCategoryProduct = (categorySlug:string, productSlug:string) => categoryCatalogues[categorySlug]?.find(product => product.slug === productSlug);
