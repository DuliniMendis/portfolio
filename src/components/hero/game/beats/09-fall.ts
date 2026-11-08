import { dust, wind } from "../particles";
import { FRONT, JUMP_DOWN, LAND_SMILE, TUMBLE } from "../sprites/dulini";
import { AT, CANVA_CROWN, CANVA_FLOOR_H, CANVA_H, CANVA_W } from "../sprites/landmarks";
import { PALETTE } from "../palette";
import { BEAT } from "../timeline";
import { lerp, smooth, span } from "../world";
import { msIn, type Beat } from "./common";
import { CANVA_FOCUS, drawCanvaFacadeOver, drawCanvaPeople, DULINI_FLOOR, windStrength } from "./08-canva";

/** Beat 9: a gust blows her out of a top window; she tumbles down, flips, and lands on her feet, smiling. */
export const OUT_AT = 350;
export const FLIP_AT = 1700;
export const LAND_AT = 2050;
/** The window on her floor (second from the top, right-hand column, lower row) that she is blown out of. */
const WIN = { x: AT.canva + 58, y: -CANVA_H + CANVA_CROWN + DULINI_FLOOR * CANVA_FLOOR_H + 17, w: 9, h: 12 };
export const LANDING_X = AT.landing;
export const FALL_FOCUS = AT.canva + CANVA_W / 2 + 32;

export const fall: Beat = {
  focus: (p) => lerp(CANVA_FOCUS, FALL_FOCUS, smooth(span(msIn(BEAT.fall, p), 300, 2000))),
  actors(g, p) {
    const m = msIn(BEAT.fall, p);
    const strength = windStrength(g);
    if (m < 300) drawCanvaPeople(g, strength);
    drawCanvaFacadeOver(g);
    // The window she bursts out of stands open.
    if (m >= OUT_AT - 50) g.rect(PALETTE.j, WIN.x, WIN.y, WIN.w, WIN.h);
    const startLift = -(WIN.y + WIN.h) - 4;
    if (m >= OUT_AT && m < LAND_AT) {
      const s = span(m, OUT_AT, LAND_AT);
      const x = lerp(WIN.x + 4, LANDING_X, smooth(Math.min(1, s * 1.4)));
      const lift = startLift * (1 - s * s) + 18 * s * (1 - s);
      const frame = m < FLIP_AT ? TUMBLE[Math.floor(m / 100) % 4] : JUMP_DOWN;
      g.stand(frame, x, lift);
    } else if (m >= LAND_AT) {
      dust(g, 151, m - LAND_AT, LANDING_X);
      g.stand(m < LAND_AT + 300 ? LAND_SMILE : FRONT, LANDING_X);
    }
    wind(g, 12, m + 2800, strength);
  },
};
