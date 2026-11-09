import { BOARD_MS, WALK_AT as BEACH_WALK_AT } from "./beats/00-sri-lanka";
import { TAKEOFF_MS } from "./beats/01-flight";
import { JUMP_AT, LAND_AT as UNI_LAND_AT } from "./beats/02-jump";
import { BENCH_AT, COAT_AT, SIT_AT, SPARK_AT, STAND_AT, TYPE_FRAME_MS } from "./beats/03-phd";
import { DROP_AT, DROP_EVERY, ENTER_MS, GROW_AT, GROW_EVERY, GROW_MS, LEAP_AT, SHAKE_MS } from "./beats/04-seer-grows";
import { CROWD_GONE_MS, LEAP_MS } from "./beats/05-seer-crumbles";
import { CHEER_AT, PIC_AT, STREAM_MS } from "./beats/06-leonardo";
import { SHUT_AT, SWEEP_AT, UP_AT } from "./beats/07-hand";
import { CANVA_PEOPLE, LINK_AT, LINK_EVERY, TERM_AT, TERM_LINE_MS, TERM_LINES, WIND_AT } from "./beats/08-canva";
import { FLIP_AT, LAND_AT as FALL_LAND_AT, OUT_AT } from "./beats/09-fall";
import { IRIS_AT, IRIS_MS, STAR_AT } from "./beats/10-wave";
import { BEAT, BEAT_MS, CARDS, STARTS, TOTAL } from "./timeline";

/**
 * The game's sound effects, synthesised with the Web Audio API (no audio files). No background music.
 * Everything is a cue at a story time, so sound follows the game clock: it pauses with the game (hero off screen,
 * tab hidden) and loops with it. Loaded only after the visitor's first click or key press (browsers block sound
 * before that). No React here.
 */

// ---- Knobs -----------------------------------------------------------------------------------

/** Overall volume, then the effects' share of it. */
const MASTER_GAIN = 0.5;
const SFX_GAIN = 0.55;
/** How far ahead cues are handed to the audio clock, story ms. */
const LOOKAHEAD = 160;
/** A step bigger than this (or backwards) is a seek: skip ahead without playing what was jumped over. */
const MAX_STEP = 500;

// ---- Synth -----------------------------------------------------------------------------------

type Out = { ctx: AudioContext; sfx: GainNode; noise: AudioBuffer };
type Play = (o: Out, when: number) => void;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** "C5", "F#3" → frequency. */
function pitch(name: string) {
  const m = /^([A-G])(#?)(\d)$/.exec(name)!;
  return midi(12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] ? 1 : 0));
}

function tone(
  o: Out,
  dest: AudioNode,
  when: number,
  { freq, to, dur, type = "square", gain = 0.3 }: { freq: number; to?: number; dur: number; type?: OscillatorType; gain?: number },
) {
  const { ctx } = o;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, when + dur);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.006);
  g.gain.setValueAtTime(gain, when + Math.max(0.006, dur * 0.6));
  g.gain.linearRampToValueAtTime(0, when + dur);
  osc.connect(g).connect(dest);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

function noise(
  o: Out,
  dest: AudioNode,
  when: number,
  { dur, freq, to, gain = 0.3, q = 1, attack = 0.005 }: { dur: number; freq: number; to?: number; gain?: number; q?: number; attack?: number },
) {
  const { ctx } = o;
  const src = ctx.createBufferSource();
  src.buffer = o.noise;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, when);
  if (to) f.frequency.exponentialRampToValueAtTime(to, when + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + attack);
  g.gain.linearRampToValueAtTime(0, when + dur);
  src.connect(f).connect(g).connect(dest);
  src.start(when);
  src.stop(when + dur + 0.02);
}

// ---- Sound effects ---------------------------------------------------------------------------

