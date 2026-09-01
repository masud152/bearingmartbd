export type CatalogueItem = { model: string; type: string; summary: string };

export const categoryCatalogues: Record<string, readonly CatalogueItem[]> = {
  "roller-bearings": [
    { model: "NU205", type: "Cylindrical Roller Bearing", summary: "Separating cylindrical roller design for high radial-load applications." },
    { model: "NJ205", type: "Cylindrical Roller Bearing", summary: "Cylindrical roller design with axial location capability in one direction." },
    { model: "30205", type: "Tapered Roller Bearing", summary: "Single-row tapered roller bearing for combined radial and axial loads." },
    { model: "32205", type: "Tapered Roller Bearing", summary: "Tapered roller bearing for demanding combined-load applications." },
    { model: "22205", type: "Spherical Roller Bearing", summary: "Self-aligning roller bearing for heavy loads and shaft misalignment." },
    { model: "22305", type: "Spherical Roller Bearing", summary: "Heavy-duty spherical roller bearing for demanding machinery." },
    { model: "NA4905", type: "Needle Roller Bearing", summary: "Compact needle roller bearing with a high radial load capacity." },
    { model: "81105", type: "Thrust Roller Bearing", summary: "Axial cylindrical roller bearing for thrust-load applications." },
  ],
  "pillow-block-bearings": [
    { model: "UCP204", type: "Pillow Block Unit", summary: "Two-bolt mounted bearing unit for general shaft support." },
    { model: "UCP205", type: "Pillow Block Unit", summary: "Self-aligning insert bearing with a cast mounted housing." },
    { model: "UCF204", type: "Square Flange Unit", summary: "Four-bolt square flange bearing unit." },
    { model: "UCFL204", type: "Oval Flange Unit", summary: "Compact two-bolt oval flange bearing unit." },
    { model: "UCT205", type: "Take-Up Unit", summary: "Take-up bearing unit for adjustable shaft and belt systems." },
    { model: "UCFC205", type: "Round Flange Unit", summary: "Round cartridge flange bearing unit for compact mounting." },
    { model: "UCPA204", type: "Low-Base Pillow Block", summary: "Low-profile pillow block unit for restricted mounting spaces." },
    { model: "UKP205", type: "Tapered-Bore Pillow Block", summary: "Pillow block unit using a tapered-bore insert and adapter sleeve." },
  ],
  "linear-bearings": [
    { model: "LM8UU", type: "Linear Ball Bushing", summary: "Compact metric linear bushing for an 8 mm shaft." },
    { model: "LM10UU", type: "Linear Ball Bushing", summary: "Metric linear bushing for smooth guided movement." },
    { model: "LM12UU", type: "Linear Ball Bushing", summary: "Linear ball bushing for general automation and machinery." },
    { model: "LM16UU", type: "Linear Ball Bushing", summary: "Metric linear bushing for medium-size shaft guidance." },
    { model: "LME20UU", type: "European Linear Bushing", summary: "European-series linear bushing for guided linear motion." },
    { model: "SCS8UU", type: "Linear Bearing Block", summary: "Aluminium housed linear bearing block for an 8 mm shaft." },
    { model: "SBR16UU", type: "Supported-Rail Block", summary: "Open linear block for a supported round rail system." },
    { model: "SHF16", type: "Shaft Support", summary: "Flange shaft support for linear-motion installations." },
  ],
  "bearing-housings": [
    { model: "SN505", type: "Plummer Block Housing", summary: "Split plummer block housing for accessible bearing installation." },
    { model: "SN506", type: "Plummer Block Housing", summary: "General-purpose split housing for industrial shaft support." },
    { model: "SNL505", type: "Split Plummer Block", summary: "Split housing platform for reliable bearing protection." },
    { model: "SNL506", type: "Split Plummer Block", summary: "Industrial split housing for adaptable mounting arrangements." },
    { model: "FNL505", type: "Flanged Housing", summary: "Flanged bearing housing for wall or machine-frame mounting." },
    { model: "SAF205", type: "Split Pillow Block Housing", summary: "Heavy-duty split pillow block housing configuration." },
    { model: "TU205", type: "Take-Up Housing", summary: "Take-up housing for adjustable conveyor and transmission systems." },
    { model: "H205", type: "Adapter Sleeve", summary: "Adapter sleeve used to mount a tapered-bore bearing." },
  ],
  "industrial-accessories": [
    { model: "H205", type: "Adapter Sleeve", summary: "Adapter sleeve for mounting compatible tapered-bore bearings." },
    { model: "AHX305", type: "Withdrawal Sleeve", summary: "Withdrawal sleeve for mounting and removal arrangements." },
    { model: "KM5", type: "Lock Nut", summary: "Precision lock nut used to locate bearings on a shaft." },
    { model: "MB5", type: "Lock Washer", summary: "Tab lock washer for compatible bearing lock nuts." },
    { model: "35×52×7", type: "Oil Seal", summary: "Metric rotary shaft oil seal; material must be confirmed." },
    { model: "DIN 471-25", type: "Circlip", summary: "External retaining ring for a compatible shaft groove." },
    { model: "EP2-400G", type: "Bearing Grease", summary: "General-purpose EP2 bearing grease pack; brand is confirmed on enquiry." },
    { model: "HRC90", type: "Flexible Coupling", summary: "General-purpose flexible coupling assembly and element size." },
  ],
};

export function categoryCatalogue(slug: string) { return categoryCatalogues[slug] ?? []; }
export function categoryCatalogueItem(slug: string, model: string) { return categoryCatalogue(slug).find((item) => item.model.toLowerCase() === model.toLowerCase()); }

export function categoryCatalogueImage(slug: string, item: CatalogueItem, brand = "SKF"): string | null {
  const brandImagesByCategory: Record<string, Record<string, string>> = {
    "roller-bearings": {
      SKF: "/catalogue/brands/roller/skf.jpg", NSK: "/catalogue/brands/roller/nsk.png", NTN: "/catalogue/brands/roller/ntn.jpg",
      "KOYO/JTEKT": "/catalogue/brands/roller/koyo.jpg", TIMKEN: "/catalogue/brands/roller/timken.jpg", NACHI: "/catalogue/brands/roller/nachi.jpg",
      FAG: "/catalogue/brands/roller/fag.jpg", INA: "/catalogue/brands/roller/ina.webp", IKO: "/catalogue/brands/roller/iko.jpg",
    },
    "pillow-block-bearings": {
      SKF: "/catalogue/brands/pillow/skf.png", NSK: "/catalogue/brands/pillow/nsk.jpg", NTN: "/catalogue/brands/pillow/ntn.jpg",
      "KOYO/JTEKT": "/catalogue/brands/pillow/koyo.jpg", TIMKEN: "/catalogue/brands/pillow/timken.jpg",
      FAG: "/catalogue/brands/pillow/fag.png", INA: "/catalogue/brands/pillow/ina.jpg",
    },
    "linear-bearings": {
      SKF: "/catalogue/brands/linear/skf.jpg", NSK: "/catalogue/brands/linear/nsk.png",
      INA: "/catalogue/brands/linear/ina.jpg", IKO: "/catalogue/brands/linear/iko.jpg",
    },
    "bearing-housings": {
      SKF: "/catalogue/housings/plummer.jpg", FAG: "/catalogue/brands/housing/fag.jpg", INA: "/catalogue/brands/housing/ina.jpg",
    },
    // Accessories cover several unrelated product families. A brand image is intentionally
    // withheld until an exact, verified photo is uploaded for the selected accessory.
    "industrial-accessories": {},
  };
  return brandImagesByCategory[slug]?.[brand] ?? null;
}
