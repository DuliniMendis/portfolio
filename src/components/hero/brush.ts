// Pure paint-stroke maths for the hero: seeded randomness, curve sampling, brush profiles,
// bristle generation and drawing onto a 2D context. No React, no DOM globals, so it can be
// used by the canvas animation, the server-rendered SVG fallback and, later, unit tests.
//
// The look comes from a flat brush modelled as a row of bristles. Each bristle keeps its place
// across the brush for the whole stroke, so it leaves a continuous streak along the direction of
// travel. Streaks overlap at different opacities and shades (texture), outer bristles wander and
// break up (ragged edges), bristles land at slightly different moments (soft landing) and, as the
// brush runs dry, streaks break into dashes and outer bristles lift off (dry, thinning trail).

import { relativeLuminance } from "./contrast";

// ---- Knobs -----------------------------------------------------------------------------------

/** Points sampled along each stroke, evenly spaced by arc length. */
export const SAMPLES = 320;
/** Stroke span as a fraction of canvas width: short labels get the low end, long labels the high. */
export const SPAN = [0.72, 0.86] as const;
/** Stroke width (at full load) as a fraction of canvas height (or of 1.4 x width on tall, narrow canvases). */
export const WIDTH = [0.16, 0.22] as const;
export const WIDTH_ASPECT = 1.4;
/** Tilt range, degrees. */
export const TILT = [-8, 6] as const;
/** Arc (bow) height as a fraction of canvas height. */
export const BOW = [0.06, 0.12] as const;
/** Vertical lanes (fraction of height from centre), cycled so consecutive strokes do not overlap. */
export const LANES = [-0.14, 0.04, 0.16, -0.04] as const;
/** Width profile: landing ramp length, taper start and width at the very end. */
export const LAND = 0.08;
export const TAPER_FROM = 0.75;
export const END_WIDTH = 0.55;
/** Load profile: full paint until DRY_FROM, then fades to END_ALPHA at the end. */
export const DRY_FROM = 0.6;
export const END_ALPHA = 0.35;
/** Bristles per pixel of stroke width (clamped). */
export const BRISTLE_DENSITY = 0.62;
/** Body underpaint: width relative to the stroke, opacity, and where it runs out. */
export const BODY_WIDTH = 0.8;
export const BODY_ALPHA = 0;
/** The underpaint starts after the landing and runs out before the dry trail. */
export const BODY_RANGE = [0.03, 0.72] as const;
/** Length of the dashes in the dry trail at full size, px. */
export const DRY_DASH = 26;
/** Where along the stroke its label is centred, and the stretch (fractions of length) it must stay within: loaded paint, not the dry trail. */
export const LABEL_AT = 0.42;
export const LABEL_SPAN = [0.1, 0.72] as const;
/** Colours darker than this (WCAG luminance) carry light text, so their paint is kept deep. */
export const DEEP_LUMINANCE = 0.2;
/** Bristle lines thin to 75 % and then 50 % of their width from these points on. */
export const DRY_THIN = [0.68, 0.84] as const;

// ---- Seeded randomness -----------------------------------------------------------------------

/** mulberry32: tiny, fast, good enough for visuals. Returns floats in [0, 1). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(i: number, seed: number) {
  let h = Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul(seed | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth 1D value noise in [0, 1). */
