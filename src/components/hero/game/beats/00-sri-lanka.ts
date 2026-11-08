import { WINDOW_FACE } from "../sprites/dulini";
import { AIRPORT_SIGN, AT, PALM_A, PALM_B, PLANE, PLANE_WINDOW } from "../sprites/landmarks";
import { BEAT, IRIS_OPEN_MS } from "../timeline";
import { easeOut, type World } from "../world";
import { idleFrame, msIn, walkFrame, WALK_SPEED, type Beat } from "./common";

/** Beat 0: on the beach by the palms, then a walk to the little plane. */
export const FOCUS = 150;
/** She stands until this ms, then walks; she is aboard once she reaches BOARD_X. */
export const WALK_AT = 900;
export const BOARD_X = AT.plane + 14;
export const BOARD_MS = WALK_AT + (BOARD_X - AT.start) / WALK_SPEED;
/** Propeller: spinning once she is aboard. */
export const propFrame = (t: number) => Math.floor(t / 60) % 2;

export function drawPlaneParked(g: World, faceIn: boolean, spinning: boolean) {
  const s = PLANE.ground[spinning ? propFrame(g.t) : 0];
  g.spr(s, AT.plane, -s.h);
  if (faceIn) g.spr(WINDOW_FACE, AT.plane + PLANE_WINDOW.x, -s.h + PLANE_WINDOW.y);
}

export const sriLanka: Beat = {
  focus: () => FOCUS,
  scenery(g) {
    g.spr(PALM_B, AT.palmB, -PALM_B.h);
    g.spr(PALM_A, AT.palmA, -PALM_A.h);
    g.spr(AIRPORT_SIGN, AT.sign, -AIRPORT_SIGN.h);
  },
  actors(g, p) {
    const m = msIn(BEAT.sriLanka, p);
    const aboard = m >= BOARD_MS;
    if (!aboard) {
      // Drawn before the plane, so she walks behind its fuselage.
      if (m < WALK_AT) g.stand(idleFrame(m), AT.start);
      else g.stand(walkFrame(m - WALK_AT), AT.start + (m - WALK_AT) * WALK_SPEED);
    }
    drawPlaneParked(g, aboard, m > WALK_AT);
    if (m < IRIS_OPEN_MS) return { x: AT.start, y: -16, closed: 1 - easeOut(m / IRIS_OPEN_MS) };
  },
};
