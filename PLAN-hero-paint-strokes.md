# Hero visual v2: painted skill strokes — implementation plan

Status: BUILT (2026-11-08) with Spike A (hand-rolled Canvas 2D). Deviations from this spec and the reasons are in `PLAN.md`
(Phase 2 v2 notes); acceptance results are in section 8. Originally written as a plan for a fresh session.

Companion docs: `PLAN.md` (original build plan, phase notes, gotchas), `SUMMARY.md` (state of the site),
`AGENTS.md` (this Next.js version has breaking changes; read `node_modules/next/dist/docs/` first).

---

## 1. What we are building

Replace the seven 3D clay spheres in the hero with a 2D painting animation:

- One **broad paint stroke** at a time appears in the hero's right-hand panel. It is *drawn*, not faded in:
  the bristles land, the stroke travels across the panel over about 1.5 s, thinning and drying at the end.
- Each stroke carries one **skill** as a text label sitting on the stroke.
- When the next stroke starts drawing, the previous one **fades out** (the fade overlaps the new draw).
- The sequence loops forever through the skill list.
- Colours stay within the site's orange/blue palette. Leadership skills are orange shades, engineering
  skills are blue shades, AI skills alternate (see section 3).

Reference feel: a wide flat brush loaded with gouache dragged once across paper. Slightly ragged edges,
visible bristle streaks, a soft taper where the brush lands and a dry, broken trail where it lifts.
Not calligraphy, not a thin line, not a marker.

### Out of scope
- Pointer interaction (the old tilt). Nothing in the brief asks for it. Optional later.
- Replacing the share image and favicon (they use `qualities.ts`; see section 7).
- Any change to hero copy, CTAs or the other sections.

---

## 2. Discovery results: libraries considered

Checked on 2026-11-08 against the npm registry and project docs.