export function noise1(x: number, seed: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// ---- Profiles along the stroke (t = 0 at landing, 1 at lift) ---------------------------------

/** Brush width multiplier: lands narrow, opens up, then eases down as pressure lifts. */
export function widthAt(t: number) {
  if (t < LAND) {
    const u = t / LAND;
    return 0.3 + 0.7 * (1 - (1 - u) ** 3);
  }
  return lerp(1, END_WIDTH, smoothstep(TAPER_FROM, 1, t));
}

/** Paint load (opacity multiplier): full, then thinning as the brush dries. */
export function alphaAt(t: number) {
  return lerp(1, END_ALPHA, smoothstep(DRY_FROM, 1, t));
}

/** How dry the brush is: 0 while loaded, rising to ~1 at the end. Drives streak breakup. */
function drynessAt(t: number) {
  return smoothstep(0.5, 1, t);
}

/** Draw-time easing: the brush starts slowly for the first ~15 %, then travels almost linearly. */
export function drawEase(u: number) {
  const a = 0.15;
  const k = 1 / (1 - a / 2);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u < a ? (k * u * u) / (2 * a) : k * (u - a / 2);
}

// ---- Geometry --------------------------------------------------------------------------------

export type Curve = {
  xs: Float32Array;
  ys: Float32Array;
  angles: Float32Array;
  length: number;
};

export type StrokeLayout = {
  curve: Curve;
  /** Full-load stroke width in px. */
  width: number;
  /** Chord length in px (start to end). */
  span: number;
};

type Pt = { x: number; y: number };

function catmullRom(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

/** Smooth curve through the points, resampled to `n` points evenly spaced by arc length. */
export function sampleCurve(points: Pt[], n = SAMPLES): Curve {
  const ext = [
    { x: 2 * points[0].x - points[1].x, y: 2 * points[0].y - points[1].y },
    ...points,
    {
      x: 2 * points[points.length - 1].x - points[points.length - 2].x,
      y: 2 * points[points.length - 1].y - points[points.length - 2].y,
    },
  ];
  const dense: Pt[] = [];
  const STEPS = 120;
  for (let s = 0; s < points.length - 1; s++) {
    for (let k = 0; k < STEPS; k++) dense.push(catmullRom(ext[s], ext[s + 1], ext[s + 2], ext[s + 3], k / STEPS));
  }
  dense.push(points[points.length - 1]);

  const cum = new Float64Array(dense.length);
  for (let i = 1; i < dense.length; i++) {
    cum[i] = cum[i - 1] + Math.hypot(dense[i].x - dense[i - 1].x, dense[i].y - dense[i - 1].y);
  }
  const length = cum[dense.length - 1];

  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  let j = 0;
  for (let i = 0; i < n; i++) {
    const target = (i / (n - 1)) * length;
    while (j < dense.length - 2 && cum[j + 1] < target) j++;
    const seg = cum[j + 1] - cum[j] || 1;
    const u = clamp((target - cum[j]) / seg, 0, 1);
    xs[i] = lerp(dense[j].x, dense[j + 1].x, u);
    ys[i] = lerp(dense[j].y, dense[j + 1].y, u);
  }
  const angles = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1);
    const b = Math.min(n - 1, i + 1);
    angles[i] = Math.atan2(ys[b] - ys[a], xs[b] - xs[a]);
  }
  return { xs, ys, angles, length };
}

/** Point and tangent angle at fraction t of the curve's length. */
export function pointAt(curve: Curve, t: number) {
  const n = curve.xs.length;
  const f = clamp(t, 0, 1) * (n - 1);
  const i = Math.min(n - 2, Math.floor(f));
  const u = f - i;
  return {
    x: lerp(curve.xs[i], curve.xs[i + 1], u),
    y: lerp(curve.ys[i], curve.ys[i + 1], u),
    angle: curve.angles[Math.round(f)],
  };
}

const seedFor = (index: number) => 0x9e3779b1 ^ Math.imul(index + 1, 0x85ebca6b);

/**
 * Where stroke `index` sits in a W x H canvas. Deterministic for a given index and size.
 * `labelLength` (characters) nudges long labels onto longer, wider strokes.
 */
export function layoutStroke(index: number, W: number, H: number, labelLength: number): StrokeLayout {
  const r = mulberry32(seedFor(index));
  const long = clamp((labelLength - 6) / 20, 0, 1);
  const span = lerp(SPAN[0], SPAN[1], 0.6 * long + 0.4 * r()) * W;
  const width = lerp(WIDTH[0], WIDTH[1], 0.6 * long + 0.4 * r()) * Math.min(H, WIDTH_ASPECT * W);
  const tilt = (lerp(TILT[0], TILT[1], r()) * Math.PI) / 180;
  const bow = lerp(BOW[0], BOW[1], r()) * H * (r() < 0.5 ? -1 : 1);
  const cx = W / 2 + (r() - 0.5) * 0.04 * W;
  let cy = H / 2 + LANES[index % LANES.length] * H;

  const local = [0, 1 / 3, 2 / 3, 1].map((u, i) => {
    const jitter = i === 0 || i === 3 ? 0 : (r() - 0.5) * 0.3 * bow;
    return { x: (u - 0.5) * span, y: bow * Math.sin(Math.PI * u) + jitter - bow * 0.58 };
  });
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const rotated = local.map((p) => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }));

  // Keep the whole stroke (plus half its width) inside the canvas.
  const pad = width * 0.6 + H * 0.03;
  const minY = Math.min(...rotated.map((p) => p.y));
  const maxY = Math.max(...rotated.map((p) => p.y));
  cy = clamp(cy, pad - minY, H - pad - maxY);

  const curve = sampleCurve(rotated.map((p) => ({ x: p.x + cx, y: p.y + cy })));
  return { curve, width, span };
}

