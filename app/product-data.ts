export const categories = [
  {
    slug: "ball-bearings",
    name: "Ball Bearings",
    description: "Versatile bearing solutions for smooth, efficient rotation across industrial and machinery applications.",
    subcategories: [
      "Deep Groove Ball Bearings",
      "Angular Contact Ball Bearings",
      "Self-Aligning Ball Bearings",
      "Thrust Ball Bearings",
      "Miniature Ball Bearings",
      "Double Row Ball Bearings",
      "Stainless Steel Bearings",
    ],
  },
  { slug: "roller-bearings", name: "Roller Bearings", description: "Heavy-duty bearing solutions designed to support demanding radial and axial loads.", subcategories: ["Tapered Roller Bearings", "Cylindrical Roller Bearings", "Spherical Roller Bearings", "Needle Roller Bearings", "Thrust Roller Bearings", "Full Complement Roller Bearings"] },
  { slug: "pillow-block-bearings", name: "Pillow Block Bearings", description: "Easy-to-install mounted bearing units for dependable shaft support.", subcategories: ["UCP", "UCF", "UCFL", "UCT", "UCFC", "UCPA", "UCPH", "Insert Bearings UC/UK/SA/SB"] },
  { slug: "linear-bearings", name: "Linear Bearings", description: "Precision components for controlled, smooth linear movement.", subcategories: ["LM Series", "LME Series", "Linear Bushings", "Linear Bearing Blocks", "Linear Guide Rails", "Linear Carriages", "Shaft Supports"] },
  { slug: "bearing-housings", name: "Bearing Housings", description: "Strong housings that protect bearings and simplify installation.", subcategories: ["Plummer Blocks", "Split Housings", "SN/SNL Housings", "Flange Housings", "Take-Up Housings", "Adapter Sleeves", "Withdrawal Sleeves"] },
  { slug: "industrial-accessories", name: "Industrial Accessories", description: "Essential accessories to support bearing installation, maintenance, and machinery operations.", subcategories: ["Oil Seals", "Circlips", "Lock Nuts", "Lock Washers", "Grease", "Bearing Pullers", "Couplings", "Belts", "Chains", "Sprockets", "O-Rings and related maintenance items"] },
] as const;

export type Category = (typeof categories)[number];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
