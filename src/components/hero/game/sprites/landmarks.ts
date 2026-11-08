import { textSprite } from "../font";
import { build, type Grid, type Sprite } from "./types";

/**
 * Places along the story. World x of each landmark's left edge (or a character's centre), game px.
 * The camera, the beats and the static frame all read these, so moving a building moves everything with it.
 */
export const AT = {
  palmA: 50,
  palmB: 78,
  start: 112,
  sign: 120,
  plane: 170,
  uni: 916,
  seer: 1040,
  leo: 1128,
  canva: 1312,
  landing: 1404,
} as const;

// ---- Sri Lanka ---------------------------------------------------------------------------------

function palm(id: string, lean: number, height: number): Sprite {
  const w = 36;
  const h = height + 14;
  return build(id, w, h, (g) => {
    const top = 12;
    const trunkX = (y: number) => 15 + Math.round(((h - y) / (h - top)) * lean);
    for (let y = top; y < h; y++) {
      const x = trunkX(y);
      g.rect("q", x, y, 3, 1);
      g.px("Y", x, y);
      if (y % 3 === 0) g.rect("R", x, y, 3, 1);
    }
    const cx = trunkX(top) + 1;
    const cy = top - 1;
    const leaves = [-172, -145, -112, -70, -38, -8, 160];
    leaves.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const len = 13 + (i % 3) * 2;
      for (let s = 0; s <= len; s++) {
        const x = cx + Math.cos(a) * s;
        const y = cy + Math.sin(a) * s + 0.035 * s * s;
        g.rect("f", x, y, 2, 2);
        if (s % 2 === 0 && s > 2) g.px("F", x, y);
      }
    });
    g.rect("q", cx - 2, cy + 1, 2, 2);
    g.rect("R", cx + 1, cy + 2, 2, 2);
  });
}
export const PALM_A = palm("palm-a", 3, 38);
export const PALM_B = palm("palm-b", -2, 30);

/** The airport sign: a blue board on two posts. */
export const AIRPORT_SIGN = build("airport-sign", 48, 26, (g) => {
  g.rect("G", 6, 13, 2, 13);
  g.rect("G", 40, 13, 2, 13);
  g.rect("B", 0, 0, 48, 13);
  g.rect("T", 0, 12, 48, 1);
  g.part(textSprite("AIRPORT", "w").rows, 3, 3);
});

/** The plane, facing right. Her window is the big one near the tail (glass at PLANE_WINDOW). */
export const PLANE_WINDOW = { x: 15, y: 8 };
function plane(id: string, gear: boolean, prop: number): Sprite {
  return build(id, 64, 24, (g) => {
    for (let r = 0; r <= 8; r++) {
      const w = 1 + Math.round(r * 0.8);
      g.rect("o", 2, r, w, 1);
      g.px("O", 2 + w - 1, r);
    }
    g.rect("w", 2, 8, 52, 9);
    g.rect("w", 54, 9, 3, 7);
    g.rect("w", 57, 10, 2, 5);
    g.rect("r", 4, 15, 52, 2);
    g.rect("r", 54, 14, 3, 1);
    g.rect("B", 2, 12, 56, 2);
    for (let i = 0; i < 5; i++) {
      const x = 26 + i * 5;
      g.rect("k", x, 9, 3, 3);
      g.px("c", x + 1, 10);
    }
    g.rect("k", 14, 7, 9, 9);
    g.rect("c", 15, 8, 7, 7);
    g.rect("k", 49, 9, 5, 3);
    g.rect("T", 50, 10, 3, 1);
    g.rect("g", 26, 14, 18, 3);
    g.rect("G", 28, 17, 14, 1);
    if (gear) {
      g.rect("G", 20, 17, 1, 3);
      g.rect("k", 19, 20, 3, 3);
      g.rect("G", 45, 17, 1, 3);
      g.rect("k", 44, 20, 3, 3);
    }
    g.rect("G", 59, 11, 2, 3);
    if (prop === 0) g.rect("m", 61, 6, 1, 13);
    else g.rect("m", 61, 10, 1, 5);
  });
}
export const PLANE = {
  ground: [plane("plane-g0", true, 0), plane("plane-g1", true, 1)],
  air: [plane("plane-a0", false, 0), plane("plane-a1", false, 1)],
};

