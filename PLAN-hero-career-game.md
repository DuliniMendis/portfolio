# Hero visual v3: the career game — implementation plan

Status: PLAN ONLY (written 2026-11-08). Nothing here is built. Written so a fresh session can execute it.

Companion docs: `PLAN.md` (site build plan and phase notes), `PLAN-hero-paint-strokes.md` (the hero being replaced;
its engine, lab-route workflow and acceptance method are the template for this one), `SUMMARY.md` (state of the site),
`CONTENT.md` (dates and facts; do not invent any), `AGENTS.md` (this Next.js version has breaking changes; read
`node_modules/next/dist/docs/` before writing code).

---

## 1. What we are building

Replace the painted skill strokes in the hero's right-hand panel with an **auto-playing 2D side-scrolling game**
that tells Dulini's career story. Nobody plays it: it is a looping cutscene drawn in a pixel-art game style, with a
small character who looks like Dulini (brown skin, black hair tied in a bun) travelling left to right through
Sri Lanka, the University of Melbourne, Seer Medical, Leonardo.Ai and Canva, and ending on her landing on her feet
and waving. Then it loops.

The hero copy, CTAs, the left column and every other section stay as they are. The panel keeps its box
(`h-[22rem]` on phones, `md:h-[600px]` on wider screens, inside the existing `ScrollDrift`), so there is no layout
change and the parallax keeps working.

### Out of scope
- Player input (jump on tap, skip to next scene). Noted as a possible later addition in section 10.
- Sound. A portfolio hero must stay silent.
- Replacing the favicon and share image (`qualities.ts` still drives them; follow-up in section 10).
- Any change to project pages or other sections.

---

## 2. The story, beat by beat

Everything below comes from the owner's brief. Dates are from `CONTENT.md`. The loop runs about 45 s; each beat
lists its target length so the whole thing can be tuned from one table of constants.

| # | Beat | What happens on screen | Length |
|---|------|------------------------|--------|
| 0 | **Sri Lanka** | Level card "SRI LANKA". Beach, two palm trees, a tiny airport sign. Dulini stands idle (2-frame breathe), then walks to a small plane. | 2.5 s |
| 1 | **Flight** | Plane takes off and flies right. Camera follows the plane; ocean, waves and clouds scroll in parallax. Dulini visible in a window. Near the end, the Australian coastline and a city skyline rise on the horizon. | 4 s |
| 2 | **Jump to Melbourne** | Plane passes over the University of Melbourne (sandstone building with a clock tower, sign "UNIVERSITY OF MELBOURNE"). She jumps out of the plane, arcs down, lands with a dust puff. Level card "MELBOURNE · 2014". | 2.5 s |
| 3 | **PhD** | Inside the university (cutaway wall): she sits at a desk and types on a laptop (speech bubble with `{ }` and a brain-wave squiggle, for computational neuroscience). Then she puts on a lab coat and stands at a bench; beakers bubble, a little spark pops. | 5 s |
| 4 | **Seer Medical grows** | She walks right to a one-storey office with the Seer Medical logo on it and goes in. The building grows floor by floor (extrude up with a bounce), windows light, little people pop into them one after another until there are a lot. Level card "SEER MEDICAL · 2017–2024". | 6 s |
| 5 | **Seer crumbles, jump** | The building shakes, cracks appear, floors drop one by one into dust clouds. Everyone inside hops out safely (keep it cartoonish; these are real colleagues). She leaps from the top across the gap and lands at the Leonardo.Ai office door. | 3.5 s |
| 6 | **Leonardo.Ai** | Office with four or five colleagues at desks. She taps her laptop and small picture frames materialise in the air above her one by one with sparkles (a cat, a landscape, a rocket, a face), growing from a dot. Colleagues raise arms. Level card "LEONARDO.AI · 2024–2026". | 5 s |
| 7 | **The big hand** | A giant pixel hand slides down from the top edge and sweeps everyone (Dulini and the colleagues, tumbling) to the right into a tall Canva building with the Canva logo. Doors shut behind them. | 3.5 s |
| 8 | **Canva** | Cutaway of the tall building. Many people on several floors. Lines draw from Dulini to a dozen people (a network of connections), with small heart/chat bubbles. Then a terminal window sprite appears beside her with text streaming out (the LLM work). The wind starts: leaves, sticky notes and paper fly across, clouds race, people lean into it, the window frames rattle. Level card "CANVA · 2026". | 7 s |
| 9 | **The fall** | A gust blows her out of a window. She tumbles (rotating fall frame) down the side of the building, then flips upright and lands on her feet with a squash-and-stretch and a dust puff. She is smiling. | 3 s |
| 10 | **Wave** | She waves (2-frame wave), a "✦" sparkle twinkles. Iris-out to the ink colour (classic game transition), then the world resets to beat 0 and the iris opens. | 3 s |

