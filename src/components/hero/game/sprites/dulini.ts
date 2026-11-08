import { compose, type Part, type Sprite } from "./types";

/**
 * Dulini: 24 × 32, side view facing right. Brown skin, black hair pulled back into a bun at the back of the head,
 * orange top, deep blue trousers. Frames are composed from a head, a torso and legs so every pose shares one face.
 *
 * k ink · h hair · H hair highlight · S skin · D skin shade · E mouth · o top · O top shade · T trousers · N far leg
 */
export const W = 24;
export const H = 32;

const HEAD: Part = [
  "........................",
  "...kkkk.................",
  "..khhhhk..kkkkkk........",
  ".khhHHhhkkhhhhhhkk......",
  ".khhHhhhhhhhhHHHhhk.....",
  "..khhhhhhhhhhhhhhhhk....",
  "...kkhhhhhhhhhhhhhhk....",
  ".....khhhhhhhhhhhhhhk...",
  ".....khhhhhhhhhhSSSSk...",
  ".....khhhhhhhhSSShhSk...",
  ".....khhhhhSShSSSSkSk...",
  ".....khhhhhSDhSSSSkSSk..",
  ".....khhhhhhDSSSSSSSSSk.",
  "......khhhhhDSSSSSSSSk..",
  "......khhhhhkDSSSSEESk..",
  ".......kkkkk.kDSSSSSk...",
  ".............kDSSkkk....",
];

/** Same head, smiling: open grin. */
const HEAD_SMILE: Part = [
  ...HEAD.slice(0, 13),
  "......khhhhhDSSSSkkkSk..",
  "......khhhhhkDSSSSkwSk..",
  ".......kkkkk.kDSSSSSk...",
  ".............kDSSkkk....",
];

// Torsos start at row 17. Arm hangs at the side; hand at the hip.
const TORSO_IDLE: Part = [
  "..........kkoooookk.....",
  ".........kooOOOooooook..",
  ".........kooOOOoooooOk..",
  ".........kooOOOoooooOk..",
  ".........kooOSDOooooOk..",
  ".........kooOSDOooooOk..",
  ".........kOOkSSkOOOOOk..",
  "............kk..........",
];

const TORSO_ARM_FWD: Part = [
  "..........kkoooookk.....",
  ".........kooOOOooooook..",
  ".........koooOOOooooOk..",
  ".........kooooOOOkkoOk..",
  ".........koooookSDDSkk..",
  ".........kooooookkkSSk..",
  ".........koooooooookk...",
  ".........kOOOOOOOOOOk...",
];

const TORSO_ARM_BACK: Part = [
  "..........kkoooookk.....",
  ".........kOOOooooooook..",
  "........kOOOOoooooooOk..",
  ".......kkOOkoooooooOOk..",
  "......kSDkkooooooooOk...",
  "......kSSk.kooooooooOk..",
  ".......kk..kooooooooOk..",
  "..........kOOOOOOOOOOk..",
];

// Legs start at row 25 (the waist).
const LEGS_STAND: Part = [
  "..........kTTTTTTTTk....",
  "..........kTTTTNTTTk....",
  "..........kTTTTNTTTk....",
  "..........kTTTTNTTTk....",
  "..........kTTTTNTTTk....",
  "..........kkkkkkkkkkk...",
  "..........kkkkkkkkkkkk..",
];

/** Stride, near leg in front. */
const LEGS_STRIDE_A: Part = [
  "..........kTTTTTTTTk....",
  ".........kNNNNkTTTTk....",
  "........kNNNNk.kTTTTk...",
  ".......kNNNNk...kTTTTk..",
  "......kNNNk......kTTTk..",
  ".....kkkkk.......kkkkkk.",
  ".....kkkk.........kkkkkk",
];

/** Stride, far leg in front. */
const LEGS_STRIDE_B: Part = [
  "..........kTTTTTTTTk....",
  ".........kTTTTkNNNNk....",
  "........kTTTTk.kNNNNk...",
  ".......kTTTTk...kNNNNk..",
  "......kTTTk......kNNNk..",
  ".....kkkkk.......kkkkkk.",
  ".....kkkk.........kkkkkk",
];

/** Passing: legs together, back foot lifted. */
const LEGS_PASS: Part = [
  "..........kTTTTTTTTk....",
  "..........kTTTTNTTTk....",
  "..........kTTTTNTTTk....",
  "..........kTTTkNTTTk....",
  ".........kkkkk.kTTTk....",
  ".........kkkk..kkkkkk...",
  "...............kkkkkkk..",
];

const body = (id: string, head: Part, torso: Part, legs: Part, bob = 0): Sprite =>
  compose(id, W, H, [
    [legs, 0, 25],
    [torso, 0, 17 + bob],
    [head, 0, bob],
  ]);

export const IDLE = [
  body("d-idle-0", HEAD, TORSO_IDLE, LEGS_STAND),
  body("d-idle-1", HEAD, TORSO_IDLE, LEGS_STAND, 1),
];

export const WALK = [
  body("d-walk-0", HEAD, TORSO_ARM_BACK, LEGS_STRIDE_A),
  body("d-walk-1", HEAD, TORSO_IDLE, LEGS_PASS, -1),
  body("d-walk-2", HEAD, TORSO_ARM_FWD, LEGS_STRIDE_B),
  body("d-walk-3", HEAD, TORSO_IDLE, LEGS_PASS, -1),
];

export const SMILE = body("d-smile", HEAD_SMILE, TORSO_IDLE, LEGS_STAND);

export const ALL_FRAMES: Sprite[] = [...IDLE, ...WALK, SMILE];
