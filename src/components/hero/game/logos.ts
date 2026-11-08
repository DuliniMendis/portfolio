import type { LogoId } from "./world";

/**
 * The three company logos, as published by each company (fetched 2026-11-08 from seermedical.com/seer-logo.svg,
 * leonardo.ai/images/leonardo_wordmark.svg and the canva.com header). Drawn unmodified on the crisp layer, never
 * pixelated or recoloured; each building's sign is coloured to suit its logo instead.
 */
export const LOGOS: Record<LogoId, { src: string; aspect: number; name: string }> = {
  seer: { src: "/logos/seer-medical.svg", aspect: 261.5 / 108.9, name: "Seer Medical" },
  leonardo: { src: "/logos/leonardo-ai.svg", aspect: 225 / 25, name: "Leonardo.Ai" },
  canva: { src: "/logos/canva.svg", aspect: 80 / 30, name: "Canva" },
};

/** Fit a logo inside a box, centred, keeping its proportions. */
export function fitLogo(id: LogoId, x: number, y: number, w: number, h: number) {
  const a = LOGOS[id].aspect;
  let dw = w;
  let dh = w / a;
  if (dh > h) {
    dh = h;
    dw = h * a;
  }
  return { x: x + (w - dw) / 2, y: y + (h - dh) / 2, w: dw, h: dh };
}
