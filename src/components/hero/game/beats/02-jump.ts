import { JUMP_DOWN, JUMP_UP, LAND } from "../sprites/dulini";
import { AT } from "../sprites/landmarks";
import { dust } from "../particles";
import { BEAT } from "../timeline";
import { lerp, smooth, span } from "../world";
import { ALTITUDE, drawPlane, FLIGHT_MS, planeX } from "./01-flight";
import { msIn, walkFrame, type Beat } from "./common";

/** Beat 2: over the University of Melbourne she jumps out, lands, and walks to the door. */
export const JUMP_AT = 500;
export const LAND_AT = 1500;
const WALK_AT = 1750;
export const LAND_X = AT.uni - 24;
/** Where she ends up: her seat at the desk inside (beat 3). */
export const SEAT_X = AT.uni + 10;
export const UNI_FOCUS = AT.uni + 44;

const flightMs = (m: number) => FLIGHT_MS + m;

export const jump: Beat = {
  focus(p) {
    const m = msIn(BEAT.jump, p);
    return lerp(planeX(flightMs(m)) + 32, UNI_FOCUS, smooth(span(m, 300, 1600)));
  },
  actors(g, p) {
    const m = msIn(BEAT.jump, p);
    drawPlane(g, flightMs(m), m < JUMP_AT);
    if (m < JUMP_AT) return;
    if (m < LAND_AT) {
      const s = (m - JUMP_AT) / (LAND_AT - JUMP_AT);
      const x0 = planeX(flightMs(JUMP_AT)) + 18;
      const h0 = ALTITUDE + 6;
      const lift = h0 * (1 - s * s) + 30 * s * (1 - s);
      g.stand(s < 0.45 ? JUMP_UP : JUMP_DOWN, lerp(x0, LAND_X, s), lift);
      return;
    }
    dust(g, 21, m - LAND_AT, LAND_X);
    if (m < WALK_AT) g.stand(LAND, LAND_X);
    else g.stand(walkFrame(m - WALK_AT), lerp(LAND_X, SEAT_X, span(m, WALK_AT, msIn(BEAT.jump, 1))));
  },
};
