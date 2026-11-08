import { compose, rotate, sprite, type Part, type Sprite } from "./types";

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

/** Sitting: thighs forward, shins down (the chair is drawn separately). */
const LEGS_SIT: Part = [
  "..........kTTTTTTTTTTTk.",
  "..........kTTTTTTTTTTTk.",
  "..........kkkkkkkkkTTTk.",
  "..................kNTTk.",
  "..................kNTTk.",
  "..................kkkkkk",
  "........................",
];

/** Knees up, mid-jump. */
const LEGS_TUCK: Part = [
  "..........kTTTTTTTTTk...",
  "..........kTTTTTTTTTTk..",
  "..........kkkkkkkNTTTk..",
  "...............kNTTTk...",
  "..............kkkkkkk...",
  "..............kkkkkk....",
  "........................",
];

/** Landing squash: wide stance, knees bent (starts at row 28). */
const LEGS_SQUAT: Part = [
  "........kTTTTTTTTTTk....",
  ".......kTTTk...kTTTTk...",
  "......kkkkkk...kkkkkkk..",
  "......kkkkk.....kkkkkkk.",
];

/** Typing: forearms forward to the keyboard. */
const TORSO_TYPE_A: Part = [
  "..........kkoooookk.....",
  ".........kooOOOooooook..",
  ".........koooOOOoooooOk.",
  ".........kooooOOOOOkkkk.",
  ".........kooooooOkSSSSk.",
  ".........koooooooOkkkk..",
  ".........koooooooooOk...",
  ".........kOOOOOOOOOOk...",
];
const TORSO_TYPE_B: Part = [
  "..........kkoooookk.....",
  ".........kooOOOooooook..",
  ".........koooOOOoooooOk.",
  ".........kooooOOOOOOkk..",
  ".........kooooooOOkkkkk.",
  ".........koooooooOkSSSSk",
  ".........kooooooooOkkkk.",
  ".........kOOOOOOOOOOk...",
];

