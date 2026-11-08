import { sparkle } from "../particles";
import { IDLE, SIT_TYPE } from "../sprites/dulini";
import { AT, LEO_FACADE, LEO_H, LEO_INSIDE, LEO_LOGO, LEO_SIGN, LEO_SIGN_BOARD, LEO_W } from "../sprites/landmarks";
import { person, personFrames } from "../sprites/people";
import { DESK_FRONT, DESK_SIDE, LAPTOP_SIDE, PICTURES, STOOL } from "../sprites/props";
import { dither } from "../sprites/types";
import { PALETTE } from "../palette";
import { BEAT } from "../timeline";
import { lerp, smooth, span, type World } from "../world";
import { dissolve, msIn, walkFrame, type Beat } from "./common";
import { LEO_ARRIVE_X, LEO_FOCUS_START } from "./05-seer-crumbles";

/** Beat 6: Leonardo.Ai. She types; generated pictures appear in the air one by one; colleagues cheer. */
export const LEO_FOCUS = AT.leo + LEO_W / 2;
export const LEO_SEAT_X = AT.leo + 16;
const SIT_AT = 500;
const PIC_AT = [1100, 1700, 2300, 2900];
const PIC_GROW_MS = 260;
const CHEER_AT = 3300;
/** Colleagues' desks (left edges) and their looks. */
export const LEO_PEOPLE = [0, 1, 2, 3].map((i) => ({ x: AT.leo + 44 + i * 20 + 11, look: person(200 + i) }));
export const PIC_POS = [
  [LEO_SEAT_X - 13, -60],
  [LEO_SEAT_X + 1, -69],
  [LEO_SEAT_X + 16, -70],
  [LEO_SEAT_X + 30, -61],
] as const;

const DESK_X = LEO_SEAT_X + 9;

/** The office: cut away during beats 6 and 7, facade otherwise. Returns the facade level drawn on top later. */
export function leoFacadeLevel(g: World) {
  const m = msIn(g.beat, g.p);
  if (g.beat === BEAT.leonardo) return dissolve(m, 0);
  if (g.beat === BEAT.hand) return m < 3000 ? 3 : dissolve(m, 3000, 100, true);
  return 0;
}

export function drawLeoFurniture(g: World) {
  g.spr(STOOL, LEO_SEAT_X - 5, -STOOL.h);
  g.spr(DESK_SIDE, DESK_X, -DESK_SIDE.h);
  g.spr(LAPTOP_SIDE, DESK_X + 2, -DESK_SIDE.h - LAPTOP_SIDE.h + 1);
}

export function drawLeoDesks(g: World) {
  for (const c of LEO_PEOPLE) g.spr(DESK_FRONT, c.x - 11, -DESK_FRONT.h);
}

export const leonardo: Beat = {
  focus: (p) => lerp(LEO_FOCUS_START, LEO_FOCUS, smooth(span(msIn(BEAT.leonardo, p), 0, 1000))),
  scenery(g) {
    const cut = g.beat === BEAT.leonardo || g.beat === BEAT.hand;
    g.spr(cut ? LEO_INSIDE : LEO_FACADE, AT.leo, -LEO_H);
    const sx = AT.leo + LEO_SIGN.dx;
    const sy = -LEO_H - LEO_SIGN.h;
    g.spr(LEO_SIGN_BOARD, sx, sy);
    g.logo("leonardo", sx + LEO_LOGO.x, sy + LEO_LOGO.y, LEO_LOGO.w, LEO_LOGO.h);
    if (cut) drawLeoFurniture(g);
  },
  actors(g, p) {
    const m = msIn(BEAT.leonardo, p);
    // Colleagues at their desks, cheering at the end.
    for (const [i, c] of LEO_PEOPLE.entries()) {
      const f = personFrames(c.look.style);
      const cheer = m > CHEER_AT + i * 80 && Math.floor((m + i * 150) / 300) % 2 === 0;
      g.stand(cheer ? f.cheer : f.idle[Math.floor((g.t + i * 260) / 600) % 2], c.x, 0, c.look.map, c.look.variant);
    }
    drawLeoDesks(g);
    if (m < SIT_AT) g.stand(m < 200 ? IDLE[0] : walkFrame(m), lerp(LEO_ARRIVE_X, LEO_SEAT_X, span(m, 200, SIT_AT)));
    else g.stand(SIT_TYPE[Math.floor(m / 150) % 2], LEO_SEAT_X, -1);
    g.spr(LAPTOP_SIDE, DESK_X + 2, -DESK_SIDE.h - LAPTOP_SIDE.h + 1);
    drawPictures(g, m);
    const facade = dither(LEO_FACADE, leoFacadeLevel(g));
    if (facade) g.spr(facade, AT.leo, -LEO_H);
  },
};

/** Each picture grows from a dot to a small box to the full frame, with sparkles. */
export function drawPictures(g: World, m: number, gone = Infinity) {
  PICTURES.forEach((pic, i) => {
    const age = m - PIC_AT[i];
    if (age < 0 || m >= gone) return;
    const [x, y] = PIC_POS[i];
    const cx = x + 6;
    const cy = y + 5;
    if (age < PIC_GROW_MS / 2) g.rect(PALETTE.w, cx, cy, 1, 1);
    else if (age < PIC_GROW_MS) g.rect(PALETTE.w, cx - 3, cy - 2, 6, 5);
    else g.spr(pic, x, y);
    sparkle(g, 80 + i, age - PIC_GROW_MS / 2, cx, cy, 8);
  });
}