const sfx = {
  /** Level card: a quick rising arpeggio. */
  card: ((o, w) =>
    ["C5", "E5", "G5", "C6"].forEach((n, i) => tone(o, o.sfx, w + i * 0.07, { freq: pitch(n), dur: 0.09, gain: 0.18 }))) as Play,
  board: ((o, w) => tone(o, o.sfx, w, { freq: 520, to: 880, dur: 0.12, gain: 0.15 })) as Play,
  takeoff: ((o, w) => noise(o, o.sfx, w, { dur: 1.6, freq: 300, to: 2400, gain: 0.25, attack: 0.5 })) as Play,
  jump: ((o, w) => tone(o, o.sfx, w, { freq: 260, to: 780, dur: 0.18, gain: 0.22 })) as Play,
  land: ((o, w) => {
    tone(o, o.sfx, w, { freq: 140, to: 50, dur: 0.14, type: "triangle", gain: 0.5 });
    noise(o, o.sfx, w, { dur: 0.12, freq: 600, gain: 0.2 });
  }) as Play,
  key: ((o, w) => noise(o, o.sfx, w, { dur: 0.03, freq: 3500, q: 4, gain: 0.12 })) as Play,
  poof: ((o, w) =>
    ["E6", "G6", "B6", "E7"].forEach((n, i) => tone(o, o.sfx, w + i * 0.04, { freq: pitch(n), dur: 0.08, type: "triangle", gain: 0.12 }))) as Play,
  bubble: ((o, w) => tone(o, o.sfx, w, { freq: 600, to: 1100, dur: 0.06, type: "sine", gain: 0.12 })) as Play,
  zap: ((o, w) => {
    tone(o, o.sfx, w, { freq: 1800, to: 300, dur: 0.18, type: "sawtooth", gain: 0.12 });
    noise(o, o.sfx, w, { dur: 0.15, freq: 4000, q: 2, gain: 0.15 });
  }) as Play,
  door: ((o, w) => tone(o, o.sfx, w, { freq: 330, to: 220, dur: 0.08, gain: 0.12 })) as Play,
  /** A floor pops into place; k raises the pitch as the building grows. */
  floor: (k: number): Play => (o, w) => tone(o, o.sfx, w, { freq: pitch("C4") * Math.pow(2, (k * 2) / 12), dur: 0.1, gain: 0.18 }),
  rumble: ((o, w) => noise(o, o.sfx, w, { dur: SHAKE_MS / 1000, freq: 120, q: 0.7, gain: 0.45, attack: 0.1 })) as Play,
  crash: ((o, w) => {
    noise(o, o.sfx, w, { dur: 0.35, freq: 400, to: 120, q: 0.6, gain: 0.4 });
    tone(o, o.sfx, w, { freq: 90, to: 40, dur: 0.25, type: "triangle", gain: 0.4 });
  }) as Play,
  /** Magic: a shimmering run upwards as each picture forms. */
  magic: ((o, w) =>
    ["C6", "E6", "G6", "B6", "D7", "G7"].forEach((n, i) =>
      tone(o, o.sfx, w + i * 0.05, { freq: pitch(n), dur: 0.14, type: "triangle", gain: 0.1 }),
    )) as Play,
  cheer: ((o, w) => ["C5", "E5", "G5"].forEach((n) => tone(o, o.sfx, w, { freq: pitch(n), dur: 0.35, gain: 0.08 }))) as Play,
  whoosh: ((o, w) => noise(o, o.sfx, w, { dur: 0.6, freq: 2000, to: 300, gain: 0.3, attack: 0.15 })) as Play,
  swoosh: ((o, w) => noise(o, o.sfx, w, { dur: 1.2, freq: 400, to: 1800, gain: 0.25, attack: 0.3 })) as Play,
  /** A connection lands; k climbs a pentatonic scale so the network plays a little tune. */
  link: (k: number): Play => (o, w) => {
    const scale = [0, 2, 4, 7, 9];
    const n = 72 + scale[k % 5] + 12 * Math.floor(k / 5);
    tone(o, o.sfx, w, { freq: midi(n), dur: 0.07, gain: 0.12 });
  },
  window: ((o, w) => tone(o, o.sfx, w, { freq: 880, to: 1320, dur: 0.08, type: "triangle", gain: 0.15 })) as Play,
  wind: ((o, w) => noise(o, o.sfx, w, { dur: 6, freq: 500, to: 900, q: 0.5, gain: 0.3, attack: 1.2 })) as Play,
  fall: ((o, w) => tone(o, o.sfx, w, { freq: 1400, to: 300, dur: (FLIP_AT - OUT_AT) / 1000, type: "sine", gain: 0.12 })) as Play,
  /** The wave: a little victory jingle. */
  victory: ((o, w) =>
    [
      ["G5", 0, 0.1],
      ["C6", 0.1, 0.1],
      ["E6", 0.2, 0.1],
      ["G6", 0.3, 0.32],
    ].forEach(([n, at, d]) => tone(o, o.sfx, w + (at as number), { freq: pitch(n as string), dur: d as number, gain: 0.16 }))) as Play,
  iris: ((o, w) => tone(o, o.sfx, w, { freq: 900, to: 120, dur: IRIS_MS / 1000, type: "triangle", gain: 0.12 })) as Play,
};

// ---- The cue sheet ---------------------------------------------------------------------------

type Cue = { t: number; play: Play };

