// Renders the hero's career game to an animated GIF (public/career-game.gif), for posts and places that play GIFs.
// Run: node scripts/make-game-gif.mjs [scale] [fps]
// Each frame is drawn by the same code as the hero's static frame (svgFrame), rasterised with sharp, then joined.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = process.cwd();
// jiti and sharp already come with the project's dependencies (via Tailwind and Next.js), so resolve them through
// those packages instead of adding them: each step resolves the next package from the previous one's folder.
const through = (...chain) =>
  chain.reduce((from, pkg) => require.resolve(pkg, { paths: [from] }), root);
const { createJiti } = await import(through("@tailwindcss/turbopack", "@tailwindcss/node", "jiti"));
const sharp = (await import(through("next", "sharp"))).default;
const jiti = createJiti(import.meta.url);

const { svgFrame } = await jiti.import(join(root, "src/components/hero/game/svg.ts"));
const { TOTAL } = await jiti.import(join(root, "src/components/hero/game/timeline.ts"));
const { LOGOS } = await jiti.import(join(root, "src/components/hero/game/logos.ts"));
const { PALETTE } = await jiti.import(join(root, "src/components/hero/game/palette.ts"));

const SCALE = Number(process.argv[2] ?? 3); // output px per game pixel
const FPS = Number(process.argv[3] ?? 12.5);
// Square frame in game pixels: camera focus centred, ground line 30 px above the bottom (as in the hero).
const W = 200;
const H = 200;
const GROUND = 30;
const VIEW = { ox: 0, gy: 0, left: -W / 2, right: W / 2, top: -(H - GROUND) };

const logoData = new Map(
  await Promise.all(
    Object.values(LOGOS).map(async ({ src }) => [
      src,
      `data:image/svg+xml;base64,${await readFile(join(root, "public", src), "base64")}`,
    ]),
  ),
);

function frameSvg(t) {
  const { paths, images, iris } = svgFrame(t, VIEW);
  const x0 = VIEW.left;
  const y0 = VIEW.top;
  let body =
    paths.map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join("") +
    images
      .map((i) => `<image href="${logoData.get(i.href)}" x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}"/>`)
      .join("");
  if (iris) {
    // Same as the engine: ink everywhere except a circle that shrinks to the iris point.
    const cx = iris.x + 0.5;
    const cy = iris.y;
    const far = Math.hypot(Math.max(cx - x0, x0 + W - cx), Math.max(cy - y0, y0 + H - cy));
    const r = (1 - iris.closed) * far;
    const hole = r > 0.1 ? `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z` : "";
    body += `<path fill="${PALETTE.k}" fill-rule="evenodd" d="M${x0} ${y0}h${W}v${H}h${-W}Z${hole}"/>`;
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}" shape-rendering="crispEdges">` +
      `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="${PALETTE.k}"/>${body}</svg>`,
  );
}

const step = 1000 / FPS;
const count = Math.round(TOTAL / step);
const frames = [];
for (let f = 0; f < count; f++) {
  frames.push(await sharp(frameSvg(f * step)).png().toBuffer());
  if (f % 50 === 0) process.stdout.write(`frame ${f}/${count}\n`);
}
const out = join(root, "public/career-game.gif");
await sharp(frames, { join: { animated: true } })
  .gif({ delay: Array(count).fill(Math.round(step)), loop: 0, effort: 10, reuse: true, interFrameMaxError: 0 })
  .toFile(out);
console.log(`${out}: ${count} frames, ${W * SCALE}×${H * SCALE}`);
