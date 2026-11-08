# Portfolio: summary of work done

Last updated: 2026-11-08. Detailed step-by-step notes live in `PLAN.md`; copy and facts to fill in live in `CONTENT.md`.

- **Live site:** https://dulini-mendis-portfolio.vercel.app/
- **Repository:** github.com/DuliniMendis/portfolio (branch `main`; every push to `main` deploys to production on Vercel)
- **Goal:** a light, modern, minimal portfolio that shows Dulini Mendis as both a builder and a leader, with a 3D animated hero and scroll parallax.

## What exists

**Landing page** (`src/app/page.tsx`): sticky translucent nav with the profile photo as avatar, hero with a 3D model, an "About" strip with the portrait, Builder cards, a Leader section, a Work grid (Seer Medical, Leonardo.ai, Canva), a company list, and a contact section with a LinkedIn link.

**Hero 3D model** (`src/components/hero/`): seven matte clay spheres, one per quality (Care, Creativity, Resilience, Pragmatism, Drive, Intelligence, Humility), each lettered with its name. They drift in a ring, press together into one marbled sphere, then break apart again on a 12 second loop. Pointer tilt, scroll parallax and a slow float are included. It loads after first paint, pauses when off screen, and falls back to a plain colour orb without WebGL. The 3D code is about 269 kB gzipped and loads separately.

**Project pages** (`src/app/work/`): a project page per company and a section page per piece of work, built from `src/content/projects.ts`:
- `/work/seer-medical` with `data-viewer`
- `/work/leonardo-ai` with `blueprints`, `flow-state`, `building-the-team`
- `/work/canva` with `cost-reduction`

Each has a back link, and project pages have previous/next links that wrap around. Section bodies (Context, What I did, Outcome) are placeholders.

**Polish and ship:** social-preview tags and a generated share image, favicon, sitemap, robots file, custom 404, skip link, visible focus ring, no-JS fallback for scroll reveals, Vercel Analytics tag.

## Design decisions

- **Palette:** orange and blue only, taken from the profile photo (`public/images/dulini.jpeg`) and then brightened on request. Tokens are in `src/app/globals.css`: accent orange `#ff9a3d`, bright blue `#1a96d2`, light blue `#5cc6f4`, deeper text blue `#08689e`, ink `#0e1717`, background `#f7f9fa`.
- **Contrast rule:** the bright blue is only 3.3:1 on white, so small blue text uses `text-blue-text`; icons and fills use `blue`. Dark ink on the orange is 8.6:1. Sphere labels switch between ink and cream by contrast (at least 5:1 for all seven).
- **Single source for the seven qualities:** `src/components/hero/qualities.ts` drives the spheres, the marble texture, the favicon and the share image. Array order is the ring order, and the last entry sits at the centre.
- **Fonts:** Inter Tight for headings, Inter for body. Light theme only.
- **Stack:** Next.js 16 (App Router, Cache Components on), React 19, Tailwind 4, three.js with react-three-fiber and drei, Framer Motion, Lenis, Vercel Analytics, pnpm.

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
- Real copy: headline, bio, roles and dates for each company, and the case-study text for every section (see `CONTENT.md`). Placeholders are hidden on the site until real text replaces them in `src/content/projects.ts`.
- Link GitHub and an email address in the contact section if wanted.
- A larger original of the photo (the current file is 200x200 pixels, so it is shown small).
- Decide on a custom domain (a purchase; not done). When connected, change the one address in `src/lib/site.ts`.
- Turn on Analytics in the Vercel project dashboard; the tag records nothing until then.
- Set the git author email on the earliest commits if wanted (two carry an auto-guessed address).

Engineering follow-ups:
- Run Lighthouse on the live site (target 90+ on mobile). Not yet done.
- Escape-to-close on the mobile menu.
- Test the reduced-motion and no-WebGL paths, a real touch device, and a screen reader.
- A full visual review of every section at every width. Only overflow was checked at 375, 768, 1280 and 1920 pixels.
- The first request to an unknown `/work/...` URL can return status 200 before the cached 404 takes over.
- `README.md` is still the default from the project template.

## Gotchas worth knowing

- With Cache Components on, server components must not read the current date or other runtime data during prerender, or the build fails.
- three.js does not recompile a material when a texture goes from none to present, so the sphere material is re-keyed when textures load.
- Typed route helpers such as `PageProps<"/work/[slug]">` only exist after `next build` or `next dev` regenerates types.
- Do not blend orange into blue in 3D colours; it goes grey. Keep each sphere in its own shade.

## How the work was run

Built phase by phase from `PLAN.md` in a single Claude Code session, with the owner steering the hero design through several revisions (helix, then 49 spheres, then seven clay spheres, then orange and blue shades). Two sessions forked from it later and edited the same folder at once; one commit swept another session's files in under a mislabelled message. For future work, run one session per folder, or use separate worktrees, and avoid stage-everything commits when several sessions are active. Port 3000 is held by the Claude app on this machine, so test servers use another port.
