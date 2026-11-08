import { sparkle, wind } from "../particles";
import { IDLE } from "../sprites/dulini";
import {
  AT,
  CANVA_CROWN,
  CANVA_DOOR,
  CANVA_DOORS,
  CANVA_FACADE,
  CANVA_FLOOR_H,
  CANVA_FLOORS,
  CANVA_H,
  CANVA_INSIDE,
  CANVA_LOGO,
  CANVA_W,
  CANVA_WALL,
} from "../sprites/landmarks";
import { person, personFrames } from "../sprites/people";
import { CHAT, HEART, TERMINAL } from "../sprites/props";
import { dither, lean } from "../sprites/types";
import { PALETTE } from "../palette";
import { BEAT } from "../timeline";
import { clamp, hash, lerp, smooth, span, type World } from "../world";
import { dissolve, msIn, type Beat } from "./common";
import { doorOpen, HAND_FOCUS } from "./07-hand";

/** Beat 8: inside Canva. Connections to a dozen people, then a terminal streaming text, then the wind. */
export const CANVA_FOCUS = AT.canva + CANVA_W / 2;
const LINK_AT = 700;
const LINK_EVERY = 150;
const LINK_MS = 260;
const LINKS_OFF = 3900;
const TERM_AT = 2800;
const TERM_LINES = 7;
const TERM_LINE_MS = 210;
export const WIND_AT = 4200;
const WIND_FULL = 5200;

/** Standing height of floor f (0 = top floor) above which people stand: world y of the slab top. */
export const floorY = (f: number) => -CANVA_H + CANVA_CROWN + f * CANVA_FLOOR_H + CANVA_FLOOR_H - 3;
export const DULINI_X = AT.canva + 20;
export const DULINI_FLOOR = 0;

/** Twelve colleagues: four on each of the lower three floors. */
export const CANVA_PEOPLE = Array.from({ length: 12 }, (_, i) => {
  const f = 1 + Math.floor(i / 4);
  const slot = i % 4;
  return { f, x: AT.canva + 12 + slot * 16 + (f % 2) * 3, look: person(300 + i) };
});
// Links go out nearest first.
const LINK_ORDER = CANVA_PEOPLE.map((c, i) => ({ i, d: Math.hypot(c.x - DULINI_X, floorY(c.f) - floorY(0)) }))
  .sort((a, b) => a.d - b.d)
  .map((o) => o.i);

/** Wind strength 0..1 at the current time (beat 8 builds it, beat 9 lets it die down). */
export function windStrength(g: World) {
  if (g.beat === BEAT.canva) return smooth(span(msIn(BEAT.canva, g.p), WIND_AT, WIND_FULL));
  if (g.beat === BEAT.fall) return 1 - smooth(span(msIn(BEAT.fall, g.p), 1200, 3000));
  return 0;
}

function facadeLevel(g: World) {
  if (g.beat === BEAT.canva) return dissolve(msIn(BEAT.canva, g.p), 0);
  if (g.beat === BEAT.fall) return dissolve(msIn(BEAT.fall, g.p), 0, 100, true);
  return 0;
}

/** Pixel line (for the connections). */
function line(g: World, color: string, x0: number, y0: number, x1: number, y1: number) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let k = 0; k <= n; k += 1) {
    const s = n ? k / n : 0;
    g.rect(color, Math.round(lerp(x0, x1, s)), Math.round(lerp(y0, y1, s)), 1, 1);
  }
}

function drawCanvaInside(g: World, strength: number) {
  const x = AT.canva;
  const y = -CANVA_H;
  g.spr(CANVA_INSIDE, x, y);
  // Side walls with window strips; they rattle in the wind.
  const rattle = strength > 0.2 && !g.calm ? (Math.floor(g.t / 70) % 2 ? 1 : -1) : 0;
  for (const [wx, dx] of [
    [x, rattle],
    [x + CANVA_W - CANVA_WALL, -rattle],
  ] as const) {
    g.rect(PALETTE.B, wx, y + CANVA_CROWN, CANVA_WALL, CANVA_H - CANVA_CROWN);
    for (let f = 0; f < CANVA_FLOORS; f++) {
      const top = y + CANVA_CROWN + f * CANVA_FLOOR_H;
      g.rect(PALETTE.l, wx + 1 + dx, top + 4, 2, 10);
      g.rect(PALETTE.l, wx + 1 - dx, top + 18, 2, 10);
    }
  }
}

