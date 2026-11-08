// Seven qualities, each with a colour from the portrait palette (see PLAN.md).
// Warm tones lead the human qualities, blues the sharp ones, grey and ink the grounded ones.
export const QUALITIES = [
  { name: "Creativity", color: "#f79840" }, // vivid orange: the spark
  { name: "Care", color: "#ffc59a" }, // soft peach: the warm face light
  { name: "Pragmatism", color: "#8a99a1" }, // cool grey: steady, no fuss
  { name: "Resilience", color: "#a8481f" }, // rust: weathered and strong
  { name: "Drive", color: "#1aa3d6" }, // bright blue: energy
  { name: "Intelligence", color: "#056c95" }, // backdrop blue: depth
  { name: "Humility", color: "#0e1717" }, // near-black: quiet and grounded
] as const;
