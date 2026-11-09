import { fitLogo, LOGOS } from "./logos";
import { drawScene, type IrisState } from "./scene";
import { colorOf } from "./sprites/raster";
import { START_T } from "./timeline";
import { World, type Painter, type View } from "./world";

/**
 * Draw one moment of the story as SVG data instead of pixels: one path per colour (each pixel run a tiny
 * rectangle) plus the logos as images. Pure: no DOM, no clock, so it can be prerendered.
 * Coordinates are game pixels with the camera focus at x = 0 and the ground line at y = 0.
 */
export type SvgFrame = {
  paths: [color: string, d: string][];
  images: { href: string; x: number; y: number; w: number; h: number }[];
  /** The iris transition, when it is partly closed (only at the loop's start and end). */
  iris: IrisState | null;
};

/** Wide and tall enough for any panel the hero uses (up to 760 × 600 CSS px at 2×; the outer SVG clips the rest). */
const VIEW: View = { ox: 0, gy: 0, left: -190, right: 190, top: -300 };

const n = (v: number) => Math.round(v * 100) / 100;

/** `view` crops the frame (the share GIF passes a smaller one, so the level cards drop in at its top edge). */
export function svgFrame(t = START_T, view: View = VIEW): SvgFrame {
  // Paths keep the painter's order: a rectangle joins its colour's latest path only if nothing drawn since
  // overlaps it; otherwise it starts a new path on top.
  // Each path walks its rectangles with relative moves (`m`), so most numbers are short.
  type Chunk = { c: string; d: string[]; rects: number[]; px: number; py: number };
  const chunks: Chunk[] = [];
  const latest = new Map<string, number>();
  const add = (c: string, x: number, y: number, w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    let idx = latest.get(c);
    if (idx !== undefined) {
      outer: for (let k = idx + 1; k < chunks.length; k++) {
        const r = chunks[k].rects;
        for (let i = 0; i < r.length; i += 4) {
          if (x < r[i] + r[i + 2] && r[i] < x + w && y < r[i + 1] + r[i + 3] && r[i + 1] < y + h) {
            idx = undefined;
            break outer;
          }
        }
      }
    }
    if (idx === undefined) {
      chunks.push({ c, d: [], rects: [], px: 0, py: 0 });
      idx = chunks.length - 1;
      latest.set(c, idx);
    }
    const k = chunks[idx];
    // After `h-w` the pen sits at the rectangle's bottom-left; fill closes each subpath on its own.
    k.d.push(`${k.d.length ? "m" : "M"}${x - k.px} ${y - k.py}h${w}v${h}h${-w}`);
    k.px = x;
    k.py = y + h;
    k.rects.push(x, y, w, h);
  };
  const images: SvgFrame["images"] = [];
  const painter: Painter = {
    rect: add,
    sprite(s, x, y, map) {
      // Merge each row into runs of one colour; then stack identical runs from consecutive rows.
      const open = new Map<string, { y: number; h: number; c: string }>();
      const flush = (key: string) => {
        const r = open.get(key)!;
        const [x0, w] = key.split(":").map(Number);
        add(r.c, x + x0, y + r.y, w, r.h);
        open.delete(key);
      };
      for (let row = 0; row < s.h; row++) {
        const seen = new Set<string>();
        const line = s.rows[row];
        let i = 0;
        while (i < s.w) {
          const c = colorOf(line[i], map);
          let j = i + 1;
          while (j < s.w && colorOf(line[j], map) === c) j++;
          if (c) {
            const key = `${i}:${j - i}:${c}`;
            const run = open.get(key);
            if (run && run.y + run.h === row) run.h++;
            else {
              if (run) flush(key);
              open.set(key, { y: row, h: 1, c });
            }
            seen.add(key);
          }
          i = j;
        }
        for (const key of [...open.keys()]) if (!seen.has(key)) flush(key);
      }
      for (const key of [...open.keys()]) flush(key);
    },
    logo(id, x, y, w, h) {
      const f = fitLogo(id, x, y, w, h);
      images.push({ href: LOGOS[id].src, x: n(f.x), y: n(f.y), w: n(f.w), h: n(f.h) });
    },
  };
  const iris = drawScene(new World(painter, t, view, false));
  return { paths: chunks.map((k) => [k.c, k.d.join("")]), images, iris };
}