Total ≈ 45 s. The iris-out hides the camera jump back to the start, so the loop is seamless.

**Level cards** are short uppercase strings in a pixel font that slide in at the top of the panel for about 1.6 s
at the start of a beat. They are the only text in the panel; the three company beats carry the real logo on the
building, so their cards can be years only ("2017–2024") if the owner prefers (see section 10).

---

## 3. Art direction

**Style:** chunky pixel art, like a 16-bit side-scroller, with a flat sky and simple parallax. Pixel art is chosen
over a vector cartoon because (a) every sprite can be authored as text in the repo (section 5), so no drawing tool
or asset pipeline is needed and changes are diffable; (b) it reads unmistakably as "a game"; (c) it is cheap to
render; (d) a 24 × 32 px character with a bun and brown skin is recognisable at any size.

**Pixel size:** fixed in CSS pixels rather than a fixed logical resolution, so the world fills whatever box it
gets: 2 CSS px per game pixel below 768 px wide, 3 CSS px at 768 px and up. The logical viewport is derived from
the box (about 170 × 176 game pixels on a phone, about 187 × 200 on desktop). The camera shows more or less sky
and ground; everything that matters sits in a 160 × 120 safe area around the character. Backing store is CSS ×
devicePixelRatio, so each game pixel is a whole number of device pixels and stays crisp.

**Palette:** about 24 colours, all from the site tokens in `globals.css` plus the few that pixel art needs.
Sky `--sky #d6eefc` → background `#f7f9fa` gradient (banded, not smooth); ground and buildings in warm greys and
sandstone derived from `--muted` and `--peach`; accents `--accent #ff9a3d` and the blues for clothes, signs and
UI; ink `#0e1717` for outlines and the iris. Dulini's skin tones are sampled from `public/images/dulini.jpeg`
(same approach as the site palette) with a darker shade for outline/shadow; hair is near-black with a blue-grey
highlight. **Exception:** the three company logos keep their own brand colours (section 6). Nothing else may use
colours outside the palette; no orange-to-blue blending (it goes grey, see `SUMMARY.md` gotchas).

**Dulini sprite:** 24 wide × 32 tall. Side view facing right. Bun drawn as a 4 × 4 block at the back-top of the
head so it reads in silhouette. Default outfit: top in `--accent`, trousers in `--blue-text`. Variants:
lab coat (white overlay over the default). Frames:

| State | Frames | Used in |
|---|---|---|
| idle | 2 (breathe) | 0, 6, 8 |
| walk | 4 | 0, 4 |
| jump / arc | 2 (up, down) | 2, 5 |
| land (squash) | 1 | 2, 5, 9 |
| sit + type | 2 (hands up/down) | 3, 6 |
| lab coat stand | 2 (pour, look) | 3 |
| tumble | 1, rotated in 90° steps | 7, 9 |
| wave | 2 | 10 |
| smile face | overlay, 1 | 9, 10 |

About 16 frames. Mirroring is not needed: she always moves right.

**Other people:** one generic 20 × 28 base sprite (idle 2 frames, cheer 1, tumble 1) with palette swaps generated
in code: 4 skin tones, 5 hair colours, 3 hairstyles (short, long, bun), 6 shirt colours from the palette. A seeded
generator gives each office a varied, repeatable crowd.

**Landmarks** (each one sprite or a small assembly): beach + palms + airport sign; plane (2 frames, propeller);
clouds (3 sizes); Australian coastline silhouette; Melbourne university building (clock tower, arch, steps) about
80 × 70; office interior tiles (desk, chair, laptop, bench, beaker, window, door, floor divider); Seer office
module (one floor, 48 wide × 20 tall, repeated as it grows, plus a roof cap); Leonardo office (single-storey,
wider, with a door); Canva tower (one floor module repeated to about 9 floors, about 72 wide); the big hand
(about 64 × 48, outline + skin tone); picture frames (4 tiny 12 × 10 images); terminal window; particles (dust,
sparkle, leaf, paper, debris blocks).

**Pixel font:** a 5 × 7 uppercase bitmap font defined in code (A–Z, 0–9, `.`, `-`, `·`, `&`, space). Used for the
level cards and signs. No web font download.

---

## 4. Discovery: rendering approach