/** Arm straight out in front, for the jump. */
const TORSO_REACH: Part = [
  "..........kkoooookkkkk..",
  ".........kooOOOOOOOSSSk.",
  ".........koooooookkkkk..",
  ".........kooooooooooOk..",
  ".........kooooooooooOk..",
  ".........kooooooooooOk..",
  ".........kooooooooooOk..",
  ".........kOOOOOOOOOOOk..",
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

export const JUMP_UP = body("d-jump-up", HEAD, TORSO_REACH, LEGS_TUCK, -1);
export const JUMP_DOWN = body("d-jump-down", HEAD, TORSO_ARM_BACK, LEGS_STRIDE_A);

export const LAND = compose("d-land", W, H, [
  [LEGS_SQUAT, 0, 28],
  [TORSO_IDLE, 0, 20],
  [HEAD, 0, 3],
]);
export const LAND_SMILE = compose("d-land-smile", W, H, [
  [LEGS_SQUAT, 0, 28],
  [TORSO_IDLE, 0, 20],
  [HEAD_SMILE, 0, 3],
]);

export const SIT_TYPE = [
  body("d-type-0", HEAD, TORSO_TYPE_A, LEGS_SIT),
  body("d-type-1", HEAD, TORSO_TYPE_B, LEGS_SIT),
];

// Lab coat: the top turns white, a collar of the orange top shows, and the coat falls to mid-thigh.
const COAT_SWAP: Record<string, string> = { o: "w", O: "r" };
const COAT_TAIL: Part = [
  ".........kwwwwwwwwwwk....",
  ".........kwwwwrwwwwrk....",
  ".........kkkkkkkkkkkk....",
];
const COLLAR: Part = ["..........kkwoowkk......", "............oo.........."];
const coat = (id: string, torso: Part) =>
  compose(id, W, H, [
    [LEGS_STAND, 0, 25],
    [COAT_TAIL, 0, 25],
    [torso.map((r) => r.replace(/[oO]/g, (c) => COAT_SWAP[c])), 0, 17],
    [COLLAR, 0, 17],
    [HEAD, 0, 0],
  ]);
export const COAT = [coat("d-coat-pour", TORSO_ARM_FWD), coat("d-coat-look", TORSO_IDLE)];

/** Tumbling: the idle frame turned in quarter steps. */
export const TUMBLE = [0, 1, 2, 3].map((q) => rotate(IDLE[0], q, `d-tumble-${q}`));

// ---- Front view, for the wave at the end ----------------------------------------------------------

const HEAD_FRONT: Part = [
  "..........kkkk..........",
  ".........khhhhk.........",
  ".........khHHhk.........",
  ".......kkkhhhhkkk.......",
  "......khhhhhhhhhhk......",
  ".....khhhHHhhhhhhhk.....",
  "....khhhhhhhhhhhhhhk....",
  "....khhhhhhhhhhhhhhk....",
  "....khhSSSSSSSSSShhk....",
  "....khSSSSSSSSSSSShk....",
  "....khSSkkSSSSkkSShk....",
  "....khSSkkSSSSkkSShk....",
  "....khSDSSSSSSSSDShk....",
  "....khSSSkSSSSkSSShk....",
  ".....khSSSkkkkSSShk.....",
  "......kkSSSSSSSSkk......",
  ".........kDSSDk.........",
];

const TORSO_FRONT: Part = [
  "......kkoooooookk.......",
  ".....kooooooooooooo.....",
  ".....kOokoooooooo.......",
  ".....kOokoooooooo.......",
  ".....kSkkoooooooo.......",
  ".....kSDkoooooooo.......",
  ".....kSSkoooooooo.......",
  "......kkkOOOOOOOO.......",
];
// The raised arm and the right side of the body, in two hand positions.
const WAVE_ARM_A: Part = [
  ".......................",
  ".......................",
  ".......................",
  ".......................",
  ".......................",
  ".......................",
  ".......................",
  "...................kkk.",
  "..................kSSSk",
  "..................kSSSk",
  "..................kDSk.",
  "..................kSSk.",
  "..................kSSk.",
  ".................kooOk.",
  ".................kooOk.",
  "................kooOk..",
  "................koOk...",
  "................kOk....",
  "...............ooOk....",
  "...............ooOk....",
  "...............ooOk....",
  "...............ooOk....",
  "...............ooOk....",
  "...............ooOk....",
  "...............OOkk....",
];
const WAVE_ARM_B: Part = WAVE_ARM_A.map((r, y) => (y >= 7 && y <= 12 ? "." + r.slice(0, -1) : r)).map((r, y) =>
  y >= 7 && y <= 9 ? r.slice(1) + "." : r,
);
const LEGS_FRONT: Part = [
  ".......kTTTTTTTTk.......",
  ".......kTTTkkTTTk.......",
  ".......kTTNkkTTNk.......",
  ".......kTTNkkTTNk.......",
  ".......kTTNkkTTNk.......",
  "......kkkkkkkkkkkk......",
  "......kkkkk..kkkkk......",
];

const front = (id: string, arm: Part) =>
  compose(id, W, H, [
    [LEGS_FRONT, 0, 25],
    [TORSO_FRONT, 0, 17],
    [arm, 0, 0],
    [HEAD_FRONT, 0, 0],
  ]);
export const WAVE = [front("d-wave-0", WAVE_ARM_A), front("d-wave-1", WAVE_ARM_B)];

/** Facing out, both arms down, smiling (just after the landing). */
const TORSO_FRONT_FULL: Part = TORSO_FRONT.map((r) => {
  const left = r.slice(0, 12);
  return left + [...left].reverse().join("");
});
export const FRONT = compose("d-front", W, H, [
  [LEGS_FRONT, 0, 25],
  [TORSO_FRONT_FULL, 0, 17],
  [HEAD_FRONT, 0, 0],
]);

/** Her face in the plane window: 7 × 7, bun at the back. */
export const WINDOW_FACE = sprite("d-window", [
  ".kk....",
  "khhkkk.",
  "khhhhhk",
  ".khhSSk",
  ".khSkSk",
  ".khSSSk",
  "..kkkk.",
]);

export const ALL_FRAMES: Sprite[] = [
  ...IDLE,
  ...WALK,
  JUMP_UP,
  JUMP_DOWN,
  LAND,
  LAND_SMILE,
  ...SIT_TYPE,
  ...COAT,
  ...TUMBLE,
  ...WAVE,
  FRONT,
  WINDOW_FACE,
];
