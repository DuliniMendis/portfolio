import { STAR } from "../sprites/props";
import { FRONT, WAVE } from "../sprites/dulini";
import { BEAT } from "../timeline";
import { smooth, span } from "../world";
import { msIn, type Beat } from "./common";
import { FALL_FOCUS, LANDING_X } from "./09-fall";

/** Beat 10: she waves, a sparkle twinkles, and the iris closes on her. The loop then opens on Sri Lanka. */
const WAVE_MS = 280;
const STAR_AT = 300;
const IRIS_AT = 1860;
const IRIS_MS = 720;

export const wave: Beat = {
  focus: () => FALL_FOCUS,
  actors(g, p) {
    const m = msIn(BEAT.wave, p);
    g.stand(m < IRIS_AT + IRIS_MS ? WAVE[Math.floor(m / WAVE_MS) % 2] : FRONT, LANDING_X);
    if (m > STAR_AT && m < IRIS_AT) g.spr(STAR[Math.floor((m - STAR_AT) / 200) % 2], LANDING_X + 12, -40);
    return { x: LANDING_X, y: -16, closed: smooth(span(m, IRIS_AT, IRIS_AT + IRIS_MS)) };
  },
};
