/**
 * A sprite is pixel art written as text: equal-length strings, one character per pixel. Each character is a key in
 * `PALETTE` (or a digit slot filled by a colour map at raster time); `.` is transparent.
 * No React or DOM here: the same data feeds the canvas engine and the server-rendered SVG frame.
 */
export type Sprite = { id: string; w: number; h: number; rows: string[] };

/** Colours for the digit slots ("1" skin, "2" skin shade, "3" hair, "4" shirt, "5" shirt shade, ...). */
export type ColorMap = Partial<Record<string, string>>;

export type Part = readonly string[];

export function sprite(id: string, rows: readonly string[]): Sprite {
  const w = Math.max(...rows.map((r) => r.length));
  return { id, w, h: rows.length, rows: rows.map((r) => r.padEnd(w, ".")) };
}

/** Lay parts onto an empty w × h grid; later parts paint over earlier ones (transparent pixels do not). */
export function compose(id: string, w: number, h: number, parts: [Part, number, number][]): Sprite {
  const grid = Array.from({ length: h }, () => Array<string>(w).fill("."));
  for (const [rows, dx, dy] of parts) {
    rows.forEach((row, y) => {
      const gy = y + dy;
      if (gy < 0 || gy >= h) return;
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        const gx = x + dx;
        if (c === "." || c === " " || gx < 0 || gx >= w) continue;
        grid[gy][gx] = c;
      }
    });
  }
  return { id, w, h, rows: grid.map((r) => r.join("")) };
}

/** Rotate clockwise in 90° steps (used for the tumble). */
export function rotate(s: Sprite, quarterTurns: number, id = `${s.id}@r${quarterTurns}`): Sprite {
  let rows = s.rows;
  for (let i = 0; i < ((quarterTurns % 4) + 4) % 4; i++) {
    const h = rows.length;
    const w = rows[0].length;
    const next: string[] = [];
    for (let x = 0; x < w; x++) {
      let line = "";
      for (let y = h - 1; y >= 0; y--) line += rows[y][x];
      next.push(line);
    }
    rows = next;
  }
  return { id, w: rows[0].length, h: rows.length, rows };
}

/** Replace characters (e.g. swap the default top for the lab coat). */
export function recolor(s: Sprite, swaps: Record<string, string>, id: string): Sprite {
  return { ...s, id, rows: s.rows.map((r) => r.replace(/./g, (c) => swaps[c] ?? c)) };
}

/** Build a sprite by filling shapes on an empty grid, for parametric art (buildings, the plane, palms). */
export class Grid {
  readonly cells: string[][];
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = Array.from({ length: h }, () => Array<string>(w).fill("."));
  }
  px(c: string, x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y][x] = c;
  }
  rect(c: string, x: number, y: number, w: number, h: number) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(c, x + i, y + j);
  }
  /** Paint a part (rows of characters) at an offset; `.` stays transparent. */
  part(rows: readonly string[], dx: number, dy: number) {
    rows.forEach((row, y) => [...row].forEach((c, x) => c !== "." && this.px(c, x + dx, y + dy)));
  }
  get(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.cells[y][x] : ".";
  }
  /** Ink outline around everything drawn so far (4-neighbourhood, outside only). */
  outline(c = "k") {
    const add: [number, number][] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.cells[y][x] !== ".") continue;
        if ([this.get(x - 1, y), this.get(x + 1, y), this.get(x, y - 1), this.get(x, y + 1)].some((n) => n !== "." && n !== c))
          add.push([x, y]);
      }
    for (const [x, y] of add) this.cells[y][x] = c;
    return this;
  }
  sprite(id: string): Sprite {
    return { id, w: this.w, h: this.h, rows: this.cells.map((r) => r.join("")) };
  }
}

export function build(id: string, w: number, h: number, draw: (g: Grid) => void, outline = true): Sprite {
  const g = new Grid(w, h);
  draw(g);
  if (outline) g.outline();
  return g.sprite(id);
}

const derived = new Map<string, Sprite>();
function memo(id: string, make: () => Sprite) {
  let s = derived.get(id);
  if (!s) derived.set(id, (s = make()));
  return s;
}

/**
 * Ordered dither for dissolving facades: level 0 keeps everything, 1 keeps half the pixels (checkerboard),
 * 2 keeps a quarter, 3 keeps none.
 */
export function dither(s: Sprite, level: number): Sprite | null {
  if (level <= 0) return s;
  if (level >= 3) return null;
  return memo(`${s.id}@d${level}`, () => ({
    ...s,
    id: `${s.id}@d${level}`,
    rows: s.rows.map((r, y) =>
      r.replace(/./g, (c, x: number) => {
        const keep = level === 1 ? (x + y) % 2 === 0 : x % 2 === 0 && y % 2 === 0;
        return keep ? c : ".";
      }),
    ),
  }));
}

/** A rectangular piece of a sprite (people in windows). */
export function crop(s: Sprite, x: number, y: number, w: number, h: number): Sprite {
  return memo(`${s.id}@c${x},${y},${w},${h}`, () => ({
    id: `${s.id}@c${x},${y},${w},${h}`,
    w,
    h,
    rows: s.rows.slice(y, y + h).map((r) => r.slice(x, x + w).padEnd(w, ".")),
  }));
}

/** Lean into the wind: rows above `from` shift left by `dx`. */
export function lean(s: Sprite, dx: number, from: number): Sprite {
  return memo(`${s.id}@l${dx},${from}`, () => ({
    id: `${s.id}@l${dx},${from}`,
    w: s.w,
    h: s.h,
    rows: s.rows.map((r, y) => {
      const k = y < from ? Math.round((dx * (from - y)) / from) : 0;
      return k > 0 ? r.slice(k) + ".".repeat(k) : r;
    }),
  }));
}
