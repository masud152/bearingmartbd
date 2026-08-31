export type CatalogueBrand = "NSK" | "SKF" | "NTN" | "KOYO/JTEKT" | "TIMKEN" | "NACHI" | "FAG" | "INA" | "IKO";

export type BearingOption = { value: string; label: string; description: string };

export const brandBearingOptions: Record<CatalogueBrand, readonly BearingOption[]> = {
  NSK: [
    { value: "", label: "Open / standard", description: "Open bearing with normal clearance" },
    { value: "ZZ", label: "ZZ — Double metal shield", description: "Metal shields on both sides" },
    { value: "DDU", label: "DDU — Double contact seal", description: "Contact seals on both sides" },
    { value: "VV", label: "VV — Double non-contact seal", description: "Non-contact seals on both sides" },
    { value: "CM", label: "CM — Motor clearance", description: "Electric-motor internal clearance" },
    { value: "C3", label: "C3 — Greater clearance", description: "Clearance greater than normal" },
    { value: "ZZCM", label: "ZZ CM — Shielded, motor clearance", description: "Double shields with motor clearance" },
    { value: "DDUCM", label: "DDU CM — Sealed, motor clearance", description: "Double contact seals with motor clearance" },
  ],
  SKF: [
    { value: "", label: "Open / standard", description: "Open bearing with normal clearance" },
    { value: "Z", label: "Z — Single shield", description: "Metal shield on one side" },
    { value: "2Z", label: "2Z — Double shield", description: "Metal shields on both sides" },
    { value: "RS1", label: "RS1 — Single contact seal", description: "Contact seal on one side" },
    { value: "2RS1", label: "2RS1 — Double contact seal", description: "Contact seals on both sides" },
    { value: "2RZ", label: "2RZ — Double non-contact seal", description: "Non-contact seals on both sides" },
    { value: "C3", label: "C3 — Greater clearance", description: "Clearance greater than normal" },
    { value: "C4", label: "C4 — Greater than C3", description: "Clearance greater than C3" },
    { value: "2Z/C3", label: "2Z/C3 — Shielded, C3", description: "Double shields with C3 clearance" },
    { value: "2RS1/C3", label: "2RS1/C3 — Sealed, C3", description: "Double contact seals with C3 clearance" },
  ],
  NTN: [
    { value: "", label: "Open / standard", description: "Open bearing with normal clearance" },
    { value: "ZZ", label: "ZZ — Double steel shield", description: "Steel shields on both sides" },
    { value: "LLB", label: "LLB — Non-contact seals", description: "Synthetic rubber non-contact seals" },
    { value: "LLU", label: "LLU — Contact seals", description: "Synthetic rubber contact seals" },
    { value: "LLH", label: "LLH — Low-torque seals", description: "Synthetic rubber low-torque seals" },
    { value: "CM", label: "CM — Motor clearance", description: "Electric-motor internal clearance" },
    { value: "C3", label: "C3 — Greater clearance", description: "Clearance greater than normal" },
    { value: "C4", label: "C4 — Greater than C3", description: "Clearance greater than C3" },
    { value: "ZZC3", label: "ZZ C3 — Shielded, C3", description: "Double shields with C3 clearance" },
    { value: "LLUC3", label: "LLU C3 — Sealed, C3", description: "Contact seals with C3 clearance" },
  ],
  "KOYO/JTEKT": [
    { value: "", label: "Open / standard", description: "Open bearing with normal clearance" },
    { value: "ZZ", label: "ZZ — Double shield", description: "Fixed shields on both sides" },
    { value: "2RU", label: "2RU — Non-contact seals", description: "Non-contact seals on both sides" },
    { value: "2RS", label: "2RS — Contact seals", description: "Contact seals on both sides" },
    { value: "C3", label: "C3 — Greater clearance", description: "Clearance greater than normal" },
  ],
  TIMKEN: [
    { value: "", label: "Open / standard", description: "Open bearing with normal clearance" },
    { value: "ZZ", label: "ZZ — Double shield", description: "Shields on both sides" },
    { value: "2RS", label: "2RS — Contact seals", description: "Contact seals on both sides" },
    { value: "C3", label: "C3 — Greater clearance", description: "Clearance greater than normal" },
    { value: "2RS-C3", label: "2RS C3 — Sealed, C3", description: "Contact seals with C3 clearance" },
  ],
  NACHI: [{ value: "", label: "Open / confirm variant", description: "Confirm the exact NACHI suffix and construction before ordering" }],
  FAG: [
    { value: "", label: "Open / standard", description: "Open bearing; confirm the complete current designation" },
    { value: "2Z", label: "2Z — Double shield", description: "Shields on both sides" },
    { value: "2RSR", label: "2RSR — Double contact seal", description: "Contact seals on both sides" },
    { value: "C3", label: "C3 — Greater clearance", description: "Clearance greater than normal" },
    { value: "2Z-C3", label: "2Z C3 — Shielded, C3", description: "Double shields with C3 clearance" },
  ],
  INA: [{ value: "", label: "Open / confirm variant", description: "Confirm the exact INA suffix and construction before ordering" }],
  IKO: [{ value: "", label: "Standard / confirm product", description: "IKO availability is model-specific; confirm the exact product before ordering" }],
};

export function catalogueBrand(value?: string | null): CatalogueBrand {
  return value && value in brandBearingOptions ? value as CatalogueBrand : "NSK";
}

export function bearingOption(brand: CatalogueBrand, value?: string | null) {
  return brandBearingOptions[brand].find((option) => option.value === (value ?? "")) ?? brandBearingOptions[brand][0];
}

export function bearingDesignation(number: string, brand: CatalogueBrand, suffix: string) {
  if (!suffix) return number;
  if (brand === "SKF") return suffix.startsWith("C") ? `${number}/${suffix}` : `${number}-${suffix}`;
  if (brand === "TIMKEN" || brand === "FAG") return `${number}-${suffix}`;
  return `${number}${suffix}`;
}
