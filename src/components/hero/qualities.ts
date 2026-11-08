// Seven qualities, each with a colour from the portrait palette (see PLAN.md).
// Light, clay-like shades: the lightest orange and blue in the photo, plus tints of them.
// Warm tones lead the human qualities, blues the sharp ones, grey and charcoal the grounded ones.
export const QUALITIES = [
  { name: "Creativity", color: "#ffa969" }, // lightest orange in the photo: the spark
  { name: "Care", color: "#ffd2b0" }, // peach tint: the warm face light
  { name: "Pragmatism", color: "#9fb0b8" }, // cool grey: steady, no fuss
  { name: "Resilience", color: "#d4703c" }, // terracotta: weathered and strong
  { name: "Drive", color: "#3fb6e6" }, // light blue: energy
  { name: "Intelligence", color: "#0c6f98" }, // lightest true blue in the photo: depth
  { name: "Humility", color: "#3b4a51" }, // charcoal: quiet and grounded
] as const;
