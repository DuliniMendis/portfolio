// Plain colour maths for the share image (text colour on each quality).
const INK = "#0e1717";
const CREAM = "#fff4e6";

function channel(c: number) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a #rrggbb colour. */
export function relativeLuminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function ratio(a: number, b: number) {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** Whichever of dark ink or cream reads better on this background. */
export function readableTextColor(background: string) {
  const y = relativeLuminance(background);
  return ratio(y, relativeLuminance(INK)) >= ratio(y, relativeLuminance(CREAM)) ? INK : CREAM;
}