// ---- Bristles --------------------------------------------------------------------------------

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Same hue, lighter (amount > 0, towards white) or deeper (amount < 0, darkened without greying). */
export function shade(hex: string, amount: number) {
  const rgb = hexToRgb(hex);
  // Pale colours turn grey when darkened, so darken them less.
  const dim = 1 - 0.7 * ((rgb[0] + rgb[1] + rgb[2]) / 765) ** 2;
  const f =
    amount >= 0
      ? (c: number) => Math.round(lerp(c, 255, amount))
      : (c: number) => Math.round(c * (1 + amount * dim));
  return `rgb(${rgb.map(f).join(",")})`;
}

export type Bristle = {
  lineWidth: number;
  alpha: number;
  color: string;
  /** Where along the stroke (0..1) this bristle touches down and lifts off. */
  startT: number;
  endT: number;
  /** How far behind the brush head it trails, in stroke widths (curves the leading edge). */
  lag: number;
  /** Where (0..1) this bristle's line thins to 75 % and then 50 %: staggered so there is no seam. */
  thin: [number, number];
  /** Precomputed path: position per sample, and whether paint is laid there (dry gaps). */
  xs: Float32Array;
  ys: Float32Array;
  on: Uint8Array;
};

export type PreparedStroke = {
  layout: StrokeLayout;
  color: string;
  bristles: Bristle[];
  /** Body underpaint outline (closed polygon in sample order: left edge forward, right edge back). */
  bodyLeft: Float32Array; // x,y pairs
  bodyRight: Float32Array;
  /** Body starts and runs out at these fractions of the stroke. */
  bodyStart: number;
  bodyEnd: number;
};

/**
 * Build every bristle path for a stroke once, so drawing a frame is just stroking paths.
 * All randomness comes from the stroke index.
 */
