/**
 * Every colour the career game may draw (the company logos are the only exception: they keep their brand colours).
 * One character per colour, so sprites can be written as text. Site tokens come from `globals.css`; skin tones are
 * sampled from `public/images/dulini.jpeg` and shifted towards neutral daylight; the rest are shades of the site's
 * orange and blue, plus warm sandstone greys, one deep teal for palm fronds and a coral orange for the lab brain.
 */
export const PALETTE = {
  // Site tokens
  k: "#0e1717", // --ink: outlines, eyes, shoes, the iris
  w: "#ffffff", // --surface
  b: "#f7f9fa", // --background
  s: "#d6eefc", // --sky
  B: "#1a96d2", // --blue
  l: "#5cc6f4", // --blue-light
  T: "#08689e", // --blue-text
  o: "#ff9a3d", // --accent
  p: "#ffeedd", // --peach
  m: "#5a6a72", // --muted
  r: "#dbe3e6", // --border
  // Shades of the site colours
  O: "#d9772a", // deep orange: shading on orange
  R: "#a8521a", // rust: darkest orange
  N: "#054a72", // navy: shading on blue-text
  a: "#eaf6fd", // sky, lighter band
  c: "#b6e1f9", // sky, deeper band / far water
  g: "#a9b6bc", // mid grey
  G: "#7d8d95", // dark grey
  j: "#33434a", // deep grey: interior shadow
  // Dulini (sampled from the portrait, neutralised)
  S: "#b5734c", // skin
  D: "#8e5536", // skin shade
  E: "#5c3322", // skin edge, mouth
  h: "#15191c", // hair
  H: "#3d5a69", // hair highlight (blue-grey)
  // Other people
  u: "#f1c9a5", // light skin
  U: "#e0a87c", // light-mid skin
  v: "#7a4a30", // deep skin
  x: "#3b2a20", // dark brown hair
  z: "#e6c07a", // fair hair
  // Places
  y: "#efd3a2", // sand / sandstone
  Y: "#d2a66c", // sandstone shade
  q: "#b88651", // sandstone deep
  f: "#1f5f69", // palm frond (deep teal, in the blue family)
  F: "#3a8f96", // palm frond highlight
  // The lab brain: a pink-leaning shade of the orange
  P: "#f7b49a", // brain
  Q: "#d9806a", // brain folds
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** Transparent pixel in sprite strings. */
export const CLEAR = ".";

export const INK = PALETTE.k;
