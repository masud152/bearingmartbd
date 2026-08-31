export const bearingSuffixes = [
  { value: "", label: "Open / standard", description: "Open bearing with standard CN clearance" },
  { value: "Z", label: "Z — Single metal shield", description: "Metal shield on one side" },
  { value: "ZZ", label: "ZZ — Double metal shield", description: "Metal shields on both sides" },
  { value: "V", label: "V — Single non-contact seal", description: "Rubber non-contact seal on one side" },
  { value: "VV", label: "VV — Double non-contact seal", description: "Rubber non-contact seals on both sides" },
  { value: "DU", label: "DU — Single contact seal", description: "Rubber contact seal on one side" },
  { value: "DDU", label: "DDU — Double contact seal", description: "Rubber contact seals on both sides" },
  { value: "DDW", label: "DDW — Double low-torque seal", description: "Enhanced double seal with lower torque than DDU" },
  { value: "CN", label: "CN — Normal clearance", description: "Normal radial internal clearance" },
  { value: "CM", label: "CM — Electric-motor clearance", description: "NSK electric-motor internal clearance" },
  { value: "C3", label: "C3 — Greater clearance", description: "Radial clearance greater than CN" },
  { value: "C4", label: "C4 — Greater than C3", description: "Radial clearance greater than C3" },
  { value: "N", label: "N — Snap-ring groove", description: "Snap-ring groove in the outer ring" },
  { value: "NR", label: "NR — Groove with snap ring", description: "Snap-ring groove supplied with snap ring" },
  { value: "M", label: "M — Brass cage", description: "Machined brass cage configuration" },
  { value: "ZZCM", label: "ZZ CM — Double shield, motor clearance", description: "Double metal shields with electric-motor clearance" },
  { value: "ZZC3", label: "ZZ C3 — Double shield, C3 clearance", description: "Double metal shields with C3 clearance" },
  { value: "DDUCM", label: "DDU CM — Double contact seal, motor clearance", description: "Double contact seals with electric-motor clearance" },
  { value: "DDUC3", label: "DDU C3 — Double contact seal, C3 clearance", description: "Double contact seals with C3 clearance" },
  { value: "VVCM", label: "VV CM — Double non-contact seal, motor clearance", description: "Double non-contact seals with electric-motor clearance" },
  { value: "VVC3", label: "VV C3 — Double non-contact seal, C3 clearance", description: "Double non-contact seals with C3 clearance" },
] as const;

export function getBearingSuffix(value?: string | null) {
  return bearingSuffixes.find((option) => option.value === (value ?? "")) ?? bearingSuffixes[0];
}
