"use client";

import { useEffect, useRef } from "react";
import {
  drawEase,
  drawGrain,
  LABEL_AT,
  LABEL_SPAN,
  layoutStroke,
  paintStroke,
  pointAt,
  prepareStroke,
  shade,
  widthAt,
  type PreparedStroke,
} from "./brush";
import { LIGHT_INK, readableTextColor } from "./contrast";
import { SKILLS } from "./skills";
import { StaticStroke } from "./StaticStroke";

// ---- Knobs -----------------------------------------------------------------------------------

/** Time for the brush to travel the stroke, ms. */
export const DRAW = 1500;
/** Time the finished stroke holds before the next one starts drawing, ms. */
export const HOLD = 1300;
/** Previous stroke fade-out, overlapping the next draw, ms. */
export const FADE = 900;
/** Reduced motion: how long each stroke shows before cross-fading to the next, ms. */
export const CALM_HOLD = 4000;
/**
 * The label fades in once the brush has painted past its right-hand end, over this much of the
 * stroke, so it never floats over bare paper. Never later than LABEL_LATEST.
 */
const LABEL_IN_SPAN = 0.16;
const LABEL_LATEST = 0.84;
/** Label rises this far (px) as it appears. */
const LABEL_RISE = 6;
/** Maximum label tilt, degrees (where it sits along the stroke is LABEL_AT in brush.ts). */
const LABEL_MAX_TILT = 8;
/** Label font size relative to stroke width, clamped; smallest size we shrink to for long labels. */
const LABEL_FONT = 0.42;
const LABEL_FONT_RANGE = [18, 44] as const;
const LABEL_MIN_FONT = 14;
/** Label box limits: width relative to the stroke's span, height relative to its width. */
const LABEL_MAX_WIDTH = 0.66;
const LABEL_MAX_HEIGHT = 0.72;
/** The rotated label box must stay within this fraction of the painted band along its whole length. */
const LABEL_BAND = 0.8;
const MAX_DPR = 2;
const GRAIN_SIZE = 128;
/** Longest frame step we accept, so a stalled tab does not jump the animation, ms. */
const MAX_STEP = 64;

// ---- Engine ----------------------------------------------------------------------------------

type Layer = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; grain: CanvasPattern | null };

