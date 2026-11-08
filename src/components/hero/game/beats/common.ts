import { IDLE, WALK } from "../sprites/dulini";
import { BEAT_MS } from "../timeline";
import type { World } from "../world";

/** A point to centre the iris on, in world coordinates; `closed` runs 0 (open) to 1 (shut). */
export type Iris = { x: number; y: number; closed: number };

export type Beat = {
  /** Camera focus (world x at the centre of the panel) at progress p. Continuous across beat boundaries. */
  focus(p: number): number;
  /** Landmarks this beat owns, drawn every frame whatever the current beat (they read g.phase / g.beat). */
  scenery?(g: World): void;
  /** Characters and effects, drawn only while this beat is current. */
  actors(g: World, p: number): Iris | void;
};

/** Walking speed, px per ms, and the walk cycle's frame length. */
export const WALK_SPEED = 0.054;
export const WALK_FRAME_MS = 130;
export const IDLE_FRAME_MS = 520;

export const walkFrame = (m: number) => WALK[Math.floor(m / WALK_FRAME_MS) % WALK.length];
export const idleFrame = (t: number) => IDLE[Math.floor(t / IDLE_FRAME_MS) % IDLE.length];

/** Milliseconds into beat i at progress p. */
export const msIn = (i: number, p: number) => p * BEAT_MS[i];

/** Facade dissolve: 0 solid … 3 gone, stepping every `step` ms from `from`. Reverse when `back`. */
export function dissolve(m: number, from: number, step = 100, back = false) {
  const k = Math.max(0, Math.min(3, Math.floor((m - from) / step) + 1));
  return back ? 3 - k : m < from ? 0 : k;
}

/** Helper for "this many ms into the current beat". */
export const local = (g: World) => msIn(g.beat, g.p);
