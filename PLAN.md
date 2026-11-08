# Portfolio Website — Build Plan

Owner: Dulini Mendis · LinkedIn: https://www.linkedin.com/in/dulini-mendis-537aa11b/

**Positioning:** Builder *and* leader. Every page should carry both threads: hands-on
engineering/product craft, and the way Dulini grows teams and ships through people.

**Visual direction:** light theme, modern, minimalist, lots of whitespace, one accent colour.
Hero banner with a 3D animated model and parallax scrolling. Motion is tasteful, never busy.

**Scope for this round:** landing page is the focus and must be polished. Project pages are
scaffolds only (routes, layout, headings, placeholder copy) to be expanded later.

Each step below is self-contained so Sonnet can take it in a fresh session. Do them in order.
Mark a step done by ticking its box and noting anything the next step needs to know.
Content for copy lives in `CONTENT.md`; do not invent biography facts — use placeholders
marked `TODO(dulini)` where CONTENT.md has gaps.

---

## Phase 0 — Tooling & scaffold

- [x] **0.1 Install toolchain.** Node is not on PATH in this folder. Install Node 22 LTS
  (via `nvm` or Homebrew) and `pnpm`. Verify with `node -v && pnpm -v`.
- [x] **0.2 Create the app.** In `/Users/dulini/Documents/Portfolio` run
  `pnpm create next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*"`
  (Next.js 15+, App Router, TypeScript, Tailwind v4). Init git, first commit.
- [x] **0.3 Add core deps.**
  `pnpm add three @react-three/fiber @react-three/drei framer-motion lenis lucide-react`
  `pnpm add -D @types/three`
  Decision record: R3F for the 3D hero, Framer Motion for reveal/parallax, Lenis for smooth
  scroll. Keep the bundle lean: 3D code is lazy-loaded (`next/dynamic`, `ssr: false`).
- [x] **0.4 Project structure.** Create:
  ```
  src/app/layout.tsx              root layout, fonts, metadata, Lenis provider
  src/app/page.tsx                landing page
  src/app/work/[slug]/page.tsx    project detail (static params from content)
  src/app/work/[slug]/[section]/page.tsx   sub-project pages (e.g. seer-medical/data-viewer)
  src/components/hero/            Hero.tsx, Scene.tsx (R3F), Model.tsx
  src/components/sections/        About, Builder, Leader, Work, Contact
  src/components/ui/              Button, Container, SectionHeading, Tag
  src/components/motion/          Reveal.tsx, Parallax.tsx
  src/content/projects.ts         typed content model (see Phase 3)
  src/lib/                        utils, cn()
  public/models/                  .glb assets
  ```
- [x] **0.5 Design tokens.** In `globals.css` define CSS variables: background `#fafafa`,
  surface `#ffffff`, ink `#111111`, muted `#6b7280`, one accent (suggest a warm coral or
  deep teal — pick one, record it here), border `#e5e7eb`. Fonts: a geometric sans for
  headings (e.g. `Geist` or `Inter Tight`) and `Inter` for body, loaded with `next/font`.
  Type scale: 14/16/18/24/32/48/72. Radius 12px. Max content width 1200px.
- [x] **0.6 Deploy pipeline.** Push to GitHub, connect to Vercel, confirm a preview URL
  builds green before writing any feature code.

> **Phase 0 notes (done 2026-11-08):**
> - Node 22.23.4 + pnpm installed to `~/.local/node` (checksum-verified, no sudo). It is NOT on your
>   PATH: run `export PATH=$HOME/.local/node/bin:$PATH` in each new shell, or add it to `~/.zshrc`.
> - Stack is Next.js 16.4.5, React 19.3, Tailwind 4. `AGENTS.md` says this Next has breaking
>   changes: read `node_modules/next/dist/docs/` before using unfamiliar APIs.
> - Layout props use the global `LayoutProps<"/">` helper; the Cache Components feature is on.
> - SUPERSEDED by the current palette note under Phase 1. Original: coral `#f2603f`, then photo-sampled colours. Fonts: Inter Tight (display) + Inter (body). Light only.
> - Tokens live in `src/app/globals.css` as CSS variables and Tailwind theme colours
>   (`bg-background`, `text-ink`, `text-muted`, `bg-accent`, `border-border`, `rounded-card`).
> - 0.6 done: repo at github.com/DuliniMendis/portfolio (SSH remote), deployed to https://dulini-mendis-portfolio.vercel.app/. Pushes to `main` auto-deploy; other branches get preview URLs.

