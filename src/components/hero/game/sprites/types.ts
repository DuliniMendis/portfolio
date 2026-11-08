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
