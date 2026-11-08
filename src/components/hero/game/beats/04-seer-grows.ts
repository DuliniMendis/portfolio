import { dust, sparkle } from "../particles";
import { IDLE } from "../sprites/dulini";
import {
  AT,
  SEER_CRACKS,
  SEER_FLOOR,
  SEER_FLOOR_H,
  SEER_FLOOR_LIT,
  SEER_FLOORS,
  SEER_GROUND,
  SEER_GROUND_H,
  SEER_LOGO,
  SEER_ROOF,
  SEER_ROOF_H,
  SEER_W,
  SEER_WINDOWS,
} from "../sprites/landmarks";
import { person, personFrames } from "../sprites/people";
import { RUBBLE } from "../sprites/props";
import { PALETTE } from "../palette";
import { crop } from "../sprites/types";
import { BEAT } from "../timeline";
import { bounce, clamp, lerp, smooth, span, type World } from "../world";
import { msIn, walkFrame, WALK_SPEED, type Beat } from "./common";
import { UNI_FOCUS } from "./02-jump";

/** Beats 4 and 5 share the Seer building. Beat 4: she walks in, appears on the roof and the building grows. */
export const SEER_DOOR = AT.seer + SEER_W / 2;
export const SEER_FOCUS = SEER_DOOR;
const UNI_DOOR = AT.uni + 44;
const ENTER_MS = (SEER_DOOR - UNI_DOOR) / WALK_SPEED;
const ROOF_AT = ENTER_MS + 200;
const GROW_AT = 2300;
const GROW_EVERY = 480;
const GROW_MS = 380;
const POP_DELAY = 200;
const POP_EVERY = 90;

/** Seer crumbles (beat 5): timings shared with 05-seer-crumbles. */
export const SHAKE_MS = 900;
export const CRACK_AT = 200;
export const HOP_AT = 380;
export const HOP_EVERY = 55;
export const HOP_MS = 520;
export const DROP_AT = 1100;
export const DROP_EVERY = 300;
export const RUBBLE_AT = DROP_AT + (SEER_FLOORS + 1) * DROP_EVERY;

/** One window per colleague: floor (1-based from the bottom), window index, and a look. */
export const SEER_PEOPLE = Array.from({ length: SEER_FLOORS * SEER_WINDOWS.length }, (_, i) => {
  const floor = Math.floor(i / SEER_WINDOWS.length) + 1;
  const win = i % SEER_WINDOWS.length;
  // Hop order mixes floors so people leave all over the building at once.
  const order = (i * 7) % (SEER_FLOORS * SEER_WINDOWS.length);
  // Where they land: left of the building for the first two windows, right for the third.
  const side = win < 2 ? -1 : 1;
  const landX = side < 0 ? AT.seer - 10 - ((i * 5) % 30) : AT.seer + SEER_W + 8 + ((i * 3) % 10);
  return { floor, win, order, side, landX, look: person(100 + i) };
});

/** Height of each upper floor at beat-4 time m (0 when not built; overshoots while it bounces). */
function floorHeight(k: number, m: number) {
  const s = span(m, GROW_AT + (k - 1) * GROW_EVERY, GROW_AT + (k - 1) * GROW_EVERY + GROW_MS);
  return s <= 0 ? 0 : Math.round(SEER_FLOOR_H * clamp(bounce(s), 0, 1.25));
}
const windowLitAt = (k: number, j: number) => GROW_AT + (k - 1) * GROW_EVERY + POP_DELAY + j * POP_EVERY;

/** The building's state at any time: which floors stand, how tall, shake and cracks. */
export function seerState(g: World) {
  const m4 = msIn(BEAT.seerGrows, g.phase(BEAT.seerGrows));
  const started5 = g.phase(BEAT.seerCrumbles) > 0 || g.beat > BEAT.seerCrumbles;
  const m5 = started5 ? msIn(BEAT.seerCrumbles, g.phase(BEAT.seerCrumbles)) : -1;
  // Floors already dropped (from the bottom). The ground floor goes last.
  const dropped = m5 < 0 ? 0 : clamp(Math.floor((m5 - DROP_AT) / DROP_EVERY) + 1, 0, SEER_FLOORS + 1);
  const heights = Array.from({ length: SEER_FLOORS }, (_, i) => floorHeight(i + 1, m4));
  return { m4, m5, dropped, heights };
}

