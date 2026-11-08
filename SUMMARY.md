# Portfolio: summary of work done

Last updated: 2026-11-08. Detailed step-by-step notes live in `PLAN.md`; copy and facts to fill in live in `CONTENT.md`.

- **Live site:** https://dulini-mendis-portfolio.vercel.app/
- **Repository:** github.com/DuliniMendis/portfolio (branch `main`; every push to `main` deploys to production on Vercel)
- **Goal:** a light, modern, minimal portfolio that shows Dulini Mendis as both a builder and a leader, with a painted, animated hero and scroll parallax.

## What exists

**Landing page** (`src/app/page.tsx`): sticky translucent nav with the profile photo as avatar, hero with painted skill strokes, an "About" strip with the portrait, Builder cards, a Leader section, a Work grid (Seer Medical, Leonardo.ai, Canva), a company list, and a contact section with a LinkedIn link.

**Hero paint strokes** (`src/components/hero/`): broad gouache-style brush strokes, two or three on screen at once in three lanes. A new one starts every 1.6 s, is drawn left to right over 1.5 s, holds, and fades as later ones land. Each carries one skill, painted in white along the stroke's arc (the lettering is clipped to the paint and takes the paper grain, so it reads as part of the stroke). The loop runs through 22 skills (CV skills plus evals, LLM ops, microservices, observability and monitoring, Playwright and AI-native development; list, order and colours in `skills.ts`) in about 35 s. Leadership skills are orange, engineering skills blue, AI skills deep orange or mid blue; strokes on screen together never share a shade. It is a hand-rolled Canvas 2D brush (`brush.ts`: seeded randomness, a curve per stroke, ~40 to 70 bristle paths with dry-brush breakup, label layout and glyph placement along the curve; `PaintStrokes.tsx`: the scheduler, a pool of offscreen layers and the compositing). No animation library and no WebGL; the hero code is about 12 kB gzipped (the old three.js hero was about 269 kB). The server renders the first two strokes as SVG with `textPath` labels (`StaticStroke.tsx`), so the hero is painted before JavaScript runs and without it. Reduced motion (or reduced data) shows fully painted strokes that fade in and out on a slower schedule. The loop pauses when the hero is off screen or the tab is hidden. Screen readers get a plain list of the skills.

**Project pages** (`src/app/work/`): a project page per company and a section page per piece of work, built from `src/content/projects.ts`:
- `/work/seer-medical` with `data-viewer`
- `/work/leonardo-ai` with `blueprints`, `flow-state`, `building-the-team`
- `/work/canva` with `cost-reduction`

Each has a back link, and project pages have previous/next links that wrap around. Section bodies (Context, What I did, Outcome) are placeholders.

**Polish and ship:** social-preview tags and a generated share image, favicon, sitemap, robots file, custom 404, skip link, visible focus ring, no-JS fallback for scroll reveals, Vercel Analytics tag.

## Design decisions

- **Palette:** orange and blue only, taken from the profile photo (`public/images/dulini.jpeg`) and then brightened on request. Tokens are in `src/app/globals.css`: accent orange `#ff9a3d`, bright blue `#1a96d2`, light blue `#5cc6f4`, deeper text blue `#08689e`, ink `#0e1717`, background `#f7f9fa`.
- **Contrast rule:** the bright blue is only 3.3:1 on white, so small blue text uses `text-blue-text`; icons and fills use `blue`. Dark ink on the orange is 8.6:1. Hero stroke labels are white (owner's choice), so strokes use only the mid and deep shades (the palest orange and blue are left out) and each label has a soft shadow in a deeper shade of its stroke. White on the bright orange and bright blue is below 4.5:1 by the formula; it relies on the shadow and large, semibold type.
- **Single source for the hero skills:** `src/components/hero/skills.ts` (names, groups, colours, play order; no runtime shuffle).
- **Seven qualities:** `src/components/hero/qualities.ts` now only drives the favicon and the share image (left as they were when the hero changed; redesigning them around a stroke is a follow-up).
- **Fonts:** Inter Tight for headings, Inter for body. Light theme only.
- **Stack:** Next.js 16 (App Router, Cache Components on), React 19, Tailwind 4, Canvas 2D (hand-rolled, no library) for the hero, Framer Motion, Lenis, Vercel Analytics, pnpm.

## Running it locally

Node is installed under `~/.local/node` and is not on the PATH by default.

```bash
export PATH=$HOME/.local/node/bin:$PATH
cd /Users/dulini/Documents/Portfolio
pnpm dev
```

Use `pnpm build` to check a production build. `AGENTS.md` warns that this Next version has breaking changes, so read `node_modules/next/dist/docs/` before using unfamiliar APIs.

## Still to do

Needs Dulini:
- Turn on the contact form. It sends through Resend (`src/app/actions/contact.ts`). Create a free Resend account with dulini.mendis@gmail.com
  (without a verified domain, Resend only delivers to the account's own address), create an API key, and add it as `RESEND_API_KEY` in the
  Vercel project's environment variables (and in `.env.local` for local testing), then redeploy. Until then the form shows a "couldn't be sent" message.
  Optional: `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` override the recipient and sender.
- Real copy: headline, bio, roles and dates for each company, and the case-study text for every section (see `CONTENT.md`). Placeholders are hidden on the site until real text replaces them in `src/content/projects.ts`.
- Link GitHub and an email address in the contact section if wanted.
- Decide on a custom domain (a purchase; not done). When connected, change the one address in `src/lib/site.ts`.
- Turn on Analytics in the Vercel project dashboard; the tag records nothing until then.
- Set the git author email on the earliest commits if wanted (two carry an auto-guessed address).

Engineering follow-ups:
- Test the hero on a real touch device and with a screen reader. Reduced motion and the no-JS fallback were checked in the browser pane.
- Watch the hero at real speed in a visible browser and record a Performance trace (the paint-stroke checks were stepped frame by frame because the test pane throttled animation frames).
- A full visual review of every section at every width. Only overflow was checked at 375, 768, 1280 and 1920 pixels.
- The first request to an unknown `/work/...` URL can return status 200 before the cached 404 takes over.
- `README.md` is still the default from the project template.

## Gotchas worth knowing

- With Cache Components on, server components must not read the current date or other runtime data during prerender, or the build fails.
- Typed route helpers such as `PageProps<"/work/[slug]">` only exist after `next build` or `next dev` regenerates types.
- Do not blend orange into blue; it goes grey. Each paint stroke stays in one shade, and deep shades are darkened by scaling, not by mixing toward ink, which greys pale colours.
- Hero canvas: `ResizeObserver` and `IntersectionObserver` callbacks do not fire while a tab is in the background, so the engine sizes itself once synchronously on start. `scrollWidth` is a whole number, so label fitting uses whole-pixel limits.

## How the work was run

Built phase by phase from `PLAN.md` in a single Claude Code session, with the owner steering the hero design through several revisions (helix, then 49 spheres, then seven clay spheres, then orange and blue shades, then painted skill strokes, built from `PLAN-hero-paint-strokes.md` in its own worktree). Two sessions forked from it later and edited the same folder at once; one commit swept another session's files in under a mislabelled message. For future work, run one session per folder, or use separate worktrees, and avoid stage-everything commits when several sessions are active. Port 3000 is held by the Claude app on this machine, so test servers use another port.
