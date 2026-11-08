import { PALETTE } from "./palette";
import type { ColorMap, Sprite } from "./sprites/types";
import { phase, wrap } from "./timeline";
import { textSprite } from "./font";

/**
 * The world: camera, parallax, ground, sky, and the drawing surface every scene draws through.
 * World coordinates are game pixels; x grows to the right along the story, y = 0 is the ground line and up is
 * negative. A `Painter` turns screen-space rectangles and sprites into pixels (the canvas engine) or SVG (the
 * server-rendered frame), so both show exactly the same picture. No React here.
 */

export type LogoId = "seer" | "leonardo" | "canva";

export interface Painter {
  rect(color: string, x: number, y: number, w: number, h: number): void;
  sprite(s: Sprite, x: number, y: number, map?: ColorMap, variant?: string): void;
  /** Logos are drawn on the crisp layer, never pixelated. Coordinates are screen game pixels. */
  logo(id: LogoId, x: number, y: number, w: number, h: number): void;
}

/** Where the world sits on the surface, in screen game pixels. */
export type View = {
  /** Screen x of the camera focus. */
  ox: number;
  /** Screen y of the ground line. */
  gy: number;
  /** Visible screen extents (left, right, top). */
  left: number;
  right: number;
  top: number;
};

/**
 * Pixel scale and ground placement for a panel of W × H CSS px. A game pixel is 3 CSS px when the panel is at
 * least SCALE3_MIN_W × SCALE3_MIN_H (enough room for the 144 × 176 game-pixel scene), else 2. The ground line sits
 * a base depth above the bottom edge, plus half of any height beyond CONTENT_H, so tall narrow panels keep the
 * scene in the middle instead of under a tall empty sky. StaticFrame repeats this rule in CSS.
 */
export const SCALE3_MIN_W = 432;
export const SCALE3_MIN_H = 528;
export const GROUND_DEPTH_2 = 26;
export const GROUND_DEPTH_3 = 38;
export const CONTENT_H = 200;
export function panelLayout(W: number, H: number) {
  const scale = W >= SCALE3_MIN_W && H >= SCALE3_MIN_H ? 3 : 2;
  const base = scale === 3 ? GROUND_DEPTH_3 : GROUND_DEPTH_2;
  return { scale, depth: base + Math.max(0, Math.round((H / scale - CONTENT_H) / 2)) };
}
/** How deep the ground strip is drawn (the deepest ground line is 76 px, on a 2× panel 600 px tall). */
const GROUND_FILL = 80;
/** Below this depth the ground is plain bands (cheap to draw and to send as SVG). */
const TOP_SOIL = 27;


// ---- Small maths -------------------------------------------------------------------------------

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0..1 progress of p through [a, b], clamped. */
export const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
export const easeIn = (t: number) => t * t;
/** Overshoot then settle, for things that pop or extrude. */
export const bounce = (t: number) => (t >= 1 ? 1 : 1 + 2.2 * Math.pow(1 - t, 2) * Math.sin(t * Math.PI * 1.4) - Math.pow(1 - t, 3));

