"use client";

import { useEffect, useRef } from "react";
import {
  drawEase,
  drawGlyphs,
  drawGrain,
  LABEL_AT,
  LANE_ORDER,
  LANES,
  layoutLabel,
  layoutStroke,
  paintStroke,
  placeGlyphs,
  prepareStroke,
  shade,
  type Glyph,
  type PreparedStroke,
} from "./brush";
import { relativeLuminance } from "./contrast";
import { SKILLS } from "./skills";
import { STATIC_COUNT, StaticStroke } from "./StaticStroke";

// ---- Knobs -----------------------------------------------------------------------------------

/** A new stroke starts this often, ms. With the timings below, two or three show at once. */
export const INTERVAL = 1600;
/** Time for the brush to travel the stroke, ms. */
export const DRAW = 1500;
/** Time a finished stroke holds before fading, ms. */
export const HOLD = 2300;
/** Fade-out, overlapping the next strokes' drawing, ms. Draw + hold + fade stays under three intervals, so a lane is clear before it is reused. */
export const FADE = 900;
/** Reduced motion: strokes appear fully painted, fading in and out on a slower schedule, ms. */
export const CALM_INTERVAL = 3000;
export const CALM_HOLD = 7100;
/** The label paints in once the brush has passed its right-hand end, over this much of the stroke. */
const LABEL_IN_SPAN = 0.14;
const LABEL_LATEST = 0.84;
/** Label opacity: a touch under 1 so the paint's colour breathes through the white. */
const LABEL_ALPHA = 0.95;
const MAX_DPR = 2;
const GRAIN_SIZE = 128;
/** Longest frame step we accept, so a stalled tab does not jump the animation, ms. */
const MAX_STEP = 64;

// ---- Engine ----------------------------------------------------------------------------------

type Layer = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; grain: CanvasPattern | null };

type Label = { glyphs: Glyph[]; font: string; shadow: { color: string; blur: number }; from: number };