/**
 * A far-off city skyline: [x, width, height] of each tower in a 120 px wide tile, drawn as plain rectangles
 * (two strips of lit windows each) on a parallax layer as the flight nears Australia.
 */
export const SKYLINE_W = 120;
export const SKYLINE_H = 36;
export const SKYLINE_TOWERS: [number, number, number][] = [
  [6, 10, 14],
  [18, 8, 22],
  [28, 12, 30],
  [42, 6, 18],
  [50, 10, 26],
  [62, 8, 34],
  [72, 12, 20],
  [86, 7, 27],
  [95, 10, 16],
  [107, 8, 12],
];

// ---- University of Melbourne -------------------------------------------------------------------

export const UNI_W = 88;
export const UNI_H = 76;
/** Inside the cutaway: the room's floor is the ground line; furniture sits on it. */

function uniShell(g: Grid) {
  // Clock tower with a spire
  for (let r = 0; r < 10; r++) {
    const w = 2 + Math.round(r * 1.5);
    g.rect("q", 44 - Math.floor(w / 2), r, w, 1);
  }
  g.rect("y", 37, 10, 14, 21);
  g.rect("Y", 37, 10, 1, 21);
  g.rect("Y", 37, 10, 14, 1);
  g.rect("Y", 39, 12, 10, 10);
  g.rect("w", 40, 13, 8, 8);
  g.rect("k", 44, 14, 1, 4);
  g.rect("k", 44, 17, 3, 1);
  g.rect("j", 42, 24, 4, 5);
  // Main block outline: cornice, pilasters, plinth
  g.rect("Y", 0, 30, 88, 2);
  g.rect("q", 0, 32, 88, 1);
  g.rect("y", 0, 33, 3, 40);
  g.rect("y", 85, 33, 3, 40);
  g.rect("Y", 2, 33, 1, 40);
  g.rect("Y", 85, 33, 1, 40);
  g.rect("Y", 0, 72, 88, 4);
}

export const UNI_FACADE = build("uni-facade", UNI_W, UNI_H, (g) => {
  g.rect("y", 0, 30, 88, 46);
  uniShell(g);
  g.part(textSprite("UNIVERSITY OF", "q").rows, 6, 36);
  g.part(textSprite("MELBOURNE", "q").rows, 18, 45);
  for (const x of [6, 20, 60, 74]) {
    g.rect("Y", x - 1, 55, 10, 15);
    g.rect("c", x, 57, 8, 12);
    g.px("Y", x, 57);
    g.px("Y", x + 7, 57);
    g.rect("a", x + 1, 58, 1, 3);
  }
  g.rect("q", 36, 54, 16, 19);
  g.rect("j", 38, 57, 12, 16);
  g.px("q", 38, 57);
  g.px("q", 49, 57);
  g.rect("Y", 43, 57, 1, 16);
});

export const UNI_INSIDE = build("uni-inside", UNI_W, UNI_H, (g) => {
  g.rect("p", 3, 33, 82, 39);
  uniShell(g);
  g.rect("Y", 3, 33, 82, 1);
  // Back-wall window and a bookshelf
  g.rect("Y", 39, 40, 12, 14);
  g.rect("c", 40, 41, 10, 12);
  g.rect("Y", 44, 41, 1, 12);
  g.rect("q", 8, 40, 14, 18);
  const spines = ["B", "o", "T", "l", "O", "B", "w", "o"];
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 6; i++) g.rect(spines[(i + row * 3) % spines.length], 9 + i * 2, 41 + row * 8, 2, 7);
  // Lamp
  g.rect("k", 30, 33, 1, 4);
  g.rect("o", 29, 37, 3, 2);
  // Floor
  g.rect("Y", 3, 71, 82, 1);
});

// ---- Seer Medical ------------------------------------------------------------------------------

export const SEER_W = 48;
export const SEER_GROUND_H = 24;
export const SEER_FLOOR_H = 16;
export const SEER_FLOORS = 5;
export const SEER_ROOF_H = 5;
/** Where the logo sits on the ground floor, relative to the building's top-left. */
export const SEER_LOGO = { x: 5, y: 3, w: 38, h: 8 };

