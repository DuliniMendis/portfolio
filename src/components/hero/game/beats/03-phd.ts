import { burst, sparkle } from "../particles";
import { COAT, IDLE, SIT_TYPE } from "../sprites/dulini";
import { AT, UNI_FACADE, UNI_H, UNI_INSIDE } from "../sprites/landmarks";
import { BEAKER, BENCH, BRAIN, BUBBLE_CODE, DESK_SIDE, FLASK, LAPTOP_SIDE, STAR, STOOL } from "../sprites/props";
import { dither } from "../sprites/types";
import { BEAT } from "../timeline";
import { lerp, span, type World } from "../world";
import { SEAT_X, UNI_FOCUS } from "./02-jump";
import { dissolve, msIn, type Beat } from "./common";

/** Beat 3: inside the university. Typing code at a desk, then a lab coat at the bench. */
const OPEN_MS = 0;
export const SIT_AT = 400;
export const STAND_AT = 2400;
export const COAT_AT = 2550;
export const BENCH_AT = 3100;
export const SPARK_AT = 3900;
const CLOSE_MS = 4550;
export const TYPE_FRAME_MS = 150;
export const BENCH_X = AT.uni + 42;

const DESK_X = AT.uni + 19;
const BENCH_LEFT = AT.uni + 53;

/** Bench layout: the brain (once her lab coat is on), a flask that bubbles, a beaker. */
const BRAIN_X = BENCH_LEFT - 2;
const FLASK_X = BENCH_LEFT + 14;
const BEAKER_X = BENCH_LEFT + 21;

function furniture(g: World, m: number) {
  g.spr(STOOL, SEAT_X - 5, -STOOL.h);
  g.spr(DESK_SIDE, DESK_X, -DESK_SIDE.h);
  g.spr(BENCH, BENCH_LEFT, -BENCH.h);
  if (m >= COAT_AT) g.spr(BRAIN, BRAIN_X, -BENCH.h - BRAIN.h + 1);
  g.spr(FLASK, FLASK_X, -BENCH.h - FLASK.h);
  g.spr(BEAKER, BEAKER_X, -BENCH.h - BEAKER.h);
}

export const phd: Beat = {
  focus: () => UNI_FOCUS,
  scenery(g) {
    if (g.beat === BEAT.phd) {
      g.spr(UNI_INSIDE, AT.uni, -UNI_H);
      furniture(g, msIn(BEAT.phd, g.p));
    } else {
      g.spr(UNI_FACADE, AT.uni, -UNI_H);
    }
  },
  actors(g, p) {
    const m = msIn(BEAT.phd, p);
    if (m < SIT_AT) g.stand(IDLE[0], SEAT_X);
    else if (m < STAND_AT) {
      g.stand(SIT_TYPE[Math.floor(m / TYPE_FRAME_MS) % 2], SEAT_X, -1);
      if (m > SIT_AT + 300 && m < STAND_AT - 100) {
        g.spr(BUBBLE_CODE, SEAT_X - 4, -66);
      }
    } else if (m < COAT_AT) g.stand(IDLE[0], SEAT_X);
    else if (m < BENCH_AT) {
      const s = span(m, COAT_AT + 100, BENCH_AT);
      const bob = Math.floor(m / 130) % 2;
      g.stand(COAT[1], lerp(SEAT_X, BENCH_X, s), bob);
    } else g.stand(COAT[Math.floor(m / 450) % 2], BENCH_X);
    g.spr(LAPTOP_SIDE, DESK_X + 2, -DESK_SIDE.h - LAPTOP_SIDE.h + 1);

    // The coat appears in a puff.
    sparkle(g, 31, m - COAT_AT, SEAT_X, -18, 10);
    // Bubbles rise from the flask while she works; then a spark pops.
    if (m > BENCH_AT) {
      for (let k = 0; k < 4; k++) {
        const t0 = BENCH_AT + k * 350;
        const age = (m - t0) % 1400;
        burst(g, { seed: 40 + k, n: 3, age, x: FLASK_X + 3, y: -BENCH.h - 10, kind: "bubble", life: 900, speed: 14, dir: -Math.PI / 2, spread: 0.6, gravity: -6 });
      }
    }
    if (m > SPARK_AT && m < SPARK_AT + 500) {
      // The spark pops between the brain's electrodes.
      g.spr(STAR[Math.floor((m - SPARK_AT) / 120) % 2], BRAIN_X + 7, -BENCH.h - BRAIN.h - 3);
    }
    sparkle(g, 33, m - SPARK_AT, BRAIN_X + 9, -BENCH.h - BRAIN.h + 1, 12);

    // The front wall dissolves away as she walks in, and comes back as the beat ends.
    const level = m < CLOSE_MS ? dissolve(m, OPEN_MS) : dissolve(m, CLOSE_MS, 100, true);
    const facade = dither(UNI_FACADE, level);
    if (facade) g.spr(facade, AT.uni, -UNI_H);
  },
};