/** Height of the roof above the ground right now (where she stands while it grows). */
export function seerRoofLift(g: World) {
  const { heights, dropped } = seerState(g);
  const standing = heights.slice(Math.min(dropped, SEER_FLOORS)).reduce((a, b) => a + b, 0);
  return (dropped > SEER_FLOORS ? 0 : SEER_GROUND_H) + standing + SEER_ROOF_H;
}

export function drawSeer(g: World) {
  const { m4, m5, dropped, heights } = seerState(g);
  if (m5 >= RUBBLE_AT || dropped > SEER_FLOORS) {
    g.spr(RUBBLE, AT.seer + 7, -RUBBLE.h);
    return;
  }
  const shake = m5 >= 0 && m5 < SHAKE_MS + DROP_EVERY * 6 ? (Math.floor(m5 / 50) % 2 ? 1 : -1) : 0;
  const x = AT.seer + shake;
  let y = 0;
  // Ground floor (it drops last, after all the upper floors).
  const groundStands = dropped <= SEER_FLOORS;
  if (groundStands) {
    y -= SEER_GROUND_H;
    g.spr(SEER_GROUND, x, y);
    g.logo("seer", x + SEER_LOGO.x, y + SEER_LOGO.y, SEER_LOGO.w, SEER_LOGO.h);
  }
  for (let k = 1; k <= SEER_FLOORS; k++) {
    if (k <= dropped) continue;
    const h = heights[k - 1];
    if (h <= 0) continue;
    y -= h;
    // While it bounces, the floor is drawn at full height with wall above or a slice below.
    const full = h >= SEER_FLOOR_H;
    const lit = SEER_WINDOWS.map((_, j) => m4 >= windowLitAt(k, j));
    const anyLit = lit.some(Boolean);
    const base = anyLit ? SEER_FLOOR_LIT : SEER_FLOOR;
    if (full) {
      g.spr(base, x, y + (h - SEER_FLOOR_H));
      if (h > SEER_FLOOR_H) g.rect(PALETTE.w, x, y, SEER_W, h - SEER_FLOOR_H);
    } else g.spr(crop(base, 0, SEER_FLOOR_H - h, SEER_W, h), x, y);
    if (full) {
      const top = y + (h - SEER_FLOOR_H);
      SEER_WINDOWS.forEach((wx, j) => {
        const who = SEER_PEOPLE[(k - 1) * SEER_WINDOWS.length + j];
        const gone = m5 >= HOP_AT + who.order * HOP_EVERY;
        if (!lit[j]) return;
        if (gone) {
          g.rect(PALETTE.j, x + wx + 1, top + 3, 10, 9);
          return;
        }
        const f = personFrames(who.look.style).idle[Math.floor((g.t + j * 200) / 600) % 2];
        g.spr(crop(f, 5, 1, 10, 9), x + wx + 1, top + 3, who.look.map, who.look.variant);
      });
      if (m5 >= CRACK_AT) g.spr(SEER_CRACKS[k % 2], x, top);
    }
  }
  g.spr(SEER_ROOF, x - 2, y - SEER_ROOF_H);
  // Floors land in a dust cloud as they drop.
  if (m5 >= DROP_AT) {
    for (let d = 0; d <= SEER_FLOORS; d++) {
      const age = m5 - (DROP_AT + d * DROP_EVERY);
      dust(g, 500 + d, age, AT.seer + 6, -2, 8);
      dust(g, 520 + d, age, AT.seer + SEER_W - 6, -2, 8);
    }
  }
}

export const seerGrows: Beat = {
  focus: (p) => lerp(UNI_FOCUS, SEER_FOCUS, smooth(span(msIn(BEAT.seerGrows, p), 0, 2000))),
  scenery(g) {
    if (g.beat <= BEAT.seerCrumbles) drawSeer(g);
    else g.spr(RUBBLE, AT.seer + 7, -RUBBLE.h);
  },
  actors(g, p) {
    const m = msIn(BEAT.seerGrows, p);
    if (m < ENTER_MS) {
      g.stand(walkFrame(m), UNI_DOOR + m * WALK_SPEED);
      return;
    }
    if (m < ROOF_AT) return;
    const lift = seerRoofLift(g);
    sparkle(g, 41, m - ROOF_AT, SEER_DOOR, -lift - 16, 10);
    g.stand(IDLE[Math.floor(m / 520) % 2], SEER_DOOR, lift);
    // Each new floor lands with a little dust at the roof edge.
    for (let k = 1; k <= SEER_FLOORS; k++) {
      dust(g, 60 + k, m - (GROW_AT + (k - 1) * GROW_EVERY + GROW_MS * 0.6), AT.seer - 2, -lift + 2, 4);
    }
  },
};
