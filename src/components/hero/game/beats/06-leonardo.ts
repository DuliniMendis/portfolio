import { sparkle } from "../particles";
import { FRONT_DESK, IDLE } from "../sprites/dulini";
import { AT, LEO_FACADE, LEO_H, LEO_INSIDE, LEO_LOGO, LEO_SIGN, LEO_SIGN_BOARD, LEO_W } from "../sprites/landmarks";
import { person, personFrames } from "../sprites/people";
import { DESK_FRONT, PICTURES, STAR } from "../sprites/props";
import { dither } from "../sprites/types";
import { PALETTE } from "../palette";
import { BEAT } from "../timeline";
import { lerp, smooth, span, type World } from "../world";
import { dissolve, msIn, walkFrame, type Beat } from "./common";
import { LEO_ARRIVE_X, LEO_FOCUS_START } from "./05-seer-crumbles";

/** Beat 6: Leonardo.Ai. At her desk (facing out, like everyone), pictures appear by magic one by one; colleagues cheer. */
export const LEO_FOCUS = AT.leo + LEO_W / 2;
export const LEO_SEAT_X = AT.leo + 16;
const SIT_AT = 500;
export const PIC_AT = [1100, 1700, 2300, 2900];
const PIC_GROW_MS = 260;
export const CHEER_AT = 3300;
/** Colleagues' desks (left edges) and their looks. */
export const LEO_PEOPLE = [0, 1, 2, 3].map((i) => ({ x: AT.leo + 44 + i * 20 + 11, look: person(200 + i) }));
export const PIC_POS = [
  [LEO_SEAT_X - 13, -60],
  [LEO_SEAT_X + 1, -69],
  [LEO_SEAT_X + 16, -70],
  [LEO_SEAT_X + 30, -61],
] as const;

/** The magic: sparkles stream from her laptop to each picture as it forms, then a star twinkles on its corner. */
export const STREAM_MS = 450;
const STREAM_DOTS = 7;
const TWINKLE_MS = 900;
/** Her laptop lid, where the sparkles start. */
const LAPTOP = { x: LEO_SEAT_X, y: -14 };

/** The office: cut away during beats 6 and 7, facade otherwise. Returns the facade level drawn on top later. */
export function leoFacadeLevel(g: World) {
  const m = msIn(g.beat, g.p);
  if (g.beat === BEAT.leonardo) return dissolve(m, 0);
  if (g.beat === BEAT.hand) return m < 3000 ? 3 : dissolve(m, 3000, 100, true);
  return 0;
}

/** Everyone's desks, hers first. Drawn after the people, who sit behind them. */
export function drawLeoDesks(g: World) {
  g.spr(DESK_FRONT, LEO_SEAT_X - 11, -DESK_FRONT.h);
  for (const c of LEO_PEOPLE) g.spr(DESK_FRONT, c.x - 11, -DESK_FRONT.h);
}

/** Her at her desk: a gentle bob while she works. */
export const deskFrame = (t: number) => FRONT_DESK[Math.floor(t / 600) % 2];

export const leonardo: Beat = {
  focus: (p) => lerp(LEO_FOCUS_START, LEO_FOCUS, smooth(span(msIn(BEAT.leonardo, p), 0, 1000))),
  scenery(g) {
    const cut = g.beat === BEAT.leonardo || g.beat === BEAT.hand;
    g.spr(cut ? LEO_INSIDE : LEO_FACADE, AT.leo, -LEO_H);
    const sx = AT.leo + LEO_SIGN.dx;
    const sy = -LEO_H - LEO_SIGN.h;
    g.spr(LEO_SIGN_BOARD, sx, sy);
    g.logo("leonardo", sx + LEO_LOGO.x, sy + LEO_LOGO.y, LEO_LOGO.w, LEO_LOGO.h);
  },
  actors(g, p) {
    const m = msIn(BEAT.leonardo, p);
    // Colleagues at their desks, cheering at the end.
    for (const [i, c] of LEO_PEOPLE.entries()) {
      const f = personFrames(c.look.style);
      const cheer = m > CHEER_AT + i * 80 && Math.floor((m + i * 150) / 300) % 2 === 0;
      g.stand(cheer ? f.cheer : f.idle[Math.floor((g.t + i * 260) / 600) % 2], c.x, 0, c.look.map, c.look.variant);
    }
    if (m < SIT_AT) g.stand(m < 200 ? IDLE[0] : walkFrame(m), lerp(LEO_ARRIVE_X, LEO_SEAT_X, span(m, 200, SIT_AT)));
    else g.stand(deskFrame(m), LEO_SEAT_X);
    drawLeoDesks(g);
    drawPictures(g, m);
    const facade = dither(LEO_FACADE, leoFacadeLevel(g));
    if (facade) g.spr(facade, AT.leo, -LEO_H);
  },
};

/** Each picture forms by magic: sparkles stream up from her laptop, it grows from a dot to the full frame, then twinkles. */
export function drawPictures(g: World, m: number, gone = Infinity) {
  PICTURES.forEach((pic, i) => {
    const age = m - PIC_AT[i];
    if (age < -STREAM_MS || m >= gone) return;
    const [x, y] = PIC_POS[i];
    const cx = x + 6;
    const cy = y + 5;
    if (!g.calm && age < PIC_GROW_MS) {
      // A wavy trail of sparkles from the laptop to where the picture appears.
      const colors = [PALETTE.o, PALETTE.w, PALETTE.l];
      for (let d = 0; d < STREAM_DOTS; d++) {
        const s = (age + STREAM_MS) / STREAM_MS - d * 0.13;
        if (s <= 0 || s >= 1) continue;
        const px = lerp(LAPTOP.x, cx, s) + Math.sin(s * 9 + d) * 3;
        const py = lerp(LAPTOP.y, cy, s);
        const c = colors[(d + i) % colors.length];
        g.rect(c, px, py, 1, 1);
        if (d % 3 === 0) {
          g.rect(c, px - 1, py, 3, 1);
          g.rect(c, px, py - 1, 1, 3);
        }
      }
    }
    if (age < 0) return;
    if (age < PIC_GROW_MS / 2) g.rect(PALETTE.w, cx, cy, 1, 1);
    else if (age < PIC_GROW_MS) g.rect(PALETTE.w, cx - 3, cy - 2, 6, 5);
    else g.spr(pic, x, y);
    sparkle(g, 80 + i, age - PIC_GROW_MS / 2, cx, cy, 14);
    const tw = age - PIC_GROW_MS;
    if (tw > 0 && tw < TWINKLE_MS) g.spr(STAR[Math.floor(tw / 150) % 2], x + 9, y - 3);
  });
}