## Phase 1 — Landing page shell

- [x] **1.1 Layout & nav.** Sticky, translucent nav: name/wordmark left; links `Work`,
  `Leadership`, `About`, `Contact` right; CTA button `Let's talk`. Collapses to a minimal
  menu on mobile. Smooth-scroll to section anchors.
- [x] **1.2 Section skeleton.** Landing page is a single scroll with these sections in order:
  1. Hero (3D banner) — Phase 2
  2. Intro strip — one-line thesis: "I build products and the teams that ship them."
  3. Builder — 3 cards: what she builds (data-heavy UIs, generative AI tooling, platform
     cost/performance). Each card links to a project.
  4. Leader — narrative block + 3 proof points (team growth, empowerment, work-life balance,
     delivery outcomes). Links to the Leonardo team-building page.
  5. Work — featured projects grid: Seer Medical, Leonardo.ai, Canva. Each card: logo/mark,
     role, 1-line impact, hover lift, click-through to `/work/[slug]`.
  6. Timeline — compact career timeline (companies + years). Facts from CONTENT.md.
  7. Contact — email, LinkedIn, GitHub. Footer.
- [x] **1.3 Motion primitives.** `Reveal` (fade+rise on enter, once, stagger children) and
  `Parallax` (translateY proportional to scroll via `useScroll`/`useTransform`). Respect
  `prefers-reduced-motion` — disable transforms, keep opacity.
- [x] **1.4 Lenis smooth scroll** wired in root layout; confirm anchors still work.

> **Phase 1 notes (done):**
> - Hero is a stand-in: a gradient orb inside `<Parallax>` in `src/components/sections/Hero.tsx`.
>   Phase 2 replaces the orb with the R3F canvas. Keep the left-hand copy and CTAs.
> - Motion helpers: `Reveal`, `Stagger`/`StaggerItem`, `Parallax`, `SmoothScroll` (Lenis) in `src/components/motion/`.
> - Cache Components is on: do not call `new Date()` or other dynamic APIs in server components
>   during prerender (the build fails). Use client components or `"use cache"`.
> - Timeline has company names only; roles and dates wait on the owner (see CONTENT.md).
> - Leader and Builder copy is draft wording with no invented metrics.
> - Project links point at `/work/...` routes that do not exist until Phase 3 (they 404 for now).
> - Local preview: `.claude/launch.json` starts `pnpm dev` with Node on the PATH.

> **Palette (current; brighter orange and blue):**
> - Theme tokens in `src/app/globals.css`: ink `#0e1717`, muted `#5a6a72`, background `#f7f9fa`, accent orange `#ff9a3d` (fills; dark ink on it is 8.6:1),
>   blue `#1a96d2` (fills, icons, focus ring; only 3.3:1 on white, so NOT for small text), blue-light `#5cc6f4` (hovers), blue-text `#08689e`
>   (small blue text: eyebrows, hover text; 5.7:1), sky `#d6eefc` and peach `#ffeedd` (washes, Leader gradient).
> - Rule: small blue text uses `text-blue-text`; icons and fills use `blue`. Buttons are `bg-accent` with ink text, hover `bg-blue-light`.
> - The seven spheres are shades of orange and blue only (`src/components/hero/qualities.ts`): Care soft orange, Creativity bright orange, Resilience deep orange,
>   Pragmatism pale blue, Drive bright blue, Intelligence mid blue, Humility deep blue (centre of the cluster). Array order = ring order = marble bands.
>   Label colour (ink or cream) is picked per sphere by contrast (`contrast.ts`), at least 5:1 for all seven. The share image reads the same list.
> - Photo is only 200x200 and no larger original exists (owner confirmed 2026-11-08). Show it at 200px or smaller; do not use it in the OG image.

## Phase 2 — Hero banner with 3D model (the showpiece)

