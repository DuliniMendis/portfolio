import * as THREE from "three";
import { QUALITIES } from "./qualities";

const W = 1280;
const H = 640;

function luminance(hex: string) {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/**
 * Paints a quality's name onto an equirectangular texture. The front of a three.js sphere
 * (facing +z) sits at u = 0.25, so the text is centred there. Spheres are kept unrotated,
 * so the name always faces the camera.
 */
export function makeNameTexture(name: string, color: string, fontFamily: string) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);

  // One shared size, fitted to the longest name, so every sphere is lettered alike.
  // The text spans about 96 degrees of the sphere's circumference.
  const targetWidth = (W * 96) / 360;
  const longest = QUALITIES.reduce((a, q) => (q.name.length > a.length ? q.name : a), "");
  ctx.font = `600 100px ${fontFamily}`;
  const size = Math.min(72, (100 * targetWidth) / ctx.measureText(longest).width);

  ctx.font = `600 ${size}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Dark ink on light clay, cream on dark clay.
  ctx.fillStyle = luminance(color) > 0.2 ? "rgba(14,23,23,0.88)" : "rgba(255,244,230,0.92)";
  ctx.fillText(name, W * 0.25, H * 0.5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Fine speckled grain shared by every sphere, so the surface reads as fired clay. */
export function makeGrainTexture() {
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < w * h; i++) {
    const v = 128 + (rand() - 0.5) * 70;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}