type Slot = {
  /** Position in the endless sequence; the skill is k modulo the list length. */
  k: number;
  /** Offscreen layer (null for the server-rendered strokes, which use `el`). */
  layer: Layer | null;
  el: SVGElement | null;
  stroke: PreparedStroke | null;
  label: Label | null;
  /** What the layer currently shows, so it is only repainted when that changes. */
  drawn: number;
  labelDrawn: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function createEngine(opts: {
  wrap: HTMLElement;
  canvas: HTMLCanvasElement;
  staticEls: SVGElement[];
  animate: boolean;
  isActive: () => boolean;
}) {
  const { wrap, canvas, staticEls, animate, isActive } = opts;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ctx: CanvasRenderingContext2D = context;

  const interval = animate ? INTERVAL : CALM_INTERVAL;
  const life = animate ? DRAW + HOLD + FADE : FADE + CALM_HOLD + FADE;

  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = grainCanvas.height = GRAIN_SIZE;
  const grainCtx = grainCanvas.getContext("2d");
  if (grainCtx) drawGrain(grainCtx, GRAIN_SIZE);

  // One layer per live stroke plus one being prepared.
  const layers: Layer[] = Array.from({ length: LANES.length + 1 }, () => {
    const c = document.createElement("canvas");
    const x = c.getContext("2d")!;
    return { canvas: c, ctx: x, grain: grainCtx ? x.createPattern(grainCanvas, "repeat") : null };
  });
  const free = [...layers];

  // The font the rest of the site uses for headings (next/font exposes it as a CSS variable).
  const family =
    getComputedStyle(document.documentElement).getPropertyValue("--font-inter-tight").trim() || "system-ui, sans-serif";
  const fontAt = (size: number) => `600 ${size}px ${family}`;
  let fontsReady = false;

  let W = 0;
  let H = 0;
  let dpr = 1;
  // Start as if the server-rendered strokes (the first STATIC_COUNT) had just been painted.
  let clock = (STATIC_COUNT - 1) * interval + (animate ? DRAW : FADE);
  let last = 0;
  let raf = 0;
  const slots = new Map<number, Slot>();
  let lastSignature = "";

  function prepare(slot: Slot) {
    if (!slot.layer) return;
    const index = slot.k % SKILLS.length;
    const skill = SKILLS[index];
    const lane = LANE_ORDER[slot.k % LANES.length];
    const layout = layoutStroke(index, lane, W, H, skill.name.length);
    slot.stroke = prepareStroke(index, layout, skill.color);

    const m = slot.layer.ctx;
    const measure = (text: string, size: number) => {
      m.font = fontAt(size);
      return m.measureText(text).width;
    };
    const label = layoutLabel(skill.name, layout, measure);
    const longest = Math.max(...label.lines.map((l) => measure(l.text, label.size)));
    m.font = fontAt(label.size);
    const glyphs = label.lines.flatMap((line) =>
      placeGlyphs(layout.curve, line, (n) => m.measureText(line.text.slice(0, n)).width),
    );
    // Paler paint gets a stronger, deeper shadow so white lettering still reads on it.
    const lum = relativeLuminance(skill.color);
    slot.label = {
      glyphs,
      font: fontAt(label.size),
      shadow: { color: shade(skill.color, -0.55, 0.3 + 0.5 * lum), blur: label.size * 0.35 * dpr },
      from: Math.min(LABEL_LATEST, LABEL_AT + longest / 2 / layout.curve.length + 0.02),
    };
    slot.drawn = -1;
    slot.labelDrawn = -1;
  }

  function makeSlot(k: number): Slot | null {
    if (k < STATIC_COUNT) {
      return { k, layer: null, el: staticEls[k] ?? null, stroke: null, label: null, drawn: 1, labelDrawn: 1 };
    }
    const layer = free.pop();
    if (!layer) return null;
    const slot: Slot = { k, layer, el: null, stroke: null, label: null, drawn: -1, labelDrawn: -1 };
    prepare(slot);
    return slot;
  }

  function release(slot: Slot) {
    if (slot.layer) free.push(slot.layer);
    if (slot.el) {
      slot.el.style.opacity = "0";
      slot.el.style.visibility = "hidden";
    }
    slots.delete(slot.k);
  }

  /** Time since stroke k started, its paint progress, overall opacity and label opacity. */
  function state(slot: Slot) {
    const e = clock - slot.k * interval;
    if (animate) {
      const p = drawEase(e / DRAW);
      const f = (e - DRAW - HOLD) / FADE;
      const alpha = f <= 0 ? 1 : f >= 1 ? 0 : 1 - f * f;
      const label = slot.label ? smoothstep(slot.label.from, slot.label.from + LABEL_IN_SPAN, p) : 1;
      return { e, p, alpha, label };
    }
    const fadeIn = clamp(e / FADE, 0, 1);
    const fadeOut = clamp((e - FADE - CALM_HOLD) / FADE, 0, 1);
    return { e, p: 1, alpha: fadeIn * (1 - fadeOut), label: 1 };
  }

  function step() {
    if (!W || !H) return;
    const newest = Math.floor(clock / interval);
    const oldest = Math.max(0, Math.floor((clock - life) / interval) + 1);

    for (const slot of [...slots.values()]) if (slot.k < oldest) release(slot);
    // newest + 1 is prepared ahead, so the frame it starts on only has to paint.
    for (let k = oldest; k <= newest + 1; k++) {
      if (slots.has(k)) continue;
      const slot = makeSlot(k);
      if (slot) slots.set(k, slot);
    }

    const ordered = [...slots.values()].sort((a, b) => a.k - b.k);
    const states = ordered.map(state);
    let signature = "";
    ordered.forEach((slot, i) => {
      const s = states[i];
      if (s.e < 0) return;
      if (slot.el) slot.el.style.opacity = `${s.alpha}`;
      if (slot.layer && slot.stroke && slot.label && (s.p !== slot.drawn || s.label !== slot.labelDrawn)) {
        const label = slot.label;
        const labelAlpha = s.label * LABEL_ALPHA;
        paintStroke(slot.layer.ctx, slot.stroke, s.p, W, H, slot.layer.grain, (c) =>
          drawGlyphs(c, label.glyphs, label.font, labelAlpha, label.shadow),
        );
        slot.drawn = s.p;
        slot.labelDrawn = s.label;
        signature += "*";
      }
      signature += `${slot.k}:${s.alpha.toFixed(3)};`;
    });

    if (signature === lastSignature) return;
    lastSignature = signature;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ordered.forEach((slot, i) => {
      const s = states[i];
      if (!slot.layer || s.e < 0 || s.alpha <= 0) return;
      ctx.globalAlpha = s.alpha;
      ctx.drawImage(slot.layer.canvas, 0, 0);
    });
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    raf = 0;
    if (!shouldRun()) return;
    clock += Math.min(MAX_STEP, now - last);
    last = now;
    step();
    raf = requestAnimationFrame(frame);
  }

  function shouldRun() {
    return fontsReady && isActive() && !document.hidden && W > 0 && H > 0;
  }

  function wake() {
    if (raf || !shouldRun()) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    W = w;
    H = h;
    dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    for (const c of [canvas, ...layers.map((l) => l.canvas)]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    for (const l of layers) l.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Lay every live stroke out again at the new size; each repaints at its current progress.
    if (fontsReady) for (const slot of slots.values()) prepare(slot);
    lastSignature = "";
    wake();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();
  document.addEventListener("visibilitychange", wake);
  // Labels are painted onto the canvas, so wait for the heading font (the static strokes show meanwhile).
  let destroyed = false;
  document.fonts
    .load(fontAt(20))
    .catch(() => undefined)
    .then(() => {
      if (destroyed) return;
      fontsReady = true;
      for (const slot of slots.values()) prepare(slot);
      wake();
    });

  return {
    wake,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const el of staticEls) {
        el.style.opacity = "";
        el.style.visibility = "";
      }
    },
  };
}

// ---- Component -------------------------------------------------------------------------------

/**
 * Broad paint strokes, two or three at a time, each carrying a skill painted along its curve.
 * `animate` is null until the motion preference is known on the client; until then (and without
 * JavaScript) the server-rendered strokes show.
 */
export function PaintStrokes({ active, animate }: { active: boolean; animate: boolean | null }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const engineRef = useRef<ReturnType<typeof createEngine>>(null);

  useEffect(() => {
    activeRef.current = active;
    engineRef.current?.wake();
  }, [active]);

  useEffect(() => {
    if (animate === null) return;
    const wrap = wrapRef.current!;
    const engine = createEngine({
      wrap,
      canvas: canvasRef.current!,
      staticEls: Array.from(wrap.querySelectorAll<SVGElement>("[data-static-stroke]")),
      animate,
      isActive: () => activeRef.current,
    });
    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [animate]);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <StaticStroke />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