- [x] **2.1 Scene setup.** `Scene.tsx`: R3F `<Canvas>` with transparent background, soft
  studio lighting (`Environment preset="studio"` or 2 directional lights + ambient),
  `dpr={[1, 1.5]}`, `frameloop="demand"` when idle. Lazy-loaded; show a CSS skeleton until
  ready. Fallback for no-WebGL: static SVG/PNG of the same shape.
- [x] **2.2 The model.** Start with a procedural abstract form (e.g. a cluster of smooth
  glass/matte spheres or a torus-knot in the accent colour, `MeshTransmissionMaterial` or
  `MeshPhysicalMaterial` with light roughness). Later swap for a custom `.glb` in
  `public/models/`. The form should read as "signal / data / connection" — nods to EEG
  waveforms and AI without being literal.
- [x] **2.3 Animation.** Slow idle rotation + subtle float (`drei/Float`). Pointer parallax:
  model tilts a few degrees toward the cursor (lerped). Scroll parallax: model drifts and
  scales down as the hero leaves the viewport; hero text moves at a different rate.
- [x] **2.4 Hero copy & layout.** Left: name, headline, one-sentence subhead, two CTAs
  (`See my work`, `How I lead`). Right (or behind on mobile): the 3D canvas. Mobile: canvas
  sits above the text at reduced height, pointer parallax off.
- [~] **2.5 Performance pass.** (PARTLY DONE: 3D chunk measured at ~269 kB gz, under budget, lazy-loaded. Lighthouse NOT run yet; no .glb used.) Lighthouse ≥ 90 on mobile. Hero JS chunk < 300 kB gz.
  Preload the model, compress with `gltf-transform` if a .glb is used.

> **Phase 2 notes:**
> - REVISED AGAIN: the hero is now exactly 7 matte clay spheres, one per quality, each lettered with its name.
>   Loop (12 s): they ring-drift, press together, and MERGE INTO ONE marbled clay sphere holding all seven colours (`marbleTexture.ts`, built from `qualities.ts`),
>   hold, then BREAK OFF into the seven again. The single sphere grows out of the pressed-together seven, which shrink away inside it. Names are painted on per-sphere canvas textures
>   (`clayTextures.ts`) with a shared grain bump map; spheres never rotate so names face the viewer. No legend. Keep to 7: do not add more spheres.
> - (Superseded) earlier iteration was 49 spheres in 7 colours.
>   Qualities and colours live in `src/components/hero/qualities.ts` (Creativity orange, Care peach, Pragmatism grey, Resilience rust, Drive bright blue,
>   Intelligence blue, Humility near-black); Edit that one file to change the set (names, colours).
> - Files: `src/components/hero/` Model (seven meshes plus one marbled whole, merge/break loop), Scene (R3F canvas, local Lightformer
>   environment, no HDR download), HeroVisual (lazy `next/dynamic` ssr:false, WebGL check, pauses off-screen via IntersectionObserver,
>   reduced-motion and coarse-pointer handling), StaticOrb (skeleton and no-WebGL fallback), ScrollDrift (hero text and model move at different rates).
> - Gotcha: three.js does not recompile a material when `map` goes from null to a texture; Model.tsx re-keys the material when textures load.
> - Not yet exercised: the no-WebGL fallback and reduced-motion paths (written but untested), and real touch devices.
> - Later: swap the procedural model for a bespoke `.glb` in `public/models/` if wanted; run Lighthouse on the deployed URL.
> - (All of the above is superseded by the v2 notes below; the three.js files and dependencies are gone.)

