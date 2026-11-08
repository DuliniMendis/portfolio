import { fitLogo, LOGOS } from "./logos";
import { PALETTE } from "./palette";
import { drawScene, type IrisState } from "./scene";
import { raster } from "./sprites/raster";
import { BEAT_MS, START_T, STARTS, TOTAL, wrap } from "./timeline";
import { panelLayout, World, type LogoId, type Painter, type View } from "./world";

/**
 * The canvas engine: sizing, the clock, the rAF loop, the two layers (pixel buffer blitted with smoothing off,
 * then crisp logos and the iris at device resolution), the visibility pause and teardown. No React here.
 */

// ---- Knobs -----------------------------------------------------------------------------------

/** Longest frame step we accept, so a stalled tab does not jump the story, ms. */
export const MAX_STEP = 64;
const MAX_DPR = 3;
/** Reduced motion: one still per beat, held this long, cross-fading over the last FADE ms. */
export const POSTCARD_MS = 4000;
export const POSTCARD_FADE_MS = 600;
/** Where in each beat its postcard is taken (chosen so each still tells its beat). */
export const POSTCARD_P = [0.5, 0.6, 0.5, 0.3, 0.8, 0.45, 0.8, 0.6, 0.45, 0.85, 0.22];
/** The postcard shown first: the same moment as the server-rendered frame. */
const FIRST_POSTCARD = POSTCARD_P.length - 1;
/** How many recent frame timings `stats()` keeps. */
const STATS = 600;

export type Engine = {
  wake(): void;
  destroy(): void;
  /** For tooling and a future tap-to-skip: jump to a time, hold or resume the clock, read timings and the pixel buffer. */
  seek(t: number): void;
  setHeld(held: boolean): void;
  time(): number;
  stats(): number[];
  buffer(): HTMLCanvasElement;
};