export function drawCanva(g: World) {
  const inside = g.beat === BEAT.canva || g.beat === BEAT.fall;
  const x = AT.canva;
  const y = -CANVA_H;
  if (inside) drawCanvaInside(g, windStrength(g));
  else {
    g.spr(CANVA_FACADE, x, y);
    const open = g.beat === BEAT.hand && doorOpen(msIn(BEAT.hand, g.p));
    g.spr(open ? CANVA_DOORS.open : CANVA_DOORS.shut, x + CANVA_DOOR.x, -CANVA_DOOR.h);
  }
  g.logo("canva", x + CANVA_LOGO.x, y + CANVA_LOGO.y, CANVA_LOGO.w, CANVA_LOGO.h);
}

/** Facade over the cutaway while it dissolves (drawn after the people). */
export function drawCanvaFacadeOver(g: World) {
  const level = facadeLevel(g);
  const f = dither(CANVA_FACADE, level);
  if (f && (g.beat === BEAT.canva || g.beat === BEAT.fall)) {
    g.spr(f, AT.canva, -CANVA_H);
    g.logo("canva", AT.canva + CANVA_LOGO.x, -CANVA_H + CANVA_LOGO.y, CANVA_LOGO.w, CANVA_LOGO.h);
  }
}

export function drawCanvaPeople(g: World, strength: number) {
  const leaning = strength > 0.3 && !g.calm;
  CANVA_PEOPLE.forEach((c, i) => {
    const f = personFrames(c.look.style);
    let s = f.idle[Math.floor((g.t + i * 230) / 560) % 2];
    if (leaning) s = lean(s, 2, 14);
    g.stand(s, c.x, -floorY(c.f), c.look.map, c.look.variant);
  });
}

/** The terminal's streaming text: rows of short pixel words. */
function drawTerminal(g: World, m: number) {
  const tx = DULINI_X + 12;
  const ty = floorY(0) - 30;
  g.spr(TERMINAL, tx, ty);
  const shown = Math.floor((m - TERM_AT - 200) / TERM_LINE_MS);
  if (shown < 0) return;
  const first = Math.max(0, shown - TERM_LINES + 1);
  for (let row = first; row <= shown; row++) {
    const y = ty + 6 + (row - first) * 3;
    const isPrompt = row % 3 === 0;
    const len = 8 + Math.floor(hash(row, 5) * 20);
    const typed = row === shown ? clamp((m - TERM_AT - 200 - row * TERM_LINE_MS) / TERM_LINE_MS) : 1;
    let x = tx + 2;
    if (isPrompt) {
      g.rect(PALETTE.o, x, y, 1, 1);
      x += 2;
    }
    let drawn = 0;
    const max = Math.floor(len * typed);
    for (let w = 0; drawn < max; w++) {
      const wl = 1 + Math.floor(hash(row, w, 9) * 4);
      const n = Math.min(wl, max - drawn);
      g.rect(isPrompt ? PALETTE.w : PALETTE.l, x, y, n, 1);
      x += wl + 1;
      drawn += wl;
      if (x > tx + TERMINAL.w - 3) break;
    }
  }
}

export const canva: Beat = {
  focus: (p) => lerp(HAND_FOCUS, CANVA_FOCUS, smooth(span(msIn(BEAT.canva, p), 0, 1200))),
  scenery: drawCanva,
  actors(g, p) {
    const m = msIn(BEAT.canva, p);
    const strength = windStrength(g);
    drawCanvaPeople(g, strength);
    const me = strength > 0.3 && !g.calm ? lean(IDLE[0], 2, 16) : IDLE[Math.floor(m / 520) % 2];
    g.stand(me, DULINI_X, -floorY(DULINI_FLOOR));

    // Connections, nearest first, each with a heart or a chat bubble once it lands.
    if (m < LINKS_OFF) {
      LINK_ORDER.forEach((idx, k) => {
        const t0 = LINK_AT + k * LINK_EVERY;
        if (m < t0) return;
        const c = CANVA_PEOPLE[idx];
        const s = clamp((m - t0) / LINK_MS);
        const x0 = DULINI_X + 2;
        const y0 = floorY(0) - 22;
        const x1 = c.x;
        const y1 = floorY(c.f) - 26;
        line(g, k % 2 ? PALETTE.B : PALETTE.o, x0, y0, lerp(x0, x1, s), lerp(y0, y1, s));
        if (s >= 1) g.spr(k % 2 ? CHAT : HEART, x1 - 4, y1 - 9);
      });
    }
    if (m >= TERM_AT) {
      drawTerminal(g, m);
      sparkle(g, 140, m - TERM_AT, DULINI_X + 28, floorY(0) - 20, 10);
    }
    wind(g, 11, m - WIND_AT, strength);
    drawCanvaFacadeOver(g);
  },
};