export const SEER_GROUND = build("seer-ground", SEER_W, SEER_GROUND_H, (g) => {
  g.rect("w", 0, 0, 48, 24);
  g.rect("r", 0, 22, 48, 2);
  g.rect("r", 3, 1, 42, 11);
  g.rect("w", 4, 2, 40, 9);
  g.rect("T", 17, 13, 14, 11);
  g.rect("c", 18, 14, 5, 10);
  g.rect("c", 25, 14, 5, 10);
  g.rect("T", 3, 14, 11, 7);
  g.rect("c", 4, 15, 9, 5);
  g.rect("T", 34, 14, 11, 7);
  g.rect("c", 35, 15, 9, 5);
});

/** Windows on an upper floor: x of each 12 × 11 window frame. */
export const SEER_WINDOWS = [3, 18, 33];
function seerFloor(id: string, lit: boolean) {
  return build(id, SEER_W, SEER_FLOOR_H, (g) => {
    g.rect("w", 0, 0, 48, 16);
    g.rect("r", 0, 15, 48, 1);
    for (const x of SEER_WINDOWS) {
      g.rect("T", x, 2, 12, 11);
      g.rect(lit ? "p" : "c", x + 1, 3, 10, 9);
      if (!lit) g.rect("a", x + 2, 4, 1, 3);
    }
  });
}
export const SEER_FLOOR = seerFloor("seer-floor", false);
export const SEER_FLOOR_LIT = seerFloor("seer-floor-lit", true);
export const SEER_ROOF = build("seer-roof", SEER_W + 4, SEER_ROOF_H, (g) => {
  g.rect("G", 0, 0, 52, 3);
  g.rect("g", 2, 3, 48, 2);
});
/** Cracks for the crumble: zigzags over a floor. */
export const SEER_CRACKS = [0, 1].map((v) =>
  build(
    `seer-cracks-${v}`,
    SEER_W,
    SEER_FLOOR_H,
    (g) => {
      let x = v ? 30 : 14;
      for (let y = 0; y < 16; y++) {
        g.px("k", x, y);
        x += y % 3 === 0 ? 1 : y % 3 === 1 ? -1 : 0;
      }
      g.px("k", x + 1, 8);
      g.px("k", x + 2, 9);
    },
    false,
  ),
);

// ---- Leonardo.Ai -------------------------------------------------------------------------------

export const LEO_W = 128;
export const LEO_H = 44;
export const LEO_DOOR = 15; // door centre, from the left edge
export const LEO_SIGN = { dx: 64, w: 60, h: 18 };
export const LEO_LOGO = { x: 2, y: 3, w: 56, h: 7 };

function leoShell(g: Grid) {
  g.rect("m", 0, 0, LEO_W, 4);
  g.rect("G", 0, 4, 3, 40);
  g.rect("G", LEO_W - 3, 4, 3, 40);
  g.rect("j", 0, 42, LEO_W, 2);
}
export const LEO_FACADE = build("leo-facade", LEO_W, LEO_H, (g) => {
  g.rect("j", 0, 4, LEO_W, 40);
  leoShell(g);
  g.rect("G", 8, 18, 14, 26);
  g.rect("c", 10, 20, 10, 24);
  g.rect("G", 14, 20, 1, 24);
  for (let i = 0; i < 5; i++) {
    const x = 28 + i * 19;
    g.rect("m", x, 11, 17, 24);
    g.rect("c", x + 1, 12, 15, 22);
    g.rect("a", x + 3, 14, 1, 5);
    g.rect("a", x + 4, 14, 1, 2);
  }
});
export const LEO_INSIDE = build("leo-inside", LEO_W, LEO_H, (g) => {
  g.rect("r", 3, 4, LEO_W - 6, 38);
  g.rect("g", 3, 4, LEO_W - 6, 1);
  leoShell(g);
  // A long window on the back wall
  g.rect("c", 34, 9, 70, 12);
  g.rect("g", 34, 9, 70, 1);
  g.rect("g", 68, 9, 1, 12);
});
/** Dark board: the published wordmark is light grey, made for dark backgrounds. */
export const LEO_SIGN_BOARD = build("leo-sign", LEO_SIGN.w, LEO_SIGN.h, (g) => {
  g.rect("k", 0, 0, 60, 13);
  g.rect("j", 0, 12, 60, 1);
  g.rect("G", 10, 13, 2, 5);
  g.rect("G", 48, 13, 2, 5);
});