Checked against what is already in the project. No new dependency is justified.

| Option | Verdict | Why |
|---|---|---|
| **Hand-rolled Canvas 2D, low-res pixel buffer scaled up with smoothing off** | **Recommended** | Zero dependencies. Same shape as the current hero engine (`PaintStrokes.tsx`), so the visibility pause, resize handling, reduced-motion switch and server fallback patterns carry over. A 190 × 200 buffer with a few dozen sprites is well under 1 ms a frame. |
| Phaser 3 / PixiJS | Not recommended | Full game engines (hundreds of kB) for a non-interactive cutscene. Would undo the bundle win from v2 (hero is ~12 kB gz now). |
| DOM/SVG sprites animated with `framer-motion` | Not recommended | Dozens of moving elements, parallax and particles in the DOM is heavier than one canvas and much harder to keep in sync on one timeline. Framer Motion stays for `ScrollDrift`. |
| CSS sprite-sheet animations | Not recommended | Fine for one looping character, poor for a 45 s choreographed scene with a camera. |
| PNG sprite sheets drawn in Aseprite | Possible later | Better art is possible, but it needs an artist and a tool, and the files cannot be reviewed as text. Start with code-authored sprites; a sheet can replace them later behind the same `Sprite` type. |

**Two canvas layers:**
1. **Pixel layer:** an offscreen canvas at logical size; everything pixel-art is drawn here with integer
   coordinates, then blitted to the visible canvas at the pixel scale with `imageSmoothingEnabled = false`.
2. **Crisp layer:** drawn directly on the visible canvas at device resolution after the blit: the three logos
   (vector or high-resolution raster, so they are never pixelated) and the iris mask. Logos are positioned in game
   coordinates and converted, so they ride the camera like everything else.

---

## 5. Code structure

All new code lives in `src/components/hero/game/`. Pure modules take no React or DOM globals except where they
receive a `CanvasRenderingContext2D`.

```
src/components/hero/game/
  palette.ts        named colours (from globals.css + sampled skin/hair), ONE place
  font.ts           5×7 bitmap font + drawText(ctx, text, x, y, color)
  sprites/
    types.ts        Sprite = { w, h, rows: string[] } using palette keys; frame sets
    dulini.ts       her frames, as string arrays (one char per pixel, '.' = transparent)
    people.ts       generic person base + seeded palette-swap generator
    landmarks.ts    beach, plane, clouds, university, office modules, tower, hand
    props.ts        desk, laptop, beaker, frames, terminal, leaf, paper, debris
    raster.ts       rasterise a Sprite to an offscreen canvas once (cache by sprite id + variant)
  world.ts          camera (x, ease), parallax layers (sky bands, far hills, ground), draw order
  particles.ts      small pooled particle system: dust, sparkle, leaf, paper, debris
  timeline.ts       Beat type { id, length, enter(world), update(t01, world), captions }; the clock
  beats/
    00-sri-lanka.ts … 10-wave.ts   one file per beat from section 2
  engine.ts         createEngine({ wrap, canvas, animate, isActive }) → start/stop/resize; rAF loop,
                    MAX_STEP clamp, pixel scale from width, two-layer draw, iris, loop reset
  story.ts          the sr-only text: ordered list of the career steps (for HeroVisual)
  CareerGame.tsx    "use client" component: canvas + static fallback, mounts the engine
  StaticFrame.tsx   server-rendered SVG of one frame (beat 10: her waving in front of the scene)
```

**Timeline model.** `engine.ts` keeps one clock `t` in ms from 0 to `TOTAL`. `timeline.ts` turns the beats
table into cumulative start times, so at any `t` exactly one beat is current with a local `t01` in 0..1. Beats
are pure functions of `t01` wherever possible (positions, which frame, camera target), with `enter()` only for
things that need a seed or a spawn (particles, the crowd). This makes the lab scrubber (section 7) trivial and
keeps the visibility pause correct: when the tab comes back, the clock resumes from where it stopped.

**Sprites as text.** A frame is an array of equal-length strings; each character is a palette key, `.` is
transparent. Example shape (not final art):

```ts
export const DULINI_IDLE_0: Sprite = { w: 24, h: 32, rows: [
  "........kkkk............",
  ".......kkkkkkKK.........",   // K = bun
  // ...
] };
```

`raster.ts` converts a frame to an `OffscreenCanvas`/`HTMLCanvasElement` once (cached), so a frame is one
`drawImage` call. Palette swaps for the crowd are done at rasterise time with a key → colour map.