type Slot = {
  index: number;
  /** Clock time this stroke started, ms. */
  start: number;
  /** Offscreen layer and label this stroke owns; both null for the server-rendered static stroke. */
  layer: Layer | null;
  label: HTMLElement | null;
  stroke: PreparedStroke | null;
  angle: number;
  /** Painted progress at which the label starts to appear. */
  labelFrom: number;
  /** Progress last painted, so we only repaint when it changes. */
  drawn: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Shrink the label until it fits on the stroke: one line if possible, else wrapped, always inside
 * the width/height limits and passing `onPaint` (the rotated box must sit on the painted band).
 */
function fitLabel(
  el: HTMLElement,
  text: string,
  width: number,
  height: number,
  preferred: number,
  onPaint: (w: number, h: number) => boolean,
) {
  // Whole pixels: scrollWidth/scrollHeight are integers, so a fractional limit would never be met.
  const maxW = Math.floor(width);
  const maxH = Math.floor(height);
  el.textContent = text;
  // Measure unrotated, and by the text's own line boxes: a wrapped, balanced label is narrower than its box.
  el.style.transform = "none";
  const range = document.createRange();
  range.selectNodeContents(el);
  const textWidth = () => Math.max(...Array.from(range.getClientRects(), (r) => r.width));
  const ok = () => el.scrollWidth <= maxW && el.scrollHeight <= maxH && onPaint(textWidth(), el.offsetHeight);
  el.style.maxWidth = `${maxW}px`;
  el.style.whiteSpace = "nowrap";
  for (let size = preferred; size >= Math.max(LABEL_MIN_FONT, preferred * 0.75); size--) {
    el.style.fontSize = `${size}px`;
    if (ok()) return;
  }
  el.style.whiteSpace = "normal";
  for (let size = preferred; size > LABEL_MIN_FONT; size--) {
    el.style.fontSize = `${size}px`;
    if (ok()) return;
  }
  el.style.fontSize = `${LABEL_MIN_FONT}px`;
}

function createEngine(opts: {
  wrap: HTMLElement;
  canvas: HTMLCanvasElement;
  staticEl: HTMLElement;
  labels: [HTMLElement, HTMLElement];
  animate: boolean;
  isActive: () => boolean;
}) {
  const { wrap, canvas, staticEl, labels, animate, isActive } = opts;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ctx: CanvasRenderingContext2D = context;

  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = grainCanvas.height = GRAIN_SIZE;
  const grainCtx = grainCanvas.getContext("2d");
  if (grainCtx) drawGrain(grainCtx, GRAIN_SIZE);

  const layers: Layer[] = [0, 1].map(() => {
    const c = document.createElement("canvas");
    const x = c.getContext("2d")!;
    return { canvas: c, ctx: x, grain: grainCtx ? x.createPattern(grainCanvas, "repeat") : null };
  });

  let W = 0;
  let H = 0;
  let clock = 0;
  let last = 0;
  let raf = 0;
  let nextLayer = 0;
  let dirty = true;
  // The static (server-rendered) stroke is skill 0, already drawn: hold it, then move on.
  let cur: Slot = {
    index: 0,
    start: animate ? -DRAW : 0,
    layer: null,
    label: null,
    stroke: null,
    angle: 0,
    labelFrom: 0,
    drawn: 1,
  };
  let prev: Slot | null = null;
  let fadeStart = 0;

  function prepare(slot: Slot) {
    const skill = SKILLS[slot.index];
    const stroke = prepareStroke(slot.index, layoutStroke(slot.index, W, H, skill.name.length), skill.color);
    slot.stroke = stroke;
    slot.drawn = -1;
    const label = slot.label;
    if (!label) return;
    const { x, y, angle } = pointAt(stroke.layout.curve, LABEL_AT);
    slot.angle = clamp((angle * 180) / Math.PI, -LABEL_MAX_TILT, LABEL_MAX_TILT);
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    const ink = readableTextColor(skill.color);
    label.style.color = ink;
    // Light text on deep paint gets a soft halo of the paint's own colour, to hold contrast over streaks.
    const halo = shade(skill.color, -0.12);
    label.style.textShadow = ink === LIGHT_INK ? `0 0 0.3em ${halo}, 0 0 0.12em ${halo}` : "none";
    const w = stroke.layout.width;
    const preferred = Math.round(clamp(w * LABEL_FONT, LABEL_FONT_RANGE[0], LABEL_FONT_RANGE[1]));
    const { curve } = stroke.layout;
    const rad = (slot.angle * Math.PI) / 180;
    const dir = { x: Math.cos(rad), y: Math.sin(rad) };
    // Every point along the label's long axis must sit well inside the painted band at that point.
    const onPaint = (lw: number, lh: number) => {
      const half = lw / 2 / curve.length;
      if (LABEL_AT - half < LABEL_SPAN[0] || LABEL_AT + half > LABEL_SPAN[1]) return false;
      for (let u = -lw / 2; u <= lw / 2; u += lw / 8) {
        const c = pointAt(curve, LABEL_AT + u / curve.length);
        const off = Math.abs((x + u * dir.x - c.x) * -Math.sin(c.angle) + (y + u * dir.y - c.y) * Math.cos(c.angle));
        if (off + lh / 2 > (w * widthAt(LABEL_AT + u / curve.length) * LABEL_BAND) / 2) return false;
      }
      return true;
    };
    fitLabel(label, skill.name, stroke.layout.span * LABEL_MAX_WIDTH, w * LABEL_MAX_HEIGHT, preferred, onPaint);
    const half = label.offsetWidth / 2 / stroke.layout.curve.length;
    slot.labelFrom = Math.min(LABEL_LATEST, LABEL_AT + half + 0.02);
  }

  function paintFull(slot: Slot) {
    if (!slot.layer || !slot.stroke) return;
    paintStroke(slot.layer.ctx, slot.stroke, 1, W, H, slot.layer.grain);
    slot.drawn = 1;
  }

  function showLabel(slot: Slot, alpha: number, rise: number) {
    if (!slot.label) return;
    slot.label.style.opacity = `${alpha}`;
    slot.label.style.transform = `translate(-50%, -50%) rotate(${slot.angle}deg) translateY(${rise}px)`;
  }

  function dropPrev() {
    if (!prev) return;
    if (prev.label) prev.label.style.opacity = "0";
    else staticEl.style.visibility = "hidden";
    prev = null;
    dirty = true;
  }

  /** Next stroke, prepared during the current one's hold so the switch-over frame stays cheap. */
  let upcoming: Slot | null = null;

  function makeNext(): Slot {
    const i = nextLayer;
    const slot: Slot = {
      index: (cur.index + 1) % SKILLS.length,
      start: 0,
      layer: layers[i],
      label: labels[i],
      stroke: null,
      angle: 0,
      labelFrom: 0,
      drawn: -1,
    };
    prepare(slot);
    return slot;
  }

  function advance() {
    dropPrev();
    const next = upcoming ?? makeNext();
    upcoming = null;
    nextLayer ^= 1;
    prev = cur;
    fadeStart = clock;
    cur = next;
    cur.start = clock;
    if (!animate) paintFull(cur);
    showLabel(cur, 0, LABEL_RISE);
  }

  function step() {
    if (!W || !H) return;
    if (clock - cur.start >= (animate ? DRAW + HOLD : CALM_HOLD)) advance();
    const e = clock - cur.start;
    // By now the previous stroke has faded, so its layer and label are free to prepare the next one.
    if (!upcoming && !prev && e > (animate ? DRAW : FADE) + 50) upcoming = makeNext();

    let curAlpha = 1;
    let labelIn = 1;
    if (animate) {
      const p = drawEase(e / DRAW);
      if (cur.layer && cur.stroke && p !== cur.drawn) {
        paintStroke(cur.layer.ctx, cur.stroke, p, W, H, cur.layer.grain);
        cur.drawn = p;
        dirty = true;
      }
      labelIn = smoothstep(cur.labelFrom, cur.labelFrom + LABEL_IN_SPAN, p);
    } else if (cur.layer) {
      curAlpha = clamp(e / FADE, 0, 1);
      labelIn = curAlpha;
      if (curAlpha < 1) dirty = true;
    }

    let fade = 0;
    if (prev) {
      const f = (clock - fadeStart) / FADE;
      // Animated: ease-in, so the old stroke lingers while the new one lands. Reduced: plain cross-fade.
      fade = f >= 1 ? 0 : animate ? 1 - f * f : 1 - f;
      dirty = true;
    }

    if (dirty) {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (prev?.layer && fade > 0) {
        ctx.globalAlpha = fade;
        ctx.drawImage(prev.layer.canvas, 0, 0);
      }
      if (cur.layer) {
        ctx.globalAlpha = curAlpha;
        ctx.drawImage(cur.layer.canvas, 0, 0);
      }
      ctx.globalAlpha = 1;
      dirty = false;
    }

    showLabel(cur, labelIn, (1 - labelIn) * LABEL_RISE);
    if (prev) {
      if (prev.label) showLabel(prev, fade, 0);
      else staticEl.style.opacity = `${fade}`;
      if (fade <= 0) dropPrev();
    }
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
    return isActive() && !document.hidden && W > 0 && H > 0;
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
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    for (const c of [canvas, ...layers.map((l) => l.canvas)]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    for (const l of layers) l.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Rare: start the current stroke again at the new size; drop any fading one.
    dropPrev();
    upcoming = null;
    if (cur.layer) {
      prepare(cur);
      if (animate) cur.start = clock;
      else paintFull(cur);
    }
    dirty = true;
    wake();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();
  document.addEventListener("visibilitychange", wake);

  return {
    wake,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      staticEl.style.opacity = "";
      staticEl.style.visibility = "";
      for (const l of labels) l.style.opacity = "0";
    },
  };
}

// ---- Component -------------------------------------------------------------------------------

/**
 * Broad paint strokes drawn one at a time, each carrying a skill. `animate` is null until the
 * motion preference is known on the client; until then (and without JavaScript) the static stroke shows.
 */
export function PaintStrokes({ active, animate }: { active: boolean; animate: boolean | null }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);
  const labelA = useRef<HTMLSpanElement>(null);
  const labelB = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(active);
  const engineRef = useRef<ReturnType<typeof createEngine>>(null);

  useEffect(() => {
    activeRef.current = active;
    engineRef.current?.wake();
  }, [active]);

  useEffect(() => {
    if (animate === null) return;
    const engine = createEngine({
      wrap: wrapRef.current!,
      canvas: canvasRef.current!,
      staticEl: staticRef.current!,
      labels: [labelA.current!, labelB.current!],
      animate,
      isActive: () => activeRef.current,
    });
    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [animate]);

  const labelClass =
    "pointer-events-none absolute left-0 top-0 w-max select-none text-center font-display font-semibold leading-[1.05] tracking-[-0.01em] opacity-0 [text-wrap:balance]";

  return (
    <div ref={wrapRef} className="@container relative h-full w-full">
      <div ref={staticRef} className="absolute inset-0">
        <StaticStroke />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span ref={labelA} className={labelClass} />
      <span ref={labelB} className={labelClass} />
    </div>
  );
}
