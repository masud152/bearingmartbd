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
  { slug: "roller-bearings", name: "Roller Bearings", description: "Heavy-duty bearing solutions designed to support demanding radial and axial loads." },
  { slug: "pillow-block-bearings", name: "Pillow Block Bearings", description: "Easy-to-install mounted bearing units for dependable shaft support." },
  { slug: "linear-bearings", name: "Linear Bearings", description: "Precision components for controlled, smooth linear movement." },
  { slug: "bearing-housings", name: "Bearing Housings", description: "Strong housings that protect bearings and simplify installation." },
  { slug: "industrial-accessories", name: "Industrial Accessories", description: "Essential accessories to support bearing installation, maintenance, and machinery operations." },
] as const;

export type Category = (typeof categories)[number];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