**Static fallback.** `StaticFrame.tsx` renders beat 10 (waving) as inline SVG from the same sprite data: rows are
run-length merged into `<rect>`s, `shape-rendering="crispEdges"`, scaled with a `viewBox`, logos as `<image>`.
It sits under the canvas and is removed once the engine draws its first frame, exactly as `StaticStroke` does
now. Target under 12 kB of HTML.

**Integration.** `HeroVisual.tsx` swaps `PaintStrokes` for `CareerGame` and replaces the sr-only skills list
with the sr-only story list from `story.ts` (section 8). Then delete `PaintStrokes.tsx`, `StaticStroke.tsx`,
`brush.ts`, `contrast.ts` and `skills.ts` (the skills leave the hero; section 10, decision 1). `qualities.ts` stays
(favicon and share image). The colour-wash `div` in `Hero.tsx` can stay; check it does not fight the sky.

---

## 6. Logos

The repo has no logo files. The executor needs an SVG (preferred) or a 2× PNG for each:

| Company | Where to get it | Note |
|---|---|---|
| Seer Medical | seermedical.com (press/brand page or the site header) | Also check the logo's licence/brand page; keep colours and proportions as published. |
| Leonardo.Ai | leonardo.ai press kit / brand page | Same. |
| Canva | canva.com newsroom brand assets | Canva publishes guidelines; use the mark as given, no recolouring. |

Store them in `public/logos/<company>.svg` (or `.png`) and draw them on the crisp layer at a size that reads at
both pixel scales (about 40 CSS px wide on phones, 60 on desktop). Naming a former employer and showing its logo
in a personal portfolio is ordinary nominative use, but each brand's own guidelines still apply: no
modification, no implication of endorsement. If an official SVG is not available or the owner would rather not
use a logo, fall back to the company name in the pixel font on the building (section 10, decision 2).

---

## 7. Development workflow