export function createEngine(opts: {
  wrap: HTMLElement;
  canvas: HTMLCanvasElement;
  staticEl?: HTMLElement | SVGElement | null;
  animate: boolean;
  isActive: () => boolean;
}): Engine | null {
  const { wrap: box, canvas, staticEl, animate, isActive } = opts;
  const context = canvas.getContext("2d");
  const buf = document.createElement("canvas");
  const bctx = buf.getContext("2d");
  if (!context || !bctx) return null;
  const ctx: CanvasRenderingContext2D = context;
  const b: CanvasRenderingContext2D = bctx;

  // Logos load in the background; frames before then simply leave the signs blank.
  const images = new Map<LogoId, HTMLImageElement>();
  let loaded = 0;
  // Set on teardown: late callbacks (a logo finishing loading) must not restart a destroyed engine.
  let destroyed = false;
  for (const id of Object.keys(LOGOS) as LogoId[]) {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      loaded++;
      signature = "";
      wake();
    };
    img.src = LOGOS[id].src;
    images.set(id, img);
  }

  const logos: { id: LogoId; x: number; y: number; w: number; h: number }[] = [];
  const painter: Painter = {
    rect(c, x, y, w, h) {
      if (w <= 0 || h <= 0) return;
      b.fillStyle = c;
      b.fillRect(x, y, w, h);
    },
    sprite(s, x, y, map, variant) {
      b.drawImage(raster(s, map, variant), x, y);
    },
    logo(id, x, y, w, h) {
      logos.push({ id, x, y, w, h });
    },
  };

  let W = 0;
  let H = 0;
  let dpr = 1;
  let scale = 2;
  let view: View = { ox: 0, gy: 0, left: 0, right: 0, top: 0 };
  /** Where the buffer's top-left lands on the canvas, device px. */
  let blitX = 0;
  let blitY = 0;
  let lw = 0;
  let lh = 0;

  let clock = animate ? START_T : FIRST_POSTCARD * POSTCARD_MS;
  let last = 0;
  let raf = 0;
  let held = false;
  let drewOnce = false;
  let signature = "";
  const timings: number[] = [];

  function resize() {
    if (destroyed) return;
    const w = box.clientWidth;
    const h = box.clientHeight;
    if (!w || !h) return;
    const d = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    if (w === W && h === H && d === dpr) return;
    W = w;
    H = h;
    dpr = d;
    const layout = panelLayout(W, H);
    scale = layout.scale;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    // The buffer is a little larger than the panel so the camera focus can sit exactly at its centre.
    lw = Math.ceil(W / scale) + 2;
    lh = Math.ceil(H / scale) + 1;
    buf.width = lw;
    buf.height = lh;
    const ox = Math.floor(lw / 2);
    view = { ox, gy: lh - layout.depth, left: 0, right: lw, top: 0 };
    blitX = Math.round((W / 2 - ox * scale) * dpr);
    blitY = Math.round((H - lh * scale) * dpr);
    signature = "";
    draw();
    wake();
  }

  /** Render the story at time t into the buffer and composite it onto the canvas at the given opacity. */
  function render(t: number, calm: boolean, alpha: number) {
    logos.length = 0;
    const g = new World(painter, t, view, calm);
    const iris = drawScene(g);
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    const k = scale * dpr;
    ctx.drawImage(buf, 0, 0, lw, lh, blitX, blitY, lw * k, lh * k);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    for (const l of logos) {
      const img = images.get(l.id);
      if (!img?.complete || !img.naturalWidth) continue;
      const f = fitLogo(l.id, l.x, l.y, l.w, l.h);
      ctx.drawImage(img, blitX + f.x * k, blitY + f.y * k, f.w * k, f.h * k);
    }
    if (iris) drawIris(iris, k);
    ctx.globalAlpha = 1;
  }

  function drawIris(iris: IrisState, k: number) {
    const cx = blitX + (iris.x + 0.5) * k;
    const cy = blitY + iris.y * k;
    const far = Math.hypot(Math.max(cx, canvas.width - cx), Math.max(cy, canvas.height - cy));
    const r = (1 - iris.closed) * far;
    ctx.fillStyle = PALETTE.k;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    if (r > 0.5) ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
    ctx.fill("evenodd");
  }

  function draw() {
    if (!W || !H) return;
    const start = performance.now();
    if (animate) {
      render(wrap(clock), false, 1);
    } else {
      const n = POSTCARD_P.length;
      const k = Math.floor(clock / POSTCARD_MS) % n;
      const into = clock % POSTCARD_MS;
      const fade = Math.max(0, (into - (POSTCARD_MS - POSTCARD_FADE_MS)) / POSTCARD_FADE_MS);
      const sig = `${k}:${fade.toFixed(3)}:${loaded}`;
      if (sig === signature) return;
      signature = sig;
      const at = (i: number) => STARTS[i] + POSTCARD_P[i] * BEAT_MS[i];
      render(at(k), true, 1);
      if (fade > 0) render(at((k + 1) % n), true, fade);
    }
    timings.push(performance.now() - start);
    if (timings.length > STATS) timings.shift();
    if (!drewOnce) {
      drewOnce = true;
      if (staticEl) staticEl.style.visibility = "hidden";
    }
  }

  function frame(now: number) {
    raf = 0;
    if (!shouldRun()) return;
    if (!held) clock += Math.min(MAX_STEP, now - last);
    last = now;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function shouldRun() {
    return !held && isActive() && !document.hidden && W > 0 && H > 0;
  }

  function wake() {
    if (raf || destroyed) return;
    if (!shouldRun()) {
      draw();
      return;
    }
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(box);
  // Observers do not fire in background tabs, so size once now.
  resize();
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("resize", resize);

  return {
    wake,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (staticEl) staticEl.style.visibility = "";
    },
    seek(t: number) {
      clock = animate ? ((t % TOTAL) + TOTAL) % TOTAL : t;
      signature = "";
      draw();
    },
    setHeld(h: boolean) {
      held = h;
      if (!h) wake();
    },
    time: () => (animate ? wrap(clock) : clock),
    stats: () => timings.slice(),
    buffer: () => buf,
  };
}
