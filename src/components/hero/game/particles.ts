import { PALETTE } from "./palette";
import { hash, type World } from "./world";

/**
 * Particles without state: every particle's position is a closed-form function of its age, seeded by its index.
 * That keeps them in step with the scrubber and the pause, and costs nothing between bursts. No React here.
 */

export type Kind = "dust" | "sparkle" | "leaf" | "paper" | "note" | "debris" | "bubble";

const LOOK: Record<Kind, { colors: string[]; w: number; h: number }> = {
  dust: { colors: [PALETTE.r, PALETTE.g, PALETTE.b], w: 2, h: 2 },
  sparkle: { colors: [PALETTE.o, PALETTE.w, PALETTE.l], w: 1, h: 1 },
  leaf: { colors: [PALETTE.o, PALETTE.O, PALETTE.R], w: 2, h: 1 },
  paper: { colors: [PALETTE.w, PALETTE.b], w: 3, h: 2 },
  note: { colors: [PALETTE.o, PALETTE.l, PALETTE.p], w: 3, h: 3 },
  debris: { colors: [PALETTE.Y, PALETTE.q, PALETTE.g], w: 3, h: 3 },
  bubble: { colors: [PALETTE.w, PALETTE.a], w: 1, h: 1 },
};

/** Particle counts and feel, so they can be tuned in one place. */
export const DUST_COUNT = 10;
export const SPARKLE_COUNT = 8;
export const DEBRIS_COUNT = 9;
export const WIND_RATE = 26; // particles per second at full gust

export type Burst = {
  seed: number;
  n: number;
  /** ms since the burst started (negative: not yet). */
  age: number;
  x: number;
  y: number;
  kind: Kind;
  life: number;
  /** px per second */
  speed: number;
  /** Direction in radians (0 = right, -π/2 = up) and the spread around it. */
  dir: number;
  spread: number;
  /** px per second² (positive pulls down). */
  gravity: number;
  /** Stop at the ground line instead of falling through. */
  floor?: boolean;
};

export function burst(g: World, b: Burst) {
  if (g.calm || b.age < 0 || b.age > b.life) return;
  const look = LOOK[b.kind];
  for (let i = 0; i < b.n; i++) {
    const r1 = hash(b.seed, i, 1);
    const r2 = hash(b.seed, i, 2);
    const r3 = hash(b.seed, i, 3);
    const life = b.life * (0.55 + 0.45 * r3);
    if (b.age > life) continue;
    const a = b.age / 1000;
    const ang = b.dir + (r1 - 0.5) * b.spread;
    const v = b.speed * (0.4 + 0.6 * r2);
    const x = b.x + Math.cos(ang) * v * a;
    let y = b.y + Math.sin(ang) * v * a + 0.5 * b.gravity * a * a;
    if (b.floor) y = Math.min(y, -look.h);
    const c = look.colors[i % look.colors.length];
    if (b.kind === "sparkle") {
      // A small plus that shrinks to a dot.
      const big = b.age < life * 0.6;
      g.rect(c, x, y, 1, 1);
      if (big) {
        g.rect(c, x - 1, y, 3, 1);
        g.rect(c, x, y - 1, 1, 3);
      }
    } else {
      g.rect(c, x, y, look.w, look.h);
    }
  }
}

/** A dust puff where feet (or floors) hit the ground. */
export function dust(g: World, seed: number, age: number, x: number, y = -2, n = DUST_COUNT) {
  burst(g, { seed, n, age, x, y, kind: "dust", life: 650, speed: 34, dir: -Math.PI / 2, spread: Math.PI * 1.1, gravity: 40, floor: true });
}

export function sparkle(g: World, seed: number, age: number, x: number, y: number, n = SPARKLE_COUNT) {
  burst(g, { seed, n, age, x, y, kind: "sparkle", life: 700, speed: 30, dir: 0, spread: Math.PI * 2, gravity: 0 });
}

/**
 * The wind: leaves, paper and sticky notes streaming across the screen from the left, `strength` 0..1.
 * `t` is ms since the wind began; particles are spawned on a fixed schedule so this stays a pure function of t.
 */
export function wind(g: World, seed: number, t: number, strength: number, until = Infinity) {
  if (g.calm || t < 0 || strength <= 0) return;
  const [from, to] = g.visible();
  const width = to - from + 40;
  const step = 1000 / WIND_RATE;
  const crossMs = 1400;
  const first = Math.max(0, Math.floor((t - crossMs) / step));
  const last = Math.floor(Math.min(t, until) / step);
  const kinds: Kind[] = ["leaf", "paper", "note", "leaf"];
  for (let i = first; i <= last; i++) {
    // Thin out the stream while the gust builds.
    if (hash(seed, i, 9) > strength) continue;
    const age = t - i * step;
    if (age < 0 || age > crossMs) continue;
    const k = kinds[Math.floor(hash(seed, i, 1) * kinds.length)];
    const look = LOOK[k];
    const speedK = 0.7 + 0.5 * hash(seed, i, 2);
    const x = from - 20 + (age / crossMs) * width * speedK * 1.3;
    const baseY = -12 - hash(seed, i, 3) * 120;
    const y = baseY + Math.sin(age / 90 + i) * 3 + (age / crossMs) * 10;
    g.rect(look.colors[i % look.colors.length], x, y, look.w, look.h);
  }
}