> **Phase 2 v2 notes: painted skill strokes (2026-11-08, replaces the spheres; spec in `PLAN-hero-paint-strokes.md`):**
> - What it does: one broad paint stroke at a time is drawn left to right over 1.5 s (`DRAW`), holds 1.3 s (`HOLD`), and fades over 0.9 s (`FADE`) while the next
>   one lands. Each carries one skill. 22 skills in a fixed order (`skills.ts`), about 62 s per loop. All randomness is seeded by stroke index, so every load looks the same.
> - Files: `skills.ts` (list, groups, colours), `brush.ts` (pure maths: PRNG, value noise, Catmull-Rom curve resampled by arc length, width/load profiles,
>   bristle generation, `paintStroke`; no React or DOM globals), `PaintStrokes.tsx` (client engine: rAF time driver, two offscreen layers for the
>   overlapping fade, two HTML labels driven imperatively, ResizeObserver, pause logic), `StaticStroke.tsx` (server SVG of stroke 1, same box),
>   `HeroVisual.tsx` (motion preference via `useSyncExternalStore`, IntersectionObserver pause, screen-reader list). Deleted: `Model`, `Scene`,
>   `marbleTexture`, `clayTextures`, `StaticOrb`, `public/models/`, and the `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` packages.
> - Decision: Spike A (hand-rolled Canvas 2D) was good enough on the first focused pass; Spike B (SVG + `pathLength`) was not built. One change to the plan's
>   technique: instead of stamping a pre-rendered brush tip every few pixels, the brush is a row of 40 to 70 bristles, each a polyline along the stroke that
>   keeps its place across the brush. Stamping smeared the tip's texture across the direction of travel and banded at the stamp spacing; bristle paths
>   give streaks along the stroke, ragged edges (outer bristles wander, start late, end early), a soft landing (staggered touch-down, width ramp) and a dry trail
>   (noise-driven dashes that thin and break up, outer bristles lifting off). The current stroke is redrawn from scratch each frame (a few dozen paths), so there are no seams.
>   A sparse speckle pattern knocked out of the paint gives a paper tooth.
> - Labels: HTML, Inter Tight 600. Font size starts at 42 % of the stroke width (18 to 44 px) and shrinks until the text fits: one line if possible, else two balanced lines.
>   The rotated label box must stay inside 80 % of the painted band along its whole length, and between 10 % and 72 % of the stroke (before the brush dries).
>   Labels are centred at 42 % along the stroke. They fade in once the brush has painted past their right-hand end (not at a fixed 35 to 70 % of the draw, which let
>   labels float over bare paper). Cream text on deep paint gets a soft halo in a deeper shade of the stroke's own hue.
> - Paint for colours that carry cream text (deep blue) is laid denser and slightly deeper; gap lanes open only after 68 % of the stroke, so labels never sit on bare streaks.
> - Stroke width is a fraction of min(height, 1.4 x width), so the tall, narrow panel at 768 px gets a stroke, not a dab.
> - Start-up: the server SVG is skill 1 already painted. After hydration it holds for `HOLD`, then fades out while skill 2 draws, so no skill shows twice in a row.
>   The next stroke is prepared during the current stroke's hold (2 to 5 ms once per stroke, while nothing moves); drawing frames cost about 0.1 ms mean and 0.4 ms at p99.
> - Reduced motion (or `prefers-reduced-data`): strokes are painted fully and cross-fade every 4 s (`CALM_HOLD`); no drawing.
> - The background wash in `Hero.tsx` was cut to about a third of its strength so the strokes carry the colour.
> - Not yet done: a real-time Performance trace in a visible browser (the test pane throttles rAF while hidden, so checks were made by stepping the engine at exact
>   60 fps frame times), a real touch device, a screen reader pass. Share image and favicon still use `qualities.ts` (follow-up).

## Phase 3 — Project scaffolding (structure only, light copy)

- [x] **3.1 Content model** in `src/content/projects.ts`:
  ```ts
  type Project = {
    slug: string; name: string; role: string; period: string; summary: string;
    accent?: string; sections: { slug: string; title: string; kind: 'build'|'lead'; blurb: string }[];
  }
  ```
  Populate from CONTENT.md.
- [x] **3.2 Project page template** `/work/[slug]`: header (name, role, period, summary),
  then a grid of section cards. `generateStaticParams` from the content file.
- [x] **3.3 Section page template** `/work/[slug]/[section]`: title, blurb, and a
  placeholder body with headings `Context · What I did · Outcome` left as `TODO(dulini)`.
- [x] **3.4 Routes to exist:**
  - `/work/seer-medical` → `data-viewer` (EEG time-series synced with video)
  - `/work/leonardo-ai` → `blueprints`, `flow-state`, `building-the-team`
  - `/work/canva` → `cost-reduction`
- [x] **3.5 Prev/next navigation** between projects, and a `Back to work` link.