| Option | Verdict | Why |
|---|---|---|
| **Hand-rolled Canvas 2D "stamp along a path" brush** | **Recommended (Spike A)** | Zero new dependencies. Full control of taper, dryness, bristle texture, progressive drawing and per-stroke fade. This is the standard technique behind most paint-stroke demos (stamp a textured brush tip every few pixels along a curve). Removes three.js entirely, so the hero chunk drops from ~269 kB gz to a few kB. |
| **SVG path + `motion` `pathLength` as a mask over a textured, tapered shape** | **Fallback (Spike B)** | Uses `framer-motion` 14.10.1 already installed (`pathLength` 0→1 draws a path; see https://motion.dev/examples/path-drawing). A thick stroked path with animated `pathLength` is used as a `<mask>` that reveals a tapered, filtered (feTurbulence + feDisplacementMap) stroke shape. Declarative and simple, but harder to get a convincing dry-brush trail; filters can be costly if animated, so keep the filter static. |
| three.js ribbon mesh with brush shader | Not recommended | Doable (ribbon along a curve, brush-tip texture, `progress` uniform discards fragments ahead of the brush), and the deps are already here, but it keeps ~269 kB gz of 3D code for a 2D effect and the WebGL/no-WebGL fallback complexity. Only revisit if Canvas 2D performance disappoints, which it will not at these stamp counts. |
| `p5.brush` (3.0.0, 2026-10-28, MIT, 3.5 MB unpacked, depends on `simplex-noise`, standalone build needs WebGL2) | Not recommended | Beautiful natural-media brushes, but it is built for generative art and print; the maintainer notes it is not aimed at real-time interactive pieces, and the README does not document drawing a stroke progressively over time. Too heavy for one hero effect. |
| `gsap` 3.15.1 + DrawSVGPlugin | Not needed | GSAP and all plugins are now free ("100% free for all users, thanks to Webflow's support", gsap.com/pricing). DrawSVG animates `stroke-dashoffset`, which `motion`'s `pathLength` already does here. Adding GSAP would duplicate an animation library. |
| `pixi.js` 8.22.0 (+ `@pixi/react`) | Not recommended | 76 MB unpacked, WebGL/WebGPU renderer. Massive overkill for one stroke at a time. |
| `brushstroke` (lmgonzalves) | Rejected | Not on npm, 6 commits, unmaintained demo library. Useful only as a visual reference. |
| `simplex-noise` 4.0.3 (MIT, 109 kB unpacked, tree-shakes to ~2 kB) | Optional | Only if a seeded hash (section 4.3) does not give pleasant enough edge jitter. Default: do not add it. |

**Decision for the executor:** build Spike A first, in a throwaway lab route. Only build Spike B if A
fails the acceptance checks in section 8 after one focused pass. Do not add dependencies unless a spike
proves a need.

Sources: https://github.com/acamposuribe/p5.brush · https://gsap.com/pricing/ · https://motion.dev/examples/path-drawing ·
https://github.com/lmgonzalves/brushstroke · https://discourse.threejs.org/t/ovu-a-3d-drawing-studio-in-the-browser-built-with-three-js-react-three-fiber/96178

---

## 3. Content: the skills

Source: the Skills section of the CV (Nov 2026) plus six additions requested by the owner. Label spelling
normalised to the products' own styling (React, Next.js, Node.js, Datadog). Keep every label short enough to sit on
one stroke at 375 px wide; two words is ideal, four is the maximum.

Create `src/components/hero/skills.ts` as the single source of truth:

```ts
export type SkillGroup = "lead" | "build" | "ai";
export type Skill = { name: string; group: SkillGroup; color: string };
```

Groups and colours (all from the existing palette in `src/app/globals.css` and `qualities.ts`; do not invent new hues):

- **lead** (orange shades, cycle through): `#ffbf85`, `#ff9a3d`, `#e8691f`
  - Building empowered teams
  - Project management & delivery
  - Stakeholder management
  - Cross-team leadership
  - Resilience & adaptability
- **build** (blue shades, cycle through): `#b4e0f5`, `#4cc2f4`, `#2f9bd8`, `#1b6fa3`
  - TypeScript
  - React
  - Next.js
  - Redux
  - Storybook
  - Node.js
  - GraphQL
  - PostgreSQL
  - AWS
  - Jest
  - Playwright
  - Datadog
  - Microservices
  - Observability & monitoring
- **ai** (alternate deep orange `#e8691f` and mid blue `#2f9bd8`):
  - Evals
  - LLM ops
  - AI-native development

**Play order:** interleave so colours alternate and the leadership/AI items are not bunched at the end.
Suggested explicit order (22 strokes):

1. Building empowered teams · 2. TypeScript · 3. AI-native development · 4. React · 5. Project management & delivery ·
6. Next.js · 7. Evals · 8. Node.js · 9. Stakeholder management · 10. GraphQL · 11. LLM ops · 12. PostgreSQL ·
13. Cross-team leadership · 14. AWS · 15. Microservices · 16. Jest · 17. Resilience & adaptability · 18. Playwright ·
19. Observability & monitoring · 20. Datadog · 21. Redux · 22. Storybook

Store the list in this order; do not shuffle at runtime (deterministic SSR fallback and predictable QA).

Label text colour: pick ink or cream per stroke with `readableTextColor()` from the existing `contrast.ts`.
Pale orange and pale blue get ink; deep shades get cream. Keep `contrast.ts`.

---

## 4. Design spec for the stroke (Spike A, Canvas 2D)

### 4.1 Geometry
- Canvas fills the hero's right panel (`22rem` tall on mobile, `600px` on `md+`, see `Hero.tsx`). Device pixel ratio capped at 2.
- Each stroke is a smooth curve through 4 control points (Catmull-Rom → sample ~200 points by arc length), running
  left to right, spanning 72–86 % of the canvas width, with a gentle arc (vertical deviation 6–12 % of height) and a
  tilt of −8° to +6°. Vertical position alternates around the centre so consecutive strokes do not sit on the same line
  (offsets of about −14 %, +4 %, +16 %, −4 % of height, cycling).
- Stroke width: 16–22 % of canvas height at full load (so ~100–130 px on desktop, ~60–75 px on mobile).
- Width profile along the stroke `w(t)`: ramps 0→1 over the first 8 % (brush landing), holds, then eases down to ~0.55 over
  the last 25 %.
- Alpha / load profile `a(t)`: 1 until 60 %, then falls to ~0.35 at the end with increasing streak breakup (dry brush).
- All randomness is **seeded by stroke index** (see 4.3) so every page load looks the same and screenshots are reproducible.

### 4.2 Brush tip
- Pre-render 3 brush-tip variants once into small offscreen canvases (e.g. 96 × 160 px, taller than wide: the tip is a
  flat brush seen side-on, long axis perpendicular to travel).
- Tip texture: 18–30 vertical bristle streaks with random x, width 2–5 px, alpha 0.35–1.0, drawn in the stroke colour on
  transparent, then a soft-edged radial/linear falloff at the two ends so the edge reads as hair, not a rectangle.
  Add 2–4 random gaps (missing bristles) to the streak set.
- Stamping: walk the sampled curve from the last stamped arc length to the current progress; place a stamp every
  `spacing = 0.06 × currentWidth` px (so ~6 px at full width). Per stamp: translate to the point, rotate to the tangent,
  scale to `w(t)`, `globalAlpha = a(t) × jitter(0.85–1)`, pick tip variant by `(stampIndex % 3)`, draw.
  Use `globalCompositeOperation = "source-over"` on the stroke's own layer. Expect 150–400 stamps per stroke in total,
  spread over ~1.5 s: trivial cost.
- Tip colour: strokes are a single hue each, so bake the colour into the tip canvases per stroke (re-render tips when the
  stroke changes; 3 small canvases is cheap). Optional: a second, 8 % darker pass on 20 % of bristles for depth.

### 4.3 Determinism without a dependency
Use a tiny seeded PRNG (mulberry32 or splitmix32, ~6 lines) keyed by stroke index. Only reach for `simplex-noise`
if straight-line bristles look too mechanical and you want wobble along the stroke; even then prefer a 1D sine sum.

### 4.4 Layers and compositing
- Two offscreen stroke layers (double-buffer), same size as the visible canvas. The current stroke is stamped onto layer A.
  Each frame, clear the visible canvas and composite: layer B (previous stroke) at `globalAlpha = fadeAlpha`, then layer A at 1.
- Fade uses a single `globalAlpha` on the whole previous layer, so the stroke fades as one object and never shows
  overlapping-stamp seams.
- Resize: on `ResizeObserver`, resize all three canvases, recompute the current curve, and restart the current stroke from
  progress 0 (acceptable; resizes are rare).

### 4.5 Timing (per stroke, defaults; expose as constants)
- `DRAW = 1.5 s` with an easing that starts slow for 10 % then runs almost linear (a brush accelerates after landing).
- `HOLD = 1.3 s` fully drawn.
- `FADE = 0.9 s`, ease-in, **starting at the same moment the next stroke begins drawing**.
- Cycle per skill ≈ `DRAW + HOLD` = 2.8 s → full loop of 22 skills ≈ 62 s.
- Driver: one `requestAnimationFrame` loop using elapsed time (not frame counts). Pause the loop when the hero is off screen
  (keep the existing `IntersectionObserver` approach from `HeroVisual.tsx`) and when `document.hidden`.

### 4.6 The label
- Render the label as **HTML**, not on the canvas: crisp at any DPR, uses the site font via `--font-inter-tight` without
  waiting on `document.fonts.ready`, and can be announced to assistive tech.
- Position: absolutely placed at the curve's midpoint (t ≈ 0.5), rotated to the tangent angle there (clamp to ±8°), using
  `transform: translate(-50%,-50%) rotate(θ)`. Font: Inter Tight 600, size ≈ 42 % of stroke width (clamp 18–44 px), letter-spacing
  −0.01em. Colour from `readableTextColor(stroke.color)`.
- Appearance: opacity 0 → 1 between 35 % and 70 % of `DRAW` (the brush has passed the midpoint by then), with a 6 px rise.
  Fade with the stroke using the same `fadeAlpha`.
- Drive opacity/transform **imperatively** from the rAF loop via a ref (`el.style.opacity = …`), not through React state, so
  there is no re-render per frame. Only the skill name changes via React state (once per 2.8 s).
- Accessibility: the animated label is `aria-hidden`. Add a visually hidden `<ul>` listing all skills once (static, server
  rendered) so screen readers and crawlers get the content. Use the existing `sr-only` pattern if present, else Tailwind `sr-only`.

### 4.7 Reduced motion and fallbacks
- `prefers-reduced-motion: reduce`: no drawing animation. Show one fully drawn stroke (stamped instantly at progress 1) with
  a label, and cross-fade to the next skill every 4 s with opacity only. If even that feels like motion, a single static stroke
  with the first skill is acceptable; decide after seeing it.
- No JavaScript / before hydration: a server-rendered `StaticStroke` (replaces `StaticOrb.tsx`): an inline SVG of one tapered
  stroke shape in `#ff9a3d` with the first skill's label. Same box size, so no layout shift.
- WebGL detection is no longer needed. Remove it.
- `(prefers-reduced-data: reduce)`: treat as reduced motion.

---

## 5. Spike B spec (only if A fails section 8)

SVG, fully declarative with `motion`:
1. Build the stroke as a **filled tapered polygon** (not a stroked line) by offsetting the sampled curve by ±`w(t)/2`.
2. Apply a static filter: `feTurbulence type="fractalNoise" baseFrequency="0.03 0.08" numOctaves="2"` →
   `feDisplacementMap scale="18"` for ragged edges; add a `<pattern>` of thin vertical lines with varying opacity as a
   `mask` for bristle streaks. Keep filters static (no animated `baseFrequency`).
3. Reveal with a second thick stroked `<motion.path>` along the centre line inside a `<mask>`, animating `pathLength` 0→1
   over `DRAW`. Fade the whole `<g>` with `opacity` over `FADE`. Use `AnimatePresence` for the overlap.
4. Label as in 4.6.

Known weaknesses to check: no dry-brush trail, the displacement filter edge looks the same along the whole stroke, Safari filter
rendering cost on large areas.

---

## 6. Files

### Create
- `src/components/hero/skills.ts` — the list, groups, colours, order (section 3).
- `src/components/hero/brush.ts` — pure functions, no React: seeded PRNG, curve sampling by arc length, width/alpha profiles,
  brush-tip rendering, `stampRange(ctx, curve, fromLen, toLen, …)`.
- `src/components/hero/PaintStrokes.tsx` — client component: canvases, rAF driver, double-buffer compositing, label element,
  visibility/reduced-motion handling. Accepts `{ active: boolean; animate: boolean }` like today's `Scene`.
- `src/components/hero/StaticStroke.tsx` — server-renderable SVG fallback (replaces `StaticOrb`).
- `src/app/lab/strokes/page.tsx` — **temporary** lab route for the spike with sliders/constants for DRAW/HOLD/FADE, width,
  spacing, bristle count. Delete before the final commit, or guard with `process.env.NODE_ENV !== "production"` and
  `notFound()`; the sitemap must not list it.

### Change
- `src/components/hero/HeroVisual.tsx` — drop WebGL detection and `next/dynamic` of `Scene`; render `PaintStrokes` (it is small;
  plain client component is fine, or keep `dynamic` with `loading: <StaticStroke />` to keep the server HTML identical).
- `src/components/sections/Hero.tsx` — likely untouched; check the background wash still complements a single stroke
  (consider reducing it, since the stroke now provides the colour).
- `PLAN.md` Phase 2 notes and `SUMMARY.md` "Hero 3D model" paragraph — rewrite to describe the strokes. Record decisions and
  gotchas there, as previous phases did.
- `README.md` if it mentions the spheres.

### Delete
- `src/components/hero/Model.tsx`, `Scene.tsx`, `marbleTexture.ts`, `clayTextures.ts`, `StaticOrb.tsx`.
- Dependencies: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` (`pnpm remove …`). Check nothing else imports
  them first (`grep -r "from \"three\"\|@react-three" src`). `public/models/` is empty; remove the folder.

### Keep
- `src/components/hero/qualities.ts` and `contrast.ts`: `icon.tsx` and `opengraph-image.tsx` import `QUALITIES`. Leave the share
  image and favicon alone in this round (section 7).
- `ScrollDrift.tsx` (hero text/visual move at different rates on scroll) — unchanged.

---

## 7. Follow-ups, not in this round
- Share image / favicon redesigned around a painted stroke so social previews match the hero. Needs a decision from the owner.
- Optional pointer interaction: stroke tilt or a faint "wet" highlight following the cursor.
- Optional: keep a very faint ghost (alpha 0.06) of past strokes so the panel slowly builds a palimpsest. Owner's call; off by default.
- Owner review of label wording (e.g. "Project management & delivery" vs "Delivery", "Observability & monitoring" vs "Observability").

---

## 8. Acceptance checks (run before the final commit)

Environment: `export PATH=$HOME/.local/node/bin:$PATH`; dev server via `.claude/launch.json` (`portfolio-dev`, port 3100;
port 3000 is held by the Claude app). `pnpm lint` and `pnpm build` must pass (Cache Components is on: no `new Date()` or other
dynamic APIs in server components during prerender).

Visual (check in the browser pane with screenshots at 375, 768, 1280, 1920 px wide):
- [x] The stroke is visibly *drawn* left to right over ~1.5 s, with a soft landing and a drier, thinner trail at the end.
      Stepped frame by frame at 30 / 60 / 100 % of the draw at 1280 px; landing is staggered and narrow, trail thins to 55 % width and breaks into dashes.
- [x] Bristle streaks and ragged edges are visible at 1280 px; the stroke does not look like a rounded rectangle. (1:1 canvas dumps checked in the lab route.)
- [x] The label sits on the stroke, is readable, never clips the canvas at 375 px, and never overflows a stroke for the longest labels.
      All 22 labels checked at 375, 768 and 1280: inside the canvas, at most two lines, 17 to 44 px. Measured paint behind the text box
      (composited over the page): median contrast above 5.1:1 for every label at every width. Deep blue + cream is the tightest (5.0:1 at full paint);
      a same-hue halo behind cream text holds it over streaks. Plain colour ratios: 5.0 to 12.9:1.
- [x] Previous stroke fades while the next draws; no frame shows two fully opaque strokes (fade starts at 1 when the new stroke is at 0 % and is 0 by 0.9 s).
- [x] Colours alternate orange/blue over the sequence; no stroke uses a hue outside the palette. (The plan's order has some blue runs; consecutive blues
      always differ in shade. Shading only lightens toward white or scales darker within the same hue.)
- [x] The fallback (`StaticStroke`) occupies the same box; no layout shift. The SVG, canvas and wrapper measure the same (440 x 600 at the pane's width);
      the server HTML contains the SVG and the first label, so it shows without JavaScript.
- [x] Reduced motion: no drawing animation; strokes appear fully painted and cross-fade (labels 0 → 0.33 → 0.67 → 1 over 0.9 s). Checked by forcing the
      media query in the page and hot-reloading `HeroVisual` (the pane cannot emulate the preference).
- [x] The hero still parallaxes via `ScrollDrift` (unchanged wrapper), and the loop pauses when the hero is scrolled off screen: a temporary frame counter
      stopped while scrolled away and resumed on return (counter removed).

Performance:
- [x] `pnpm build` output: no `three` chunk remains; the hero client JS is 11.5 kB gz (27 kB raw), down from ~269 kB gz.
- [~] Chrome Performance panel at 1280 px: not recorded, because the browser pane throttles rAF while hidden. Instead each frame's work was timed by stepping
      the engine at exact 60 fps frame times on an M-series Mac: drawing frames 0.09 ms mean, 0.4 ms p99. Preparing the next stroke costs 2 to 5 ms once per
      stroke and runs during the hold, when nothing moves (first, cold call ~13 ms). A real-time trace in a visible browser is still worth doing.
- [x] No console errors or React hydration warnings (dev server, fresh load).

Code:
- [x] `brush.ts` has no React or DOM-global imports (it imports only `contrast.ts`; canvases and contexts are passed in).
- [x] All timing/size knobs are named constants at the top of `PaintStrokes.tsx` or `brush.ts`.
- [x] Lab route removed (`src/app/lab/` deleted before commit); sitemap unchanged.
- [x] `PLAN.md` and `SUMMARY.md` updated; commit messages describe the change.

## 9. Suggested execution order for the executor

1. Read `AGENTS.md` and skim `node_modules/next/dist/docs/` for client components and `next/dynamic` in this Next version.
2. Add `skills.ts` and `brush.ts` with the pure functions; render one static, fully drawn stroke in the lab route. Iterate on the
   brush tip until a screenshot at 1280 px reads as paint. This is the step that decides the look; spend the time here.
3. Add the time driver: progressive stamping, then hold, then the double-buffer fade into the next stroke.
4. Add the HTML label and its timing. Check the longest labels at 375 px.
5. Reduced motion, visibility pause, resize handling, `StaticStroke` fallback.
6. Wire into `HeroVisual.tsx`; remove the 3D files and dependencies; fix imports; `pnpm lint && pnpm build`.
7. Run section 8. Update `PLAN.md` / `SUMMARY.md`. Remove the lab route. Commit.
8. Only if step 2 cannot produce a convincing paint look within one focused session: build Spike B (section 5) in the lab route and
   compare side by side before choosing.