export function prepareStroke(index: number, layout: StrokeLayout, color: string): PreparedStroke {
  const r = mulberry32(seedFor(index) ^ 0x51ed27);
  const { curve, width } = layout;
  const n = curve.xs.length;
  const scale = clamp(width / 110, 0.45, 1.3);
  const deep = relativeLuminance(color) < DEEP_LUMINANCE;

  type Spec = {
    offset: number;
    lineWidth: number;
    alpha: number;
    color: string;
    startT: number;
    endT: number;
    lag: number;
    dryBias: number;
    wobble: number;
    seed: number;
  };
  const specs: Spec[] = [];
  const count = Math.round(clamp(width * BRISTLE_DENSITY, 26, 70));

  // A few bristles that carry less paint: narrow lanes that open up partway along.
  const gaps: [number, number][] = [];
  const gapCount = 2 + Math.floor(r() * 3);
  for (let g = 0; g < gapCount; g++) {
    const c = lerp(-0.36, 0.36, r());
    gaps.push([c, c + lerp(0.006, 0.016, r())]);
  }

  for (let i = 0; i < count; i++) {
    const offset = (i + 0.5) / count - 0.5 + (r() - 0.5) * (0.9 / count);
    const edge = Math.abs(offset) * 2; // 0 at the centre, 1 at the edge
    // Bristles in a gap lane run out early, so the lane opens up partway along the stroke.
    const inGap = gaps.some(([lo, hi]) => offset > lo && offset < hi);
    const tone = r();
    specs.push({
      offset,
      lineWidth: lerp(2.2, 5.4, r()) * scale,
      // Gouache is opaque: loaded bristles lay near-solid paint (labels need it for contrast).
      alpha: lerp(deep ? 0.86 : 0.72, 1, r()) * (1 - 0.35 * edge ** 3),
      // Mostly the base colour, some deeper and some lighter bristles for depth. Deep colours carry
      // light text, so they get no lighter bristles and a slightly deeper body instead.
      color: deep
        ? shade(color, tone < 0.3 ? -lerp(0.1, 0.2, r()) : -lerp(0.03, 0.08, r()))
        : tone < 0.2
          ? shade(color, -lerp(0.06, 0.14, r()))
          : tone > 0.88
            ? shade(color, lerp(0.04, 0.12, r()))
            : color,
      startT: 0.003 + r() * 0.018 + edge ** 2 * 0.04,
      endT: inGap ? lerp(0.68, 0.86, r()) : edge > 0.7 ? lerp(0.82, 0.96, r()) : lerp(0.93, 1, r()),
      lag: edge ** 2 * 0.1 + r() * 0.04,
      dryBias: edge ** 2 * 0.22 + (r() - 0.5) * 0.18,
      wobble: (0.3 + edge ** 3 * 2.2) * scale,
      seed: Math.floor(r() * 1e6),
    });
  }
  // Stray hairs that wander past the edges.
  const strays = 3 + Math.floor(r() * 3);
  for (let i = 0; i < strays; i++) {
    const side = r() < 0.5 ? -1 : 1;
    specs.push({
      offset: side * lerp(0.48, 0.55, r()),
      lineWidth: lerp(0.9, 1.6, r()) * scale,
      alpha: lerp(0.35, 0.6, r()),
      color,
      startT: lerp(0.03, 0.2, r()),
      endT: lerp(0.5, 0.92, r()),
      lag: 0.12,
      dryBias: 0.35,
      wobble: 3.2 * scale,
      seed: Math.floor(r() * 1e6),
    });
  }

  const gapScale = DRY_DASH * scale;
  const sharedSeed = Math.floor(r() * 1e6);
  const bristles: Bristle[] = specs.map((s) => {
    const xs = new Float32Array(n);
    const ys = new Float32Array(n);
    const on = new Uint8Array(n);
    const edge = Math.abs(s.offset) * 2;
    for (let k = 0; k < n; k++) {
      const t = k / (n - 1);
      const sPx = t * curve.length;
      const w = width * widthAt(t);
      const wob = (noise1(sPx / 70, s.seed) - 0.5) * 2 * s.wobble + (noise1(sPx / 9, s.seed + 7) - 0.5) * 0.6 * s.wobble;
      const off = s.offset * w + wob;
      const a = curve.angles[k];
      xs[k] = curve.xs[k] - Math.sin(a) * off;
      ys[k] = curve.ys[k] + Math.cos(a) * off;
      // Dry-brush breakup: own streaky noise blended with a shared "paper grain" term, so gaps line up a little.
      const nOwn = noise1(sPx / gapScale, s.seed + 13);
      const nShared = noise1(sPx / (gapScale * 0.7), sharedSeed + Math.round(s.offset * 6));
      const v = 0.6 * nOwn + 0.4 * nShared;
      const threshold = drynessAt(t) * 0.78 + s.dryBias * smoothstep(0.35, 1, t) + (edge > 0.9 ? 0.12 : 0);
      on[k] = v > threshold ? 1 : 0;
    }
    return {
      lineWidth: s.lineWidth,
      alpha: s.alpha,
      color: s.color,
      startT: s.startT,
      endT: s.endT,
      lag: s.lag,
      thin: [DRY_THIN[0] + (r() - 0.5) * 0.14, DRY_THIN[1] + (r() - 0.5) * 0.12],
      xs,
      ys,
      on,
    };
  });

  // Underpaint: narrower than the bristles, ragged edges, tapering out before the dry trail.
  const bodyLeft = new Float32Array(n * 2);
  const bodyRight = new Float32Array(n * 2);
  const bodySeed = Math.floor(r() * 1e6);
  const [bodyStart, bodyEnd] = BODY_RANGE;
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    const sPx = t * curve.length;
    const w =
      width * widthAt(t) * BODY_WIDTH * smoothstep(bodyStart, bodyStart + 0.04, t) * (1 - smoothstep(0.42, bodyEnd, t));
    const a = curve.angles[k];
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const jl = (noise1(sPx / 11, bodySeed) - 0.5) * 3 * scale;
    const jr = (noise1(sPx / 11, bodySeed + 99) - 0.5) * 3 * scale;
    bodyLeft[2 * k] = curve.xs[k] - nx * Math.max(0, w / 2 + jl);
    bodyLeft[2 * k + 1] = curve.ys[k] - ny * Math.max(0, w / 2 + jl);
    bodyRight[2 * k] = curve.xs[k] + nx * Math.max(0, w / 2 + jr);
    bodyRight[2 * k + 1] = curve.ys[k] + ny * Math.max(0, w / 2 + jr);
  }

  return { layout, color, bristles, bodyLeft, bodyRight, bodyStart, bodyEnd };
}

