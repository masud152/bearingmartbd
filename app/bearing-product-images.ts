const IMAGE_BY_BEARING: Record<string, string> = {
  "1200": "/bearing-products/nsk-self-aligning.jpg", "1300": "/bearing-products/nsk-self-aligning.jpg",
  "16001": "/bearing-products/nsk-thin-section.jpg", "2200": "/bearing-products/nsk-self-aligning.jpg",
  "2300": "/bearing-products/nsk-self-aligning.jpg", "3200": "/bearing-products/nsk-double-row-angular-contact.jpg",
  "3300": "/bearing-products/nsk-double-row-angular-contact.jpg", "4200": "/bearing-products/nsk-double-row-deep-groove.png",
  "4300": "/bearing-products/nsk-double-row-deep-groove.png", "51100": "/bearing-products/nsk-thrust.jpg",
  "51200": "/bearing-products/nsk-thrust.jpg", "51300": "/bearing-products/nsk-thrust.jpg",
  "51400": "/bearing-products/nsk-thrust.jpg", "6000": "/bearing-products/nsk-deep-groove.jpg",
  "608": "/bearing-products/nsk-miniature.jpg", "6200": "/bearing-products/nsk-deep-groove.jpg",
  "6300": "/bearing-products/nsk-deep-groove.jpg", "6403": "/bearing-products/nsk-deep-groove.jpg",
  "6800": "/bearing-products/nsk-thin-section.jpg", "6900": "/bearing-products/nsk-thin-section.jpg",
  "7000": "/bearing-products/nsk-angular-contact.jpg", "7200": "/bearing-products/nsk-angular-contact.jpg",
  "7300": "/bearing-products/nsk-angular-contact.jpg", "7403": "/bearing-products/nsk-angular-contact.jpg",
};

export function productImageUrl(bearingNumber: string, imageKey?: string | null) {
  return imageKey ? `/api/product-images/${imageKey}` : IMAGE_BY_BEARING[bearingNumber] ?? "/bearing-products/nsk-deep-groove.jpg";
}

export const PRODUCT_IMAGE_NOTE = "Representative NSK product image. Seal, cage and suffix configuration may vary.";
