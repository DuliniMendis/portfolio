# Portfolio: summary of work done

Last updated: 2026-11-08. Detailed step-by-step notes live in `PLAN.md`; copy and facts to fill in live in `CONTENT.md`.

- **Live site:** https://dulini-mendis-portfolio.vercel.app/
- **Repository:** github.com/DuliniMendis/portfolio (branch `main`; every push to `main` deploys to production on Vercel)
- **Goal:** a light, modern, minimal portfolio that shows Dulini Mendis as both a builder and a leader, with an animated hero (a pixel-art game of her career) and scroll parallax.

## What exists

**Landing page** (`src/app/page.tsx`): sticky translucent nav with the profile photo as avatar, hero with an auto-playing pixel-art career game, an "About" strip with the portrait, Builder cards, a Leader section, a Work grid (Seer Medical, Leonardo.ai, Canva), a company list, and a contact section with a LinkedIn link.

**Hero career game** (`src/components/hero/game/`, built 2026-11-08 from `PLAN-hero-career-game.md`): the hero's right-hand panel plays a looping 45 s pixel-art cutscene in the style of a 16-bit side-scroller. Nobody plays it. A small Dulini (brown skin, black hair in a bun, orange top) waits on a Sri Lankan beach by two palms, boards a little plane, flies over the ocean, jumps out over the University of Melbourne, codes, then puts on a lab coat for brain experiments at the bench, walks to Seer Medical, watches from a top-floor window (moving up as each floor is added) while the building grows and fills with colleagues, leaps out of her window as it shakes and drops floor by floor (everyone hops out and cheers, then vanishes in a puff once the camera moves on), works at her desk at Leonardo.Ai (facing out, like her colleagues) while pictures form in the air in streams of sparkles, gets swept with her colleagues into the Canva tower by a giant hand, connects to colleagues above, below and beside her (talk bubbles pop up) and streams code from a terminal with a little Claude Code bot perched on it until a wind blows her out of a window, lands on her feet, waves, and an iris closes before the loop opens again on the beach. Level cards name each place (names only, no years). The three company logos are the official SVGs in `public/logos/`, drawn crisp at device resolution; every other pixel is from the palette in `palette.ts` (orange, blue, ink, greys, sandstone, the sampled skin tones and a coral for the lab brain). Sprites are text in the repo (one character per pixel). Everything on screen is a pure function of the story clock, so the lab scrubber and the off-screen pause need no extra state. Hand-rolled Canvas 2D, no library: the hero's client code is about 24 kB gzipped, plus a 2.6 kB synth loaded only once sound starts. The server renders the first frame (her waving in front of the Canva tower) as an inline SVG of about 10 kB (`StaticFrame.tsx`), so the panel is painted before JavaScript runs and without it, and the canvas takes over on exactly the same frame. Reduced motion (or reduced data) shows one still postcard per beat, cross-fading every 4 s. The loop pauses when the hero is off screen or the tab is hidden. Screen readers get the story as an ordered list (`story.ts`). A synthesised chiptune theme and sound effects follow the story (`sound.ts`, Web Audio, no files): on by default from the visitor's first click or key press (browsers block sound before that), with a speaker button on the panel to turn it off; the choice is remembered. In development, `window.__careerGame.seek(ms)` jumps the story to any moment.

**Project pages** (`src/app/work/`): a project page per company and a section page per piece of work, built from `src/content/projects.ts`:
- `/work/seer-medical` with `data-viewer`
- `/work/leonardo-ai` with `blueprints`, `flow-state`, `building-the-team`
- `/work/canva` with `cost-reduction`

Each has a back link, and project pages have previous/next links that wrap around. Section bodies (Context, What I did, Outcome) are placeholders.

**Polish and ship:** social-preview tags and a generated share image, favicon, sitemap, robots file, custom 404, skip link, visible focus ring, no-JS fallback for scroll reveals, Vercel Analytics tag.

## Design decisions

- **Palette:** orange and blue only, taken from the profile photo (`public/images/dulini.jpeg`) and then brightened on request. Tokens are in `src/app/globals.css`: accent orange `#ff9a3d`, bright blue `#1a96d2`, light blue `#5cc6f4`, deeper text blue `#08689e`, ink `#0e1717`, background `#f7f9fa`.
- **Contrast rule:** the bright blue is only 3.3:1 on white, so small blue text uses `text-blue-text`; icons and fills use `blue`. Dark ink on the orange is 8.6:1.
- **Hero game palette:** one file, `src/components/hero/game/palette.ts`. Company logos keep their brand colours; the signs are coloured to suit each logo as published (white board for Seer's red wordmark, dark board for Leonardo's light one, blue crown for Canva's white one), so no logo is recoloured.
- **Hero skills:** the 22 skills left the hero with the paint strokes (owner's decision); they remain in the CV and the rest of the site.
- **Seven qualities:** `src/components/hero/qualities.ts` (with `contrast.ts`) now only drives the favicon and the share image (redesigning them around the game character is a follow-up).
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
- Test the hero game on a real touch device and with a screen reader. Reduced motion (via the lab switch) and the static SVG frame were checked in the browser pane; the game was watched at real speed in the pane, but no Performance trace was recorded.
- Hero game follow-ups from its plan: a favicon and share image built around the character, and a tap to skip to the next beat.
- A full visual review of every section at every width. Only overflow was checked at 375, 768, 1280 and 1920 pixels.
- The first request to an unknown `/work/...` URL can return status 200 before the cached 404 takes over.
- `README.md` is still the default from the project template.

## Gotchas worth knowing

- With Cache Components on, server components must not read the current date or other runtime data during prerender, or the build fails.
- Typed route helpers such as `PageProps<"/work/[slug]">` only exist after `next build` or `next dev` regenerates types.
- Do not blend orange into blue; it goes grey. The hero game draws only flat palette colours (no alpha blending in the pixel layer), checked by a colour count over the whole loop.
- Hero canvas: `ResizeObserver` and `IntersectionObserver` callbacks do not fire while a tab is in the background, so the engine sizes itself once synchronously on start.
- Hero game: anything asynchronous inside the engine (logo images loading) must check the engine's `destroyed` flag. In development, React Strict Mode mounts the game twice; without the flag the torn-down engine restarted itself on a logo's `onload` and kept drawing into the canvas.
- Hero game static frame: the SVG repeats the engine's pixel-scale rule (`panelLayout` in `world.ts`) as a size container query with CSS `round()`. Change one, change the other. Its paths keep draw order: a rectangle only joins an earlier path of its colour if nothing drawn since overlaps it.

## How the work was run

Built phase by phase from `PLAN.md` in a single Claude Code session, with the owner steering the hero design through several revisions (helix, then 49 spheres, then seven clay spheres, then orange and blue shades, then painted skill strokes, built from `PLAN-hero-paint-strokes.md` in its own worktree, then the pixel-art career game, built from `PLAN-hero-career-game.md` in its own worktree). Two sessions forked from it later and edited the same folder at once; one commit swept another session's files in under a mislabelled message. For future work, run one session per folder, or use separate worktrees, and avoid stage-everything commits when several sessions are active. Port 3000 is held by the Claude app on this machine, so test servers use another port.
