import * as THREE from "three";
import { QUALITIES } from "./qualities";

/**
 * The merged sphere: all seven qualities swirled together like marbled clay.
 * Colours come straight from QUALITIES, so it always matches the seven spheres.
 * Bands run around the sphere (u wraps exactly seven times) and are bent by periodic
 * waves so the seam on the back never shows.
 */
export function makeMarbleTexture() {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);

  const rgb = QUALITIES.map((q) => {
    const c = new THREE.Color(q.color).convertLinearToSRGB();
    return [c.r * 255, c.g * 255, c.b * 255];
  });
  const n = rgb.length;
  const TAU = Math.PI * 2;
  const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const t =
        u * n +
        0.55 * Math.sin(TAU * (2 * u + 1.5 * v)) +
        0.3 * Math.sin(TAU * (5 * u - 3 * v) + 1) +
        0.35 * Math.sin(TAU * (3 * v));
      const wrapped = ((t % n) + n) % n;
      const i = Math.floor(wrapped);
      const f = smooth(0.55, 1, wrapped - i);
      const a = rgb[i % n];
      const b = rgb[(i + 1) % n];
      const o = (y * w + x) * 4;
      img.data[o] = a[0] + (b[0] - a[0]) * f;
      img.data[o + 1] = a[1] + (b[1] - a[1]) * f;
      img.data[o + 2] = a[2] + (b[2] - a[2]) * f;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
