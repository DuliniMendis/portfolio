import { burst, dust } from "../particles";
import { IDLE, JUMP_DOWN, JUMP_UP, LAND } from "../sprites/dulini";
import { AT, LEO_DOOR, SEER_GROUND_H, SEER_W, SEER_WINDOWS } from "../sprites/landmarks";
import { personFrames } from "../sprites/people";
import { BEAT } from "../timeline";
import { lerp, smooth, span, type World } from "../world";
import { msIn, type Beat } from "./common";
import {
  DROP_AT,
  DROP_EVERY,
  HER_WINDOW,
  LEAP_AT,
  HOP_AT,
  HOP_EVERY,
  HOP_MS,
  SEER_FOCUS,
  SEER_PEOPLE,
  seerState,
} from "./04-seer-grows";

/** Beat 5: the building shakes and drops floor by floor; everyone hops out safely; she leaps to Leonardo.Ai. */
const LEAP_MS = 1200;
export const LEO_ARRIVE_X = AT.leo + LEO_DOOR;
export const LEO_FOCUS_START = 1120;
/** When the Seer colleagues vanish, ms into the Leonardo.Ai beat (its camera move takes 1000 ms). */
const CROWD_GONE_MS = 1000;

/** Colleagues hopping out of the windows and standing clear (drawn while Seer is on screen). */
export function drawSeerCrowd(g: World) {
  const { m5, heights } = seerState(g);
  if (m5 < 0) return;
  // Window height above the ground at the moment each person hops (before anything dropped).
  for (const who of SEER_PEOPLE) {
    const t0 = HOP_AT + who.order * HOP_EVERY;
    const age = m5 - t0;
    if (age < 0) continue;
    const frames = personFrames(who.look.style);
    const below = heights.slice(0, who.floor - 1).reduce((a, b) => a + b, 0);
    const winLift = SEER_GROUND_H + below + 2;
    const x0 = AT.seer + SEER_WINDOWS[who.win] + 6;
    if (age < HOP_MS) {
      const s = age / HOP_MS;
      const lift = winLift * (1 - s * s) + 22 * s * (1 - s);
      const f = frames.tumble[Math.floor(age / 110) % 4];
      g.stand(f, lerp(x0, who.landX, s), lift, who.look.map, who.look.variant);
    } else {
      dust(g, 300 + who.order, age - HOP_MS, who.landX, -2, 5);
      const cheering = Math.floor((g.t + who.order * 170) / 320) % 2 === 0 && age > HOP_MS + 500;
      const f = cheering ? frames.cheer : frames.idle[Math.floor((g.t + who.order * 90) / 520) % 2];
      g.stand(f, who.landX, 0, who.look.map, who.look.variant);
    }
  }
  // Bits of debris fly as floors drop.
  for (let d = 0; d < 6; d++) {
    burst(g, { seed: 700 + d, n: 6, age: m5 - (DROP_AT + d * DROP_EVERY), x: AT.seer + SEER_W / 2, y: -10, kind: "debris", life: 700, speed: 60, dir: -Math.PI / 2, spread: 2.4, gravity: 260, floor: true });
  }
}

/** The leap out of her top-floor window to Leonardo.Ai; `from` is the window sill's height above the ground. */
function leap(g: World, m: number, from: number) {
  const s = span(m, LEAP_AT, LEAP_AT + LEAP_MS);
  const lift = from * (1 - s * s) + 46 * s * (1 - s);
  g.stand(s < 0.5 ? JUMP_UP : JUMP_DOWN, lerp(AT.seer + SEER_WINDOWS[HER_WINDOW] + 6, LEO_ARRIVE_X, s), lift);
}

export const seerCrumbles: Beat = {
  focus: (p) => lerp(SEER_FOCUS, LEO_FOCUS_START, smooth(span(msIn(BEAT.seerCrumbles, p), LEAP_AT, LEAP_AT + 1400))),
  scenery(g) {
    if (g.beat === BEAT.seerCrumbles) drawSeerCrowd(g);
    else if (g.beat === BEAT.leonardo) {
      // Once the camera has settled on Leonardo.Ai the Seer colleagues vanish in a puff.
      const m = msIn(BEAT.leonardo, g.p);
      if (m < CROWD_GONE_MS) drawSeerCrowd(g);
      else for (const who of SEER_PEOPLE) dust(g, 900 + who.order, m - CROWD_GONE_MS, who.landX, -10, 6);
    }
  },
  actors(g, p) {
    const m = msIn(BEAT.seerCrumbles, p);
    // Until the leap she is in her top-floor window (drawn with the building). Nothing has dropped yet when she jumps.
    const { heights } = seerState(g);
    const sill = SEER_GROUND_H + heights.slice(0, -1).reduce((a, b) => a + b, 0) + 3;
    if (m < LEAP_AT) return;
    if (m < LEAP_AT + LEAP_MS) leap(g, m, sill);
    else {
      const landed = m - (LEAP_AT + LEAP_MS);
      dust(g, 51, landed, LEO_ARRIVE_X);
      g.stand(landed < 260 ? LAND : IDLE[Math.floor(m / 520) % 2], LEO_ARRIVE_X);
    }
  },
};