function sfxCues(): Cue[] {
  const at = (beat: number, ms: number, play: Play): Cue => ({ t: STARTS[beat] + ms, play });
  const cues: Cue[] = [];
  for (const c of CARDS) cues.push(at(c.beat, c.at * BEAT_MS[c.beat], sfx.card));
  cues.push(at(BEAT.sriLanka, BEACH_WALK_AT, sfx.door), at(BEAT.sriLanka, BOARD_MS, sfx.board));
  cues.push(at(BEAT.flight, TAKEOFF_MS - 300, sfx.takeoff));
  cues.push(at(BEAT.jump, JUMP_AT, sfx.jump), at(BEAT.jump, UNI_LAND_AT, sfx.land));
  for (let m = SIT_AT; m < STAND_AT; m += TYPE_FRAME_MS) cues.push(at(BEAT.phd, m, sfx.key));
  cues.push(at(BEAT.phd, COAT_AT, sfx.poof));
  for (let k = 0; k < 4; k++) cues.push(at(BEAT.phd, BENCH_AT + 150 + k * 350, sfx.bubble));
  cues.push(at(BEAT.phd, SPARK_AT, sfx.zap));
  cues.push(at(BEAT.seerGrows, ENTER_MS, sfx.door));
  for (let k = 1; k <= 5; k++) cues.push(at(BEAT.seerGrows, GROW_AT + (k - 1) * GROW_EVERY + GROW_MS * 0.6, sfx.floor(k)));
  cues.push(at(BEAT.seerCrumbles, 0, sfx.rumble), at(BEAT.seerCrumbles, LEAP_AT, sfx.jump));
  for (let d = 0; d < 6; d++) cues.push(at(BEAT.seerCrumbles, DROP_AT + d * DROP_EVERY, sfx.crash));
  cues.push(at(BEAT.seerCrumbles, LEAP_AT + LEAP_MS, sfx.land));
  cues.push(at(BEAT.leonardo, CROWD_GONE_MS, sfx.poof));
  for (const p of PIC_AT) cues.push(at(BEAT.leonardo, p - STREAM_MS, sfx.magic));
  cues.push(at(BEAT.leonardo, CHEER_AT, sfx.cheer));
  cues.push(at(BEAT.hand, 0, sfx.whoosh), at(BEAT.hand, SWEEP_AT, sfx.swoosh), at(BEAT.hand, SHUT_AT, sfx.land));
  cues.push(at(BEAT.hand, UP_AT, sfx.whoosh));
  for (let k = 0; k < CANVA_PEOPLE.length; k++) cues.push(at(BEAT.canva, LINK_AT + k * LINK_EVERY + 260, sfx.link(k)));
  cues.push(at(BEAT.canva, TERM_AT, sfx.window));
  for (let m = TERM_AT + 200; m < TERM_AT + 200 + TERM_LINES * 2 * TERM_LINE_MS; m += TERM_LINE_MS / 2)
    cues.push(at(BEAT.canva, m, sfx.key));
  cues.push(at(BEAT.canva, WIND_AT, sfx.wind));
  cues.push(at(BEAT.fall, OUT_AT, sfx.crash), at(BEAT.fall, OUT_AT + 50, sfx.fall), at(BEAT.fall, FALL_LAND_AT, sfx.land));
  cues.push(at(BEAT.wave, STAR_AT, sfx.victory), at(BEAT.wave, IRIS_AT, sfx.iris));
  return cues;
}

// ---- The player ------------------------------------------------------------------------------

export type Sound = {
  /** Called every animated frame with the story time before and after the step. */
  advance(prev: number, t: number): void;
  /** The game loop started or stopped (hero scrolled away, tab hidden). */
  setRunning(running: boolean): void;
  setMuted(muted: boolean): void;
  dispose(): void;
};

/** `ctx` must be created inside the click or key press that unlocks audio. */
export function createSound(ctx: AudioContext): Sound {
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(ctx.destination);
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const out: Out = { ctx, sfx: master, noise: buf };
  /** A fresh effects bus; dropping the old one silences anything already queued on it. */
  const buses = () => {
    if (out.sfx !== master) out.sfx.disconnect();
    const g = ctx.createGain();
    g.gain.value = SFX_GAIN;
    g.connect(master);
    out.sfx = g;
  };
  buses();

  const cues = sfxCues().sort((a, b) => a.t - b.t);
  // Story time unwrapped: laps of the loop so far, plus the time in this lap. Cues are handed over once each.
  let lap = 0;
  let cursor: number | null = null;
  let running = false;
  let muted = false;

  const sync = () => {
    if (running && !muted) void ctx.resume();
    else void ctx.suspend();
  };

  return {
    advance(prev, t) {
      if (!running || muted) return;
      const wrapped = t < prev - TOTAL / 2;
      if (wrapped) lap++;
      const now = lap * TOTAL + t;
      const step = wrapped ? t + TOTAL - prev : t - prev;
      // First frame, a seek or a long stall: start from here without replaying what was skipped.
      if (cursor === null || step < 0 || step > MAX_STEP) cursor = now;
      const until = now + LOOKAHEAD;
      for (const L of [lap, lap + 1]) {
        for (const c of cues) {
          const ct = L * TOTAL + c.t;
          if (ct >= cursor && ct < until) c.play(out, ctx.currentTime + Math.max(0, ct - now) / 1000);
        }
      }
      cursor = Math.max(cursor, until);
    },
    // Pausing freezes the audio clock with the story clock, so queued cues stay in step.
    setRunning(r) {
      running = r;
      sync();
    },
    setMuted(m) {
      if (m === muted) return;
      muted = m;
      if (m) buses();
      cursor = null;
      sync();
    },
    dispose() {
      void ctx.close();
    },
  };
}
