import { PALETTE } from "../palette";
import { hash } from "../world";
import { compose, rotate, type ColorMap, type Part, type Sprite } from "./types";

/**
 * Colleagues: one 20 × 28 front-facing base with three hairstyles, palette-swapped per person.
 * Slots: 1 skin, 2 skin shade, 3 hair, 4 shirt, 5 shirt shade, 6 trousers.
 */
export const PW = 20;
export const PH = 28;

const HEAD_SHORT: Part = [
  "....................",
  "......kkkkkkkk......",
  ".....k33333333k.....",
  "....k3333333333k....",
  "....k3311111133k....",
  "....k3111111113k....",
  "....k11k1111k11k....",
  "....k11k1111k11k....",
  "....k1211111121k....",
  "....k1111kk1111k....",
  ".....k11111111k.....",
  "......kkk11kkk......",
  "........k12k........",
];
// Long hair: the short head with hair falling past the face to the shoulders.
const HAIR_SIDES: Part = [
  "..k33..........33k..",
  "..k33..........33k..",
  "..k33..........33k..",
  "..k33..........33k..",
  "..k33..........33k..",
  "..k33..........33k..",
  "..k33..........33k..",
  "..k33k........k33k..",
  "..k33k........k33k..",
  "...kk..........kk...",
];
const HEAD_LONG: Part = compose("p-head-long", PW, 14, [
  [HEAD_SHORT, 0, 0],
  [HAIR_SIDES, 0, 4],
]).rows;
const HEAD_BUN: Part = [
  ".........kkk........",
  "........k333k.......",
  "......kkk333kkk.....",
  ".....k33333333k.....",
  "....k3311111133k....",
  "....k3111111113k....",
  "....k11k1111k11k....",
  "....k11k1111k11k....",
  "....k1211111121k....",
  "....k1111kk1111k....",
  ".....k11111111k.....",
  "......kkk11kkk......",
  "........k12k........",
];

const BODY: Part = [
  "....kk44444444kk....",
  "...k444444444444k...",
  "...k5k44444444k5k...",
  "...k5k44444444k5k...",
  "...k1k44444444k1k...",
  "...k1k44444444k1k...",
  "...kk.k555555k.kk...",
  "......k666666k......",
  "......k66kk66k......",
  "......k66kk66k......",
  "......k66kk66k......",
  "......k66kk66k......",
  ".....kkkkkkkkkk.....",
  ".....kkkk..kkkk.....",
  "....................",
];
const BODY_CHEER: Part = [
  "....kk44444444kk....",
  "...k444444444444k...",
  "....kk44444444kk....",
  "......k4444444k.....",
  "......k4444444k.....",
  "......k4444444k.....",
  "......k555555k......",
  "......k666666k......",
  "......k66kk66k......",
  "......k66kk66k......",
  "......k66kk66k......",
  "......k66kk66k......",
  ".....kkkkkkkkkk.....",
  ".....kkkk..kkkk.....",
  "....................",
];
// Raised arms for the cheer, drawn over the head's sides.
const ARMS_UP: Part = [
  "..kk............kk..",
  ".k11k..........k11k.",
  ".k11k..........k11k.",
  ".k55k..........k55k.",
  ".k55k..........k55k.",
  ".k44k..........k44k.",
  "..k44k........k44k..",
  "..k44k........k44k..",
  "...k44k......k44k...",
  "...k44k......k44k...",
  "....k44k....k44k....",
  "....k44k....k44k....",
  "....k44kk..kk44k....",
];

export type Style = "short" | "long" | "bun";
const HEADS: Record<Style, Part> = { short: HEAD_SHORT, long: HEAD_LONG, bun: HEAD_BUN };

type Frames = { idle: [Sprite, Sprite]; cheer: Sprite; tumble: Sprite[] };
const frames = new Map<Style, Frames>();

export function personFrames(style: Style): Frames {
  let f = frames.get(style);
  if (f) return f;
  const head = HEADS[style];
  const idle0 = compose(`p-${style}-idle-0`, PW, PH, [
    [BODY, 0, 13],
    [head, 0, 0],
  ]);
  const idle1 = compose(`p-${style}-idle-1`, PW, PH, [
    [BODY, 0, 13],
    [head, 0, 1],
  ]);
  const cheer = compose(`p-${style}-cheer`, PW, PH, [
    [BODY_CHEER, 0, 13],
    [head, 0, 1],
    [ARMS_UP, 0, 0],
  ]);
  f = { idle: [idle0, idle1], cheer, tumble: [0, 1, 2, 3].map((q) => rotate(idle0, q, `p-${style}-tumble-${q}`)) };
  frames.set(style, f);
  return f;
}

const SKINS: [string, string][] = [
  [PALETTE.u, PALETTE.U],
  [PALETTE.U, PALETTE.Y],
  [PALETTE.S, PALETTE.D],
  [PALETTE.v, PALETTE.E],
];
const HAIRS = [PALETTE.h, PALETTE.x, PALETTE.q, PALETTE.z, PALETTE.g];
const SHIRTS: [string, string][] = [
  [PALETTE.o, PALETTE.O],
  [PALETTE.B, PALETTE.T],
  [PALETTE.l, PALETTE.B],
  [PALETTE.T, PALETTE.N],
  [PALETTE.p, PALETTE.Y],
  [PALETTE.w, PALETTE.r],
];
const TROUSERS = [PALETTE.T, PALETTE.m, PALETTE.j, PALETTE.N];
const STYLES: Style[] = ["short", "long", "bun"];

export type Person = { style: Style; map: ColorMap; variant: string };

/** A repeatable colleague for a seed: the same seed always gives the same look. */
export function person(seed: number): Person {
  const pick = (n: number, k: number) => Math.floor(hash(seed, k, 77) * n);
  const s = pick(SKINS.length, 1);
  const hr = pick(HAIRS.length, 2);
  const sh = pick(SHIRTS.length, 3);
  const tr = pick(TROUSERS.length, 4);
  const style = STYLES[pick(STYLES.length, 5)];
  return {
    style,
    variant: `${s}${hr}${sh}${tr}`,
    map: { "1": SKINS[s][0], "2": SKINS[s][1], "3": HAIRS[hr], "4": SHIRTS[sh][0], "5": SHIRTS[sh][1], "6": TROUSERS[tr] },
  };
}
