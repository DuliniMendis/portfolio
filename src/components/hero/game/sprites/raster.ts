import { PALETTE } from "../palette";
import type { ColorMap, Sprite } from "./types";

type Raster = HTMLCanvasElement;

const cache = new Map<string, Raster>();

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgbCache = new Map<string, [number, number, number]>();
function rgb(hex: string) {
  let v = rgbCache.get(hex);
  if (!v) rgbCache.set(hex, (v = hexToRgb(hex)));
  return v;
}

/** Colour for one sprite character, or null for transparent / unknown. */
export function colorOf(c: string, map?: ColorMap): string | null {
  if (c === ".") return null;
  return map?.[c] ?? (PALETTE as Record<string, string>)[c] ?? null;
}

/**
 * Draw a sprite into its own small canvas once and cache it, so drawing a frame is one `drawImage`.
 * `variant` names the colour map, so palette-swapped people share sprite data but get their own raster.
 */
export function raster(s: Sprite, map?: ColorMap, variant = ""): Raster {
  const key = `${s.id}|${variant}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = s.w;
  c.height = s.h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(s.w, s.h);
  for (let y = 0; y < s.h; y++) {
    const row = s.rows[y];
    for (let x = 0; x < s.w; x++) {
      const hex = colorOf(row[x], map);
      if (!hex) continue;
      const [r, g, b] = rgb(hex);
      const i = (y * s.w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  cache.set(key, c);
  return c;
}
