import { textSprite } from "../font";
import { build, sprite } from "./types";

/** Desk seen from the side, for Dulini (she sits to its left, facing right). Top is 12 px above the floor. */
export const DESK_SIDE = build("desk-side", 20, 9, (g) => {
  g.rect("q", 0, 0, 20, 2);
  g.rect("Y", 0, 0, 20, 1);
  g.rect("q", 2, 2, 2, 7);
  g.rect("q", 16, 2, 2, 7);
});

/** Laptop from the side, screen towards her. */
export const LAPTOP_SIDE = build("laptop-side", 10, 8, (g) => {
  g.rect("G", 0, 6, 9, 1);
  for (let i = 0; i < 6; i++) g.px("m", 7 - Math.floor(i / 2), i);
  g.rect("l", 5, 1, 1, 3);
});

/** Stool seen from the side. */
export const STOOL = build("stool", 10, 6, (g) => {
  g.rect("m", 0, 0, 10, 2);
  g.rect("G", 4, 2, 2, 3);
  g.rect("G", 1, 5, 8, 1);
});

/** Desk seen from the front with a laptop lid towards us (colleagues sit behind it). */
export const DESK_FRONT = build("desk-front", 22, 16, (g) => {
  g.rect("g", 7, 0, 8, 4);
  g.rect("G", 6, 4, 10, 1);
  g.px("w", 10, 1);
  g.rect("G", 0, 5, 22, 2);
  g.rect("g", 1, 7, 20, 6);
  g.rect("G", 1, 13, 2, 3);
  g.rect("G", 19, 13, 2, 3);
});

/** Lab bench with a cupboard. */
export const BENCH = build("bench", 26, 14, (g) => {
  g.rect("w", 0, 0, 26, 2);
  g.rect("r", 0, 2, 26, 1);
  g.rect("g", 1, 3, 24, 11);
  g.rect("G", 12, 3, 1, 11);
  g.px("k", 10, 8);
  g.px("k", 14, 8);
});

export const BEAKER = build("beaker", 5, 8, (g) => {
  g.rect("w", 1, 0, 3, 3);
  g.rect("w", 0, 3, 5, 5);
  g.rect("l", 0, 5, 5, 3);
  g.rect("B", 0, 7, 5, 1);
});
export const FLASK = build("flask", 7, 9, (g) => {
  g.rect("w", 2, 0, 3, 3);
  g.rect("w", 1, 3, 5, 2);
  g.rect("w", 0, 5, 7, 4);
  g.rect("o", 0, 6, 7, 3);
  g.rect("O", 0, 8, 7, 1);
});

/** Speech bubble for the PhD: code braces and a brain-wave squiggle. */
export const BUBBLE_CODE = build("bubble-code", 32, 16, (g) => {
  g.rect("w", 1, 0, 30, 12);
  g.rect("w", 0, 1, 32, 10);
  g.rect("w", 6, 12, 3, 2);
  g.rect("w", 5, 14, 2, 1);
  g.part(textSprite("{", "T").rows, 3, 2);
  g.part(textSprite("}", "T").rows, 24, 2);
  // Brain-wave squiggle between the braces
  const wave = [3, 2, 1, 2, 4, 6, 3, 1, 0, 2, 5, 4, 3];
  wave.forEach((y, i) => g.px("o", 10 + i, 2 + y));
});

/** Little sparkle star (the "✦"). */
export const STAR = [
  sprite("star-0", ["..o..", "..o..", "ooOoo", "..o..", "..o.."]),
  sprite("star-1", [".....", "..o..", ".oOo.", "..o..", "....."]),
];

export const HEART = build("heart", 9, 8, (g) => {
  g.rect("w", 0, 0, 9, 7);
  g.px("w", 2, 7);
  g.px("o", 2, 2);
  g.px("o", 3, 2);
  g.px("o", 5, 2);
  g.px("o", 6, 2);
  g.rect("o", 2, 3, 5, 1);
  g.rect("o", 3, 4, 3, 1);
  g.px("o", 4, 5);
});
export const CHAT = build("chat", 9, 8, (g) => {
  g.rect("w", 0, 0, 9, 7);
  g.px("w", 2, 7);
  g.px("B", 2, 3);
  g.px("B", 4, 3);
  g.px("B", 6, 3);
});

/** The four generated pictures at Leonardo: a cat, a landscape, a rocket, a face. 12 × 10 with a frame. */
const FRAME = (id: string, rows: string[]) =>
  build(id, 12, 10, (g) => {
    g.rect("w", 0, 0, 12, 10);
    g.part(rows, 1, 1);
  });
export const PICTURES = [
  FRAME("pic-cat", [
    "pppppppppp",
    "pkpppppkpp",
    "pkkkkkkkpp",
    "pkoookokpp",
    "pkokoookpp",
    "pkooooookp",
    "ppkkkkkkpp",
    "pppppppppp",
  ]),
  FRAME("pic-land", [
    "ssssssssss",
    "ssssssoos",
    "ssssssoos",
    "sssBssssss",
    "ssBBBsssss",
    "sBBBBBsBss",
    "BBBBBBBBBB",
    "TTTTTTTTTT",
  ]),
  FRAME("pic-rocket", [
    "kkkkkkkkkk",
    "kkkkwkkkkk",
    "kkkwwwkkwk",
    "kkkwBwkkkk",
    "kwkwwwkkkk",
    "kkwwwwwkkk",
    "kkkoOokkwk",
    "kkkkokkkkk",
  ]),
  FRAME("pic-face", [
    "aaaaaaaaaa",
    "aaahhhhaaa",
    "aahSSSShaa",
    "aahkSSkhaa",
    "aahSSSShaa",
    "aaaSEESaaa",
    "aaooooooaa",
    "aoooooooo",
  ]),
];

/** A terminal window: dark body, title bar with three dots. The streaming text is drawn by the scene. */
export const TERMINAL = build("terminal", 34, 24, (g) => {
  g.rect("m", 0, 0, 34, 4);
  g.px("o", 2, 1);
  g.px("l", 5, 1);
  g.px("w", 8, 1);
  g.rect("k", 0, 4, 34, 20);
  g.rect("j", 0, 4, 34, 1);
});

/** Rubble left where Seer's building stood. */
export const RUBBLE = build("rubble", 34, 7, (g) => {
  g.rect("Y", 2, 4, 6, 3);
  g.rect("g", 7, 2, 5, 5);
  g.rect("w", 12, 3, 7, 4);
  g.rect("q", 18, 5, 4, 2);
  g.rect("r", 21, 1, 6, 6);
  g.rect("G", 27, 4, 5, 3);
});