// ---- Canva -------------------------------------------------------------------------------------

export const CANVA_W = 72;
export const CANVA_CROWN = 12;
export const CANVA_FLOOR_H = 33;
export const CANVA_FLOORS = 4;
export const CANVA_H = CANVA_CROWN + CANVA_FLOOR_H * CANVA_FLOORS;
export const CANVA_LOGO = { x: 16, y: 2, w: 40, h: 8 };
export const CANVA_DOOR = { x: 6, w: 16, h: 22 };
/** Side wall thickness in the cutaway (these rattle in the wind). */
export const CANVA_WALL = 4;

/** Blue crown: the published wordmark is white. */
function canvaCrown(g: Grid) {
  g.rect("T", 0, 0, 72, 12);
  g.rect("N", 0, 11, 72, 1);
  g.rect("N", 14, 1, 44, 10);
}

export const CANVA_FACADE = build("canva-facade", CANVA_W, CANVA_H, (g) => {
  canvaCrown(g);
  g.rect("B", 0, 12, 72, CANVA_H - 12);
  for (let f = 0; f < CANVA_FLOORS; f++) {
    const top = CANVA_CROWN + f * CANVA_FLOOR_H;
    g.rect("T", 0, top + CANVA_FLOOR_H - 2, 72, 2);
    for (let row = 0; row < 2; row++)
      for (let j = 0; j < 6; j++) {
        const x = 3 + j * 11;
        const y = top + 2 + row * 15;
        if (f === CANVA_FLOORS - 1 && row === 1 && j < 2) continue; // the door goes here
        g.rect("l", x, y, 9, 12);
        g.rect("a", x + 1, y, 1, 12);
      }
  }
});

/** Inside the tower: floor slabs and a pale back wall. The side walls are drawn by the scene (they rattle). */
export const CANVA_INSIDE = build("canva-inside", CANVA_W, CANVA_H, (g) => {
  canvaCrown(g);
  g.rect("a", 0, 12, 72, CANVA_H - 12);
  for (let f = 0; f < CANVA_FLOORS; f++) {
    const top = CANVA_CROWN + f * CANVA_FLOOR_H;
    g.rect("T", 0, top + CANVA_FLOOR_H - 3, 72, 3);
    g.rect("s", 20, top + 6, 32, 10);
    g.rect("r", 20, top + 6, 32, 1);
  }
});

export const CANVA_DOORS = {
  open: build("canva-door-open", CANVA_DOOR.w, CANVA_DOOR.h, (g) => {
    g.rect("N", 0, 0, 16, 22);
    g.rect("j", 1, 1, 14, 21);
  }),
  shut: build("canva-door-shut", CANVA_DOOR.w, CANVA_DOOR.h, (g) => {
    g.rect("N", 0, 0, 16, 22);
    g.rect("c", 1, 1, 6, 21);
    g.rect("c", 9, 1, 6, 21);
    g.rect("N", 7, 1, 2, 21);
    g.px("w", 6, 11);
    g.px("w", 9, 11);
  }),
};

// ---- The big hand ------------------------------------------------------------------------------

/** A giant open hand, fingers down, palm facing right, with a cuff. The sleeve above is drawn to the screen top. */
export const HAND = build("hand", 40, 52, (g) => {
  g.rect("B", 7, 0, 24, 6);
  g.rect("w", 6, 6, 26, 7);
  g.rect("r", 6, 12, 26, 1);
  g.rect("u", 8, 13, 22, 20);
  g.rect("U", 8, 13, 3, 20);
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 5 + (i === 3 ? 1 : 0);
    const len = [14, 17, 16, 12][i];
    g.rect("u", x, 33, 4, len);
    g.rect("U", x, 33, 1, len);
    g.rect("p", x + 1, 33 + len - 2, 2, 1);
  }
  // Thumb, angled out to the right
  g.rect("u", 30, 18, 4, 10);
  g.rect("u", 33, 24, 4, 8);
  g.rect("u", 35, 29, 3, 4);
  g.rect("U", 30, 27, 3, 1);
});