> **Phase 3 notes (done):**
> - Routes: `/work/[slug]` and `/work/[slug]/[section]`, both with `generateStaticParams` from `src/content/projects.ts`.
>   `src/app/work/layout.tsx` adds Nav and Footer (the home page includes its own).
> - Placeholders: copy containing `TODO(` is hidden by `finalCopy()` / `isDraft()` and replaced with "Write-up coming soon."
>   To publish real copy, replace the TODO strings in `projects.ts`; no page changes needed. Section bodies (Context / What I did / Outcome)
>   are placeholders in `src/app/work/[slug]/[section]/page.tsx` and are meant to be replaced per section later.
> - Unknown slugs show the not-found page with `noindex` but return HTTP 200: `dynamicParams` is unavailable with Cache Components. Phase 4 adds a custom 404.
> - Typed helpers `PageProps<"/work/[slug]">` only exist after `next build`/`next dev` regenerates types.
> - Pager: previous/next project wraps around (Canva next is Seer Medical).

> **Phase 3 notes (done):**
> - Routes: `/work/[slug]` and `/work/[slug]/[section]` (all 7 real paths return 200; unknown slugs 404 via `notFound()`).
>   `src/app/work/layout.tsx` adds the Nav and Footer for these pages. Content helpers live in `src/content/projects.ts`
>   (`getProject`, `getSection`, `neighbours`, `isDraft`, `finalCopy`). Copy containing `TODO(` is hidden on the site and shown as "Write-up coming soon."
> - Section pages have Context / What I did / Outcome headings with "This write-up is in progress." Replace per `CONTENT.md`.
> - Project role and period are still `TODO(dulini)` in `projects.ts` and therefore not shown yet.
> - Typed route helpers (`PageProps<'/work/[slug]'>`) only exist after `next build` or `next dev` regenerates them; run a build before `tsc` after adding routes.

## Phase 4 — Polish & ship

- [x] **4.1 Metadata & OG image** (static OG image generated with `next/og`).
- [x] **4.2 Accessibility:** keyboard nav, focus rings, alt text, colour contrast ≥ 4.5:1,
  reduced-motion verified.
- [x] **4.3 Responsive QA** at 375 / 768 / 1280 / 1920.
- [x] **4.4 Analytics** (Vercel Analytics) and a custom 404.
- [~] **4.5 Production deploy** and custom domain if available.

## Later (not this round)

- Full write-ups for each project section (case-study format, images, diagrams).
- Leadership page with principles, rituals, and testimonials.
- Blog / writing section.
- Replace procedural hero model with a bespoke .glb.
- DONE (2026-11-08): the 3D spheres were replaced by painted skill strokes per `PLAN-hero-paint-strokes.md`. See the Phase 2 v2 notes.

> **Phase 4 notes:**
> - Done and live: metadata and Open Graph/Twitter tags (`src/lib/site.ts` holds the site URL; change it when a custom domain is connected), generated share image
>   (`opengraph-image.tsx`, reads `QUALITIES` so it follows the palette), favicon (`icon.tsx`, default Next favicon removed), `sitemap.ts`, `robots.ts`,
>   custom 404 (`not-found.tsx` at the root with its own nav; `work/not-found.tsx` inside the work layout), skip link + `id="main"`, global focus ring in
>   `a11y.css`, no-JS fallback so scroll reveals are not stuck hidden, and `@vercel/analytics`.
> - Checked: one h1, heading order, landmarks, no unlabeled links or buttons, text contrast on solid backgrounds (gradient sections not machine-checked),
>   no horizontal overflow at 375/768/1280/1920, absolute OG URLs, real 404 status on `/nope`.
> - NOT done: Escape-to-close on the mobile menu (Nav.tsx was being edited by another session), Lighthouse, screen-reader test, reduced-motion path
>   test, visual review of every section at every width. A first-ever request to an unknown `/work/...` URL can return 200 before the cached 404 takes over.
> - 4.5: production deploys automatically on push and is live. A custom domain is NOT set (owner's decision). Vercel Analytics collects nothing until
>   Analytics is enabled in the Vercel project dashboard.
> - Process note: several sessions share this one folder. Commits made with `git add -A` swept my Phase 4 files into another session's commit.
