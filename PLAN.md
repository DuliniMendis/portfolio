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
> - SUPERSEDED by the palette note under Phase 1 (colours now come from the profile photo). Original: coral `#f2603f`. Fonts: Inter Tight (display) + Inter (body). Light only.
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

> **Palette (sampled from `public/images/dulini.jpeg`):**
> - ink `#0e1717`, blue-deep `#033749`, blue `#056c95`, accent orange `#f79840`,
>   accent-strong `#b85209`, muted `#5a6a72`, border `#dbe3e6`, background `#f7f9fa`.
> - Contrast rule: vivid orange is for fills and for text on dark (5.8:1+). On light backgrounds use
>   `text-accent-strong` (4.7:1). Button hover is `bg-blue` with white text.
> - Photo is only 200x200. Show it at 200px or smaller. Ask for a larger original for any bigger use or an OG image.
> - Hero 3D model should use these colours: orange light on deep blue, like the portrait lighting.

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
> - Files: `src/components/hero/` Model (instanced double helix: orange and blue strands, spine), Scene (R3F canvas, local Lightformer
>   environment, no HDR download), HeroVisual (lazy `next/dynamic` ssr:false, WebGL check, pauses off-screen via IntersectionObserver,
>   reduced-motion and coarse-pointer handling), StaticOrb (skeleton and no-WebGL fallback), ScrollDrift (hero text and model move at different rates).
> - Colours: do not blend orange into blue (it goes grey); each strand shades within its own hue. `toneMapped={false}` keeps them vivid.
> - Not yet exercised: the no-WebGL fallback and reduced-motion paths (written but untested), and real touch devices.
> - Later: swap the procedural model for a bespoke `.glb` in `public/models/` if wanted; run Lighthouse on the deployed URL.

## Phase 3 — Project scaffolding (structure only, light copy)

- [ ] **3.1 Content model** in `src/content/projects.ts`:
  ```ts
  type Project = {
    slug: string; name: string; role: string; period: string; summary: string;
    accent?: string; sections: { slug: string; title: string; kind: 'build'|'lead'; blurb: string }[];
  }
  ```
  Populate from CONTENT.md.
- [ ] **3.2 Project page template** `/work/[slug]`: header (name, role, period, summary),
  then a grid of section cards. `generateStaticParams` from the content file.
- [ ] **3.3 Section page template** `/work/[slug]/[section]`: title, blurb, and a
  placeholder body with headings `Context · What I did · Outcome` left as `TODO(dulini)`.
- [ ] **3.4 Routes to exist:**
  - `/work/seer-medical` → `data-viewer` (EEG time-series synced with video)
  - `/work/leonardo-ai` → `blueprints`, `flow-state`, `building-the-team`
  - `/work/canva` → `cost-reduction`
- [ ] **3.5 Prev/next navigation** between projects, and a `Back to work` link.

## Phase 4 — Polish & ship

- [ ] **4.1 Metadata & OG image** (static OG image generated with `next/og`).
- [ ] **4.2 Accessibility:** keyboard nav, focus rings, alt text, colour contrast ≥ 4.5:1,
  reduced-motion verified.
- [ ] **4.3 Responsive QA** at 375 / 768 / 1280 / 1920.
- [ ] **4.4 Analytics** (Vercel Analytics) and a custom 404.
- [ ] **4.5 Production deploy** and custom domain if available.

## Later (not this round)

- Full write-ups for each project section (case-study format, images, diagrams).
- Leadership page with principles, rituals, and testimonials.
- Blog / writing section.
- Replace procedural hero model with a bespoke .glb.
