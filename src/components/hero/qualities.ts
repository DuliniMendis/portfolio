// Seven qualities, each a shade of the photo's two colours: orange and blue.
// Order matters: it is the order of the ring, the marble bands and the share image.
// The last entry sits at the heart of the cluster. Soft to deep within each hue.
export const QUALITIES = [
  { name: "Care", color: "#ffbf85" }, // soft orange: the warm face light
  { name: "Creativity", color: "#ff9a3d" }, // bright orange: the spark
  { name: "Resilience", color: "#e8691f" }, // deep orange: fired and strong
  { name: "Pragmatism", color: "#b4e0f5" }, // pale blue: clear and steady
  { name: "Drive", color: "#4cc2f4" }, // bright blue: energy
  { name: "Intelligence", color: "#2f9bd8" }, // mid blue: depth
  { name: "Humility", color: "#1b6fa3" }, // deep blue: quiet, at the centre
] as const;