1. **Lab route** `src/app/lab/game/page.tsx` (deleted before the final commit, like v2's): renders `CareerGame`
   at the real panel sizes (343 × 352 and 560 × 600) side by side, plus a **time scrubber** (range input over
   0..TOTAL, with beat markers) and a **sprite sheet view** that draws every frame of every sprite at 4× for
   checking the art. This is where the look is decided.
2. Node: `export PATH=$HOME/.local/node/bin:$PATH`. Dev server via `.claude/launch.json` (`portfolio-dev`, port
   3100). `pnpm lint && pnpm build` must pass (Cache Components is on: no `Date.now()` or other runtime data in
   server components during prerender; `StaticFrame` must be a pure function of its props).
3. Knobs: every beat length, pixel size breakpoint, camera easing, particle counts and the iris duration are
   named constants in `timeline.ts` / `engine.ts`.

---

## 8. Behaviour and accessibility

- **Pause when unseen:** reuse `HeroVisual`'s `IntersectionObserver` (`active` prop) and `document.hidden`;
  clamp frame steps to `MAX_STEP = 64 ms` so a stalled tab does not jump the story.
- **Resize:** recompute pixel scale and logical size; the camera recentres on the character. Size once
  synchronously on start (observers do not fire in background tabs, see `SUMMARY.md` gotchas).
- **Reduced motion / reduced data:** no scrolling camera, no particles, no wind. Instead eleven still
  "postcards" (one per beat, drawn with the beat's `update(0.5)`) cross-fade every 4 s. Keep the level cards.
- **No JavaScript:** the SVG `StaticFrame` shows her waving in front of the Canva tower.
- **Screen readers:** the canvas is `aria-hidden`. Beside it, an `sr-only` ordered list tells the story in words
  ("Grew up and started work in Sri Lanka", "Moved to Melbourne in 2014 for a PhD in computational neuroscience
  at the University of Melbourne", "Founding engineer at Seer Medical, 2017 to 2024, as it grew", "Frontend tech
  lead at Leonardo.Ai, 2024 to 2026", "Engineering manager at Canva, 2026"). Facts from `CONTENT.md` only.
- **Largest Contentful Paint:** unchanged; the headline is the LCP and the static SVG paints with the HTML.
- **Hero copy untouched.**

---

## 9. Acceptance checks (run before the final commit)

Visual, in the browser pane at 375, 768, 1280 and 1920 px wide, with the scrubber and with screenshots:
- [ ] Every beat in section 2 is recognisable in a single screenshot of its midpoint, at both pixel scales.
- [ ] Dulini is recognisable: brown skin, black bun, consistent across all frames; the lab coat variant is clearly a coat.
- [ ] The loop is seamless: the iris closes on the wave and opens on Sri Lanka with no visible camera jump.
- [ ] Total loop length is 42 to 48 s; no beat feels rushed when watched at real speed in a visible browser.
- [ ] Logos are crisp (not pixelated) at every width and device pixel ratio, and sit on their buildings at both camera positions.
- [ ] No colour outside the palette except inside the logos (spot-check the pixel buffer with a colour count in the lab route).
- [ ] Level cards fit the panel at 375 px (longest: "UNIVERSITY OF MELBOURNE" in the 5 × 7 font at 2 CSS px/pixel = 276 px; confirm, or shorten to "UNI OF MELBOURNE").
- [ ] Reduced motion: postcards cross-fade, nothing scrolls, no particles (force the media query as v2 did).
- [ ] The static SVG frame occupies the same box as the canvas; no layout shift when the engine starts.
- [ ] The parallax wrapper (`ScrollDrift`) still moves the panel; the loop pauses when the hero is scrolled off screen and resumes from the same point.
- [ ] Nothing reads as unkind toward Seer Medical or Canva: the crumble and the fall are cartoon beats; everyone gets out.

Performance:
- [ ] Frame work under 1 ms mean, 3 ms p99 at 1280 px (time `update + draw` in the lab route at fixed 60 fps steps, as v2 did).
- [ ] Hero client JS at most 30 kB gz after removing the brush code (`pnpm build` output). Logos are separate static files.
- [ ] No console errors or hydration warnings.

Code:
- [ ] `engine.ts`, `timeline.ts`, `world.ts`, `particles.ts`, `sprites/*` have no React imports.
- [ ] All timing/size knobs are named constants.
- [ ] Lab route removed; sitemap unchanged.
- [ ] `PLAN.md`, `SUMMARY.md` updated (hero description, bundle size, gotchas); this file's status set to BUILT with deviations noted.

---

## 10. Decisions for the owner (ask one at a time)

1. **Skills as pickups?** DECIDED 2026-11-08: no. Story only. The 22 skills leave the hero; they remain in
   the CV and the rest of the site. Delete `skills.ts` with the brush code (section 5).
2. **Logos or names?** Real logos on the buildings (section 6) or the company name in the pixel font. Logos as
   asked; names are the fallback.
3. **Years on the level cards?** Cards with years ("SEER MEDICAL · 2017–2024") or names only. Recommendation:
   years, since the hero currently gives no sense of time.
4. **Sri Lanka detail:** beach and palms is the generic choice; a Colombo landmark (Lotus Tower) or the Virtusa
   office (her first job, 2011–2013) would be more specific. Recommendation: beach and palms plus the airport
   sign; keep it light.
5. **Mobile length:** 45 s is long for a phone where the hero scrolls away quickly; the loop could run faster
   (0.8×) below 768 px. Recommendation: same speed everywhere; the pause-when-unseen already saves work.

Follow-ups after this ships: redesign favicon and share image around the character (`qualities.ts`); a tap to
skip to the next beat; record a real-browser Performance trace.

---

## 11. Execution order

1. Read `AGENTS.md`; skim `node_modules/next/dist/docs/` for client components in this Next version. Read
   `PaintStrokes.tsx` for the engine lifecycle to copy (sizing, visibility, rAF, teardown).
2. **Spike (decides the look):** `palette.ts`, `sprites/types.ts`, `raster.ts`, Dulini's idle and walk frames,
   one ground tile and the sky. Render her walking at 2 and 3 CSS px per pixel in the lab route. Iterate on the
   sprite until a 1280 px screenshot reads as "Dulini, in a game". Do not move on until it does.
3. `font.ts` and the level card; `world.ts` camera and parallax; `timeline.ts` and the scrubber.
4. Beats 0–3 (Sri Lanka, flight, jump, PhD) with their landmarks and props. Watch at real speed.
5. Beats 4–5 (Seer grows and crumbles): the floor module, the crowd generator, `particles.ts` debris and dust.
6. Beats 6–8 (Leonardo, the hand, Canva): picture frames, the hand, connection lines, terminal, wind particles.
7. Beats 9–10 and the iris; loop reset; confirm seamlessness with the scrubber at the loop boundary.
8. Logos on the crisp layer (fetch assets per section 6). Reduced-motion postcards. `StaticFrame.tsx`.
9. Wire `CareerGame` into `HeroVisual.tsx`; replace the sr-only list; delete the brush files;
   `pnpm lint && pnpm build`.
10. Run section 9. Update `PLAN.md` and `SUMMARY.md`. Remove the lab route. Commit.
