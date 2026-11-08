import { WINDOW_FACE } from "../sprites/dulini";
import { AT, PLANE, PLANE_WINDOW, SKYLINE_H, SKYLINE_TOWERS, SKYLINE_W } from "../sprites/landmarks";
import { PALETTE } from "../palette";
import { BEAT, BEAT_MS } from "../timeline";
import { lerp, SHORE_IN, smooth, span, type World } from "../world";
import { FOCUS, propFrame } from "./00-sri-lanka";
import { msIn, type Beat } from "./common";

/** Beat 1: take-off and the long flight over the ocean. */
export const CRUISE = 0.15; // px per ms
const ACCEL_MS = 1200;
/** The plane starts to lift off this long into the flight beat. */
export const TAKEOFF_MS = 700;
export const ALTITUDE = 96;

/** Plane's left edge along the whole flight (beats 1 and 2), by ms since take-off began. */
export function planeX(ms: number) {
  if (ms <= 0) return AT.plane;
  if (ms < ACCEL_MS) return AT.plane + 0.5 * (CRUISE / ACCEL_MS) * ms * ms;
  return AT.plane + 0.5 * CRUISE * ACCEL_MS + CRUISE * (ms - ACCEL_MS);
}
/** Height of the plane's underside above the ground. */
export function planeLift(ms: number) {
  return ALTITUDE * smooth(span(ms, TAKEOFF_MS, 2400));
}

export function drawPlane(g: World, ms: number, faceIn: boolean) {
  const lift = planeLift(ms);
  const set = lift > 10 ? PLANE.air : PLANE.ground;
  const s = set[propFrame(g.t)];
  const x = planeX(ms);
  const y = -s.h - lift;
  g.spr(s, x, y);
  if (faceIn) g.spr(WINDOW_FACE, x + PLANE_WINDOW.x, y + PLANE_WINDOW.y);
}

/** City skylines on a parallax layer behind Melbourne; they rise out of the sea near the end of the flight. */
const SKYLINE_K = 0.5;
export function drawSkyline(g: World) {
  const rise = 1 - smooth(span(g.phase(BEAT.flight), 0.55, 1));
  if (rise >= 1) return;
  const [from, to] = g.visible(SKYLINE_K);
  const sink = Math.round(rise * SKYLINE_H);
  for (let x = SHORE_IN * SKYLINE_K + 10; x < to; x += SKYLINE_W + 14) {
    if (x + SKYLINE_W < from) continue;
    g.rect(PALETTE.c, x, -6 + sink, SKYLINE_W, 6, SKYLINE_K);
    for (const [tx, w, h] of SKYLINE_TOWERS) {
      const top = -h + sink;
      g.rect(PALETTE.c, x + tx, top, w, h, SKYLINE_K);
      g.rect(PALETTE.a, x + tx + 2, top + 3, 1, h - 7, SKYLINE_K);
      if (w > 7) g.rect(PALETTE.a, x + tx + w - 3, top + 3, 1, h - 7, SKYLINE_K);
    }
  }
}

export const FLIGHT_MS = BEAT_MS[BEAT.flight];

export const flight: Beat = {
  focus: (p) => lerp(FOCUS, planeX(msIn(BEAT.flight, p)) + 32, smooth(span(msIn(BEAT.flight, p), 0, 1400))),
  actors(g, p) {
    drawPlane(g, msIn(BEAT.flight, p), true);
  },
};