/** Deterministic 0..1 from integers (so crowds and particles repeat every loop). */
export function hash(a: number, b = 0, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ---- The world surface -------------------------------------------------------------------------

export class World {
  /** Camera focus (world x shown at the view's ox). */
  focus = 0;
  /** The current beat and its progress (set by the scene before anything draws). */
  beat = 0;
  p = 0;
  /** True for reduced motion postcards and the static frame: no particles, no wind. */
  readonly calm: boolean;

  constructor(
    readonly painter: Painter,
    /** Global story time, ms. */
    readonly t: number,
    readonly view: View,
    calm = false,
  ) {
    this.calm = calm;
  }

  phase(i: number) {
    return phase(i, this.t);
  }

  /** Screen x for world x, on a parallax layer moving at factor k. */
  sx(wx: number, k = 1) {
    return Math.round(wx - this.focus * k) + this.view.ox;
  }
  sy(wy: number) {
    return Math.round(wy) + this.view.gy;
  }

  rect(color: string, wx: number, wy: number, w: number, h: number, k = 1) {
    const x = this.sx(wx, k);
    if (x > this.view.right || x + w < this.view.left) return;
    this.painter.rect(color, x, this.sy(wy), Math.round(w), Math.round(h));
  }

  /** Sprite with its top-left at world (wx, wy). */
  spr(s: Sprite, wx: number, wy: number, map?: ColorMap, variant?: string, k = 1) {
    const x = this.sx(wx, k);
    if (x > this.view.right || x + s.w < this.view.left) return;
    this.painter.sprite(s, x, this.sy(wy), map, variant);
  }

  /** Sprite centred on cx with its bottom `lift` px above the ground. */
  stand(s: Sprite, cx: number, lift = 0, map?: ColorMap, variant?: string) {
    this.spr(s, Math.round(cx - s.w / 2), -s.h - lift, map, variant);
  }

  text(text: string, wx: number, wy: number, key: string) {
    this.spr(textSprite(text, key), wx, wy);
  }

  logo(id: LogoId, wx: number, wy: number, w: number, h: number) {
    const x = wx - Math.round(this.focus) + this.view.ox;
    if (x > this.view.right || x + w < this.view.left) return;
    this.painter.logo(id, x, wy + this.view.gy, w, h);
  }

  /** Screen-space rectangle (for the sky and the UI). */
  screenRect(color: string, x: number, y: number, w: number, h: number) {
    this.painter.rect(color, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  screenSpr(s: Sprite, x: number, y: number) {
    this.painter.sprite(s, Math.round(x), Math.round(y));
  }

  /** The visible world range [from, to] on layer k. */
  visible(k = 1): [number, number] {
    const f = Math.round(this.focus * k);
    return [this.view.left - this.view.ox + f, this.view.right - this.view.ox + f];
  }
}

// ---- Sky, parallax and ground ------------------------------------------------------------------

/** Sky bands from the horizon up, each this tall (banded, not smooth). */
export const SKY_BAND = 34;
const SKY = [PALETTE.b, PALETTE.a, PALETTE.s];

/** Where the land kinds change along the story, world x. */
export const SHORE_OUT = 260; // end of the Sri Lankan beach
export const SHORE_IN = 760; // Australian coast

export function drawSky(g: World) {
  const { gy, left, right, top } = g.view;
  const w = right - left;
  SKY.forEach((c, i) => {
    const y0 = i === SKY.length - 1 ? top : gy - (i + 1) * SKY_BAND;
    const y1 = gy - i * SKY_BAND;
    g.screenRect(c, left, y0, w, y1 - y0);
  });
}

/** Total extra cloud travel from the wind (Canva beat onwards), world px. */
export function windDrift(g: World) {
  const p = g.phase(8);
  const gust = clamp((p - 0.6) / 0.4);
  // Extra distance integrates the rising wind speed, then keeps going through the fall.
  return gust * gust * 260 + g.phase(9) * 300;
}

const CLOUD_SMALL: string[] = ["..wwww..", ".wwwwwww", "wwwwwwww", ".rrrrrr."];
const CLOUD_MID: string[] = [
  "....wwww......",
  "..wwwwwwww....",
  ".wwwwwwwwwwww.",
  "wwwwwwwwwwwwww",
  ".rrrrrrrrrrrr.",
];
const CLOUD_BIG: string[] = [
  ".......wwwww..........",
  "....wwwwwwwwww.www....",
  "..wwwwwwwwwwwwwwwwww..",
  ".wwwwwwwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwwwwwwwww",
  ".rrrrrrrrrrrrrrrrrrrr.",
];
const CLOUDS = [CLOUD_SMALL, CLOUD_MID, CLOUD_BIG].map((rows, i) => ({
  id: `cloud-${i}`,
  w: rows[0].length,
  h: rows.length,
  rows,
}));

/** A pixel sun high in the sky, barely moving as the story travels. */
const SUN = {
  id: "sun",
  w: 12,
  h: 12,
  rows: [
    "....oooo....",
    "..oooooooo..",
    ".oooooooooo.",
    ".oooooooooo.",
    "oooooooooooo",
    "oooooooooooO",
    "oooooooooooO",
    "ooooooooooOO",
    ".ooooooooOO.",
    ".oooooooOOO.",
    "..ooooOOOO..",
    "....OOOO....",
  ],
};
export function drawSun(g: World) {
  const k = 0.05;
  g.spr(SUN, 190, -168, undefined, undefined, k);
}

/** Clouds on a slow parallax layer, repeating every CLOUD_SPAN world px. */
const CLOUD_K = 0.3;
const CLOUD_SPAN = 240;
export function drawClouds(g: World) {
  const drift = windDrift(g);
  // Clouds drift on their own a little, so the sky is alive even when the camera holds still.
  const idle = wrap(g.t) * 0.002;
  const [from, to] = g.visible(CLOUD_K);
  const shift = idle + drift;
  for (let tile = Math.floor((from - shift) / CLOUD_SPAN) - 1; tile <= Math.ceil((to - shift) / CLOUD_SPAN); tile++) {
    for (let j = 0; j < 3; j++) {
      const c = CLOUDS[Math.floor(hash(tile, j, 3) * 3)];
      const x = tile * CLOUD_SPAN + j * 80 + hash(tile, j, 1) * 40 + shift;
      const y = -175 + hash(tile, j, 2) * 100;
      g.spr(c, x, y, undefined, undefined, CLOUD_K);
    }
  }
}

/** Far water on the horizon behind the beach and under the flight. */
export function drawHorizon(g: World) {
  const k = 0.5;
  const [from, to] = g.visible(k);
  const end = SHORE_IN * k + 40;
  if (from < end) {
    const x0 = from - 2;
    const x1 = Math.min(to + 2, end);
    g.rect(PALETTE.c, x0, -7, x1 - x0, 7, k);
    g.rect(PALETTE.l, x0, -7, x1 - x0, 1, k);
  }
}

/** The ground strip: sand, then ocean, then city pavement. */
export function drawGround(g: World) {
  const [from, to] = g.visible();
  const x0 = Math.floor(from) - 2;
  const x1 = Math.ceil(to) + 2;
  const seg = (a: number, b: number, fn: (a: number, b: number) => void) => {
    const lo = Math.max(a, x0);
    const hi = Math.min(b, x1);
    if (lo < hi) fn(lo, hi);
  };
  // Sand
  seg(-10000, SHORE_OUT, (a, b) => {
    g.rect(PALETTE.y, a, 0, b - a, TOP_SOIL);
    g.rect(PALETTE.Y, a, 0, b - a, 1);
    g.rect(PALETTE.Y, a, TOP_SOIL, b - a, GROUND_FILL - TOP_SOIL);
    g.rect(PALETTE.q, a, TOP_SOIL + 14, b - a, GROUND_FILL);
    for (let x = Math.floor(a / 8) * 8; x < b; x += 8) {
      g.rect(PALETTE.Y, x + 2, 5, 2, 1);
      g.rect(PALETTE.Y, x + 6, 11, 1, 1);
      g.rect(PALETTE.Y, x + 1, 18, 2, 1);
    }
  });
  // Ocean, with waves that roll.
  seg(SHORE_OUT, SHORE_IN, (a, b) => {
    g.rect(PALETTE.B, a, 0, b - a, GROUND_FILL);
    g.rect(PALETTE.l, a, 0, b - a, 2);
    g.rect(PALETTE.T, a, 14, b - a, GROUND_FILL - 14);
    g.rect(PALETTE.N, a, 30, b - a, GROUND_FILL - 30);
    const roll = Math.floor(wrap(g.t) / 160) % 12;
    for (let x = Math.floor(a / 12) * 12; x < b; x += 12) {
      const xx = x + roll;
      if (xx >= a && xx + 4 <= b) g.rect(PALETTE.w, xx, 1, 4, 1);
      if (xx + 6 >= a && xx + 9 <= b) g.rect(PALETTE.l, xx + 6, 7, 3, 1);
      if (xx + 2 >= a && xx + 5 <= b) g.rect(PALETTE.B, xx + 2, 20, 3, 1);
    }
  });
  // City pavement: two courses of paving stones, then the kerb and the road bed below.
  seg(SHORE_IN, 100000, (a, b) => {
    g.rect(PALETTE.r, a, 0, b - a, TOP_SOIL);
    g.rect(PALETTE.G, a, 0, b - a, 1);
    g.rect(PALETTE.g, a, 1, b - a, 2);
    g.rect(PALETTE.g, a, 14, b - a, 1);
    for (let x = Math.floor(a / 16) * 16; x < b; x += 16) {
      if (x >= a) g.rect(PALETTE.g, x, 3, 1, 11);
      if (x + 8 >= a && x + 8 < b) g.rect(PALETTE.g, x + 8, 15, 1, 11);
    }
    g.rect(PALETTE.g, a, TOP_SOIL - 1, b - a, GROUND_FILL);
    g.rect(PALETTE.G, a, TOP_SOIL + 12, b - a, 1);
    g.rect(PALETTE.G, a, TOP_SOIL + 30, b - a, 1);
  });
  // Where the beach meets the sea, and the sea meets the land
  if (SHORE_OUT >= x0 && SHORE_OUT <= x1) g.rect(PALETTE.w, SHORE_OUT - 3, 0, 3, 1);
  if (SHORE_IN >= x0 && SHORE_IN <= x1) {
    g.rect(PALETTE.y, SHORE_IN, 0, 10, GROUND_FILL);
    g.rect(PALETTE.Y, SHORE_IN, 0, 10, 1);
  }
}
