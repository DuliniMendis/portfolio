/**
 * The story clock. One loop is TOTAL ms; at any time exactly one beat is current, with a local progress p in 0..1.
 * Everything drawn is a pure function of the time, so seeking and the visibility pause need no extra state.
 * No React or DOM here.
 */

export const BEAT = {
  sriLanka: 0,
  flight: 1,
  jump: 2,
  phd: 3,
  seerGrows: 4,
  seerCrumbles: 5,
  leonardo: 6,
  hand: 7,
  canva: 8,
  fall: 9,
  wave: 10,
} as const;

/** Beat lengths in ms, in story order (section 2 of the plan). Same on every screen size. */
export const BEAT_MS = [2500, 4000, 2500, 5000, 6000, 3500, 5000, 3500, 7000, 3000, 3000] as const;

export const BEAT_NAMES = [
  "Sri Lanka",
  "Flight",
  "Jump to Melbourne",
  "PhD",
  "Seer grows",
  "Seer crumbles",
  "Leonardo.Ai",
  "The big hand",
  "Canva",
  "The fall",
  "Wave",
] as const;

/** Level cards: names only, never years. `at` is when the card starts, as a fraction of its beat. */
export const CARDS: { beat: number; text: string; at: number }[] = [
  { beat: BEAT.sriLanka, text: "SRI LANKA", at: 0 },
  { beat: BEAT.jump, text: "UNIVERSITY OF MELBOURNE", at: 0.55 },
  { beat: BEAT.seerGrows, text: "SEER MEDICAL", at: 0 },
  { beat: BEAT.leonardo, text: "LEONARDO.AI", at: 0 },
  { beat: BEAT.canva, text: "CANVA", at: 0 },
];

/** How long a level card stays up, including its slide in and out, ms. */
export const CARD_MS = 1600;
/** Card slide in / out, ms. */
export const CARD_SLIDE_MS = 220;
/** Iris open at the start of the loop, ms. The close happens inside the wave beat (see beats/10-wave). */
export const IRIS_OPEN_MS = 700;

export const STARTS: number[] = BEAT_MS.reduce<number[]>((acc, len, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BEAT_MS[i - 1]);
  return acc;
}, []);

export const TOTAL = STARTS[STARTS.length - 1] + BEAT_MS[BEAT_MS.length - 1];

/** Wrap any time into the loop. */
export const wrap = (t: number) => ((t % TOTAL) + TOTAL) % TOTAL;

/** The current beat and its local progress. */
export function beatAt(t: number): { i: number; p: number } {
  const tt = wrap(t);
  for (let i = BEAT_MS.length - 1; i >= 0; i--) {
    if (tt >= STARTS[i]) return { i, p: Math.min(1, (tt - STARTS[i]) / BEAT_MS[i]) };
  }
  return { i: 0, p: 0 };
}

/** Progress of beat i at time t, clamped: 0 before it starts, 1 after it ends. */
export function phase(i: number, t: number) {
  const tt = wrap(t);
  return Math.min(1, Math.max(0, (tt - STARTS[i]) / BEAT_MS[i]));
}

/** Time at a point inside a beat (used by the postcards and the static frame). */
export const timeAt = (i: number, p: number) => STARTS[i] + p * BEAT_MS[i];

/** Where the hydrated loop starts: the same moment the server-rendered frame shows (her waving). */
export const STATIC_BEAT = BEAT.wave;
export const STATIC_P = 0.22;
export const START_T = timeAt(STATIC_BEAT, STATIC_P);
