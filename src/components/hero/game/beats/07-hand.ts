import { dust, sparkle } from "../particles";
import { SIT_TYPE, TUMBLE } from "../sprites/dulini";
import { AT, CANVA_DOOR, HAND, LEO_FACADE, LEO_H } from "../sprites/landmarks";
import { personFrames } from "../sprites/people";
import { DESK_SIDE, LAPTOP_SIDE } from "../sprites/props";
import { dither } from "../sprites/types";
import { PALETTE } from "../palette";
import { BEAT } from "../timeline";
import { easeOut, lerp, smooth, span } from "../world";
import { msIn, type Beat } from "./common";
import { drawLeoDesks, drawPictures, LEO_FOCUS, LEO_PEOPLE, LEO_SEAT_X, leoFacadeLevel, PIC_POS } from "./06-leonardo";

/** Beat 7: a giant hand comes down and sweeps everyone, tumbling, into the Canva tower. */
const DOWN_MS = 800;
const SWEEP_AT = 1000;
const SWEEP_MS = 1800;
const SHUT_AT = 2950;
const UP_AT = 2900;
const HAND_X0 = AT.leo - 40;
const HAND_X1 = AT.canva - 36;
export const CANVA_DOOR_X = AT.canva + CANVA_DOOR.x;
export const HAND_FOCUS = AT.canva - 12;

export function handX(m: number) {
  return lerp(HAND_X0, HAND_X1, smooth(span(m, SWEEP_AT, SWEEP_AT + SWEEP_MS)));
}

/** Everyone in the office, left to right, with where they started. Dulini is first. */
const CROWD = [
  { x0: LEO_SEAT_X, dulini: true, look: null },
  ...LEO_PEOPLE.map((c) => ({ x0: c.x, dulini: false, look: c.look })),
];

/** True once a person has been swept inside (used by the tower's door). */
export function sweptX(m: number, i: number) {
  return Math.max(CROWD[i].x0, handX(m) + HAND.w + 2 + i * 9);
}

export const doorOpen = (m: number) => m > SWEEP_AT + 600 && m < SHUT_AT;

export const hand: Beat = {
  focus: (p) => lerp(LEO_FOCUS, HAND_FOCUS, smooth(span(msIn(BEAT.hand, p), SWEEP_AT, SWEEP_AT + 2000))),
  actors(g, p) {
    const m = msIn(BEAT.hand, p);
    drawLeoDesks(g);
    g.spr(LAPTOP_SIDE, LEO_SEAT_X + 11, -DESK_SIDE.h - LAPTOP_SIDE.h + 1);
    // The pictures pop away as the hand arrives.
    if (m < 200) drawPictures(g, 4000);
    if (m < 200) PIC_POS.forEach(([x, y], i) => sparkle(g, 90 + i, m, x + 6, y + 5, 6));
    CROWD.forEach((c, i) => {
      const x = sweptX(m, i);
      if (x >= CANVA_DOOR_X + 4) return; // inside the tower
      const pushed = x > c.x0 + 1;
      const lift = pushed ? Math.abs(Math.sin(m / 170 + i)) * 8 : 0;
      const q = Math.floor(m / 110 + i) % 4;
      if (c.dulini) g.stand(pushed ? TUMBLE[q] : SIT_TYPE[0], x, pushed ? lift : -1);
      else {
        const f = personFrames(c.look!.style);
        g.stand(pushed ? f.tumble[q] : f.idle[0], x, lift, c.look!.map, c.look!.variant);
      }
    });
    dust(g, 120, m - SHUT_AT, CANVA_DOOR_X + CANVA_DOOR.w / 2, -2, 8);

    const facade = dither(LEO_FACADE, leoFacadeLevel(g));
    if (facade) g.spr(facade, AT.leo, -LEO_H);

    // The hand: slides down from above the panel, sweeps right, then lifts away.
    const top = g.view.top - g.view.gy;
    const handTop = -HAND.h - 1;
    const yIn = lerp(top - HAND.h - 8, handTop, easeOut(span(m, 0, DOWN_MS)));
    const yOut = lerp(handTop, top - HAND.h - 8, smooth(span(m, UP_AT, UP_AT + 500)));
    const y = m < UP_AT ? yIn : yOut;
    const x = handX(m);
    if (y > top - HAND.h) {
      g.rect(PALETTE.k, x + 6, top, 26, y - top + 1);
      g.rect(PALETTE.B, x + 7, top, 24, y - top + 1);
      g.spr(HAND, x, y);
    }
  },
};