// ---- Drawing ---------------------------------------------------------------------------------

/**
 * Paint the stroke up to `progress` (0..1 of its length) onto a cleared layer, in CSS pixels.
 * Redrawn from scratch each frame (a few dozen paths), so there are never seams between frames.
 * `grain`, if given, is a repeating speckle pattern knocked out of the paint for a gouache tooth.
 */
export function paintStroke(
  ctx: CanvasRenderingContext2D,
  stroke: PreparedStroke,
  progress: number,
  W: number,
  H: number,
  grain?: CanvasPattern | null,
) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  if (progress <= 0) {
    ctx.restore();
    return;
  }
  const { layout, bristles, color } = stroke;
  const { curve, width } = layout;
  const n = curve.xs.length;
  const L = curve.length;
  const head = clamp(progress, 0, 1) * L;
  const toIndex = (sPx: number) => clamp(Math.floor((sPx / L) * (n - 1)), 0, n - 1);

  // 1. Underpaint.
  const bodyHead = Math.min(head - width * 0.08, stroke.bodyEnd * L);
  const ka = toIndex(stroke.bodyStart * L);
  const kb = toIndex(bodyHead);
  if (BODY_ALPHA > 0 && kb > ka + 1) {
    ctx.globalAlpha = BODY_ALPHA;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(stroke.bodyLeft[2 * ka], stroke.bodyLeft[2 * ka + 1]);
    for (let k = ka + 1; k <= kb; k++) ctx.lineTo(stroke.bodyLeft[2 * k], stroke.bodyLeft[2 * k + 1]);
    for (let k = kb; k >= ka; k--) ctx.lineTo(stroke.bodyRight[2 * k], stroke.bodyRight[2 * k + 1]);
    ctx.closePath();
    ctx.fill();
  }

  // 2. Bristles.
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";
  // As a bristle dries it lays a thinner line: draw each path in chunks of decreasing width.
  for (const b of bristles) {
    const chunks = [
      [0, toIndex(b.thin[0] * L), 1],
      [toIndex(b.thin[0] * L), toIndex(b.thin[1] * L), 0.75],
      [toIndex(b.thin[1] * L), n - 1, 0.5],
    ] as const;
    const k0 = toIndex(b.startT * L);
    const k1 = toIndex(Math.min(head - b.lag * width, b.endT * L));
    if (k1 <= k0) continue;
    ctx.globalAlpha = b.alpha;
    ctx.strokeStyle = b.color;
    for (const [c0, c1, thin] of chunks) {
      const from = Math.max(k0, c0);
      const to = Math.min(k1, c1);
      if (to <= from) continue;
      ctx.lineWidth = b.lineWidth * thin;
      ctx.beginPath();
      let pen = false;
      for (let k = from; k <= to; k++) {
        if (b.on[k]) {
          if (pen) ctx.lineTo(b.xs[k], b.ys[k]);
          else ctx.moveTo(b.xs[k], b.ys[k]);
          pen = true;
        } else pen = false;
      }
      ctx.stroke();
    }
  }

  // 3. Load profile: thin the paint towards the dry end. The chord is a close enough proxy for t.
  const a = { x: curve.xs[0], y: curve.ys[0] };
  const z = { x: curve.xs[n - 1], y: curve.ys[n - 1] };
  const g = ctx.createLinearGradient(a.x, a.y, z.x, z.y);
  for (const t of [0, DRY_FROM, 0.7, 0.8, 0.9, 1]) g.addColorStop(t, `rgba(0,0,0,${alphaAt(t)})`);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // 4. Paper tooth.
  if (grain) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/** Fill a small square context with sparse soft speckles, for use as a repeating grain pattern. */
export function drawGrain(ctx: CanvasRenderingContext2D, size: number, seed = 7) {
  const r = mulberry32(seed);
  ctx.clearRect(0, 0, size, size);
  const dots = Math.round(size * size * 0.02);
  ctx.fillStyle = "#000";
  for (let i = 0; i < dots; i++) {
    ctx.globalAlpha = lerp(0.05, 0.2, r());
    const d = lerp(0.5, 1.3, r());
    ctx.fillRect(r() * size, r() * size, d, d);
  }
  ctx.globalAlpha = 1;
}
