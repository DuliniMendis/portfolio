# Content Brief

Single source of truth for copy. Anything marked `TODO(dulini)` needs Dulini to fill in —
do not invent facts. LinkedIn profile (login-walled, could not be fetched automatically):
https://www.linkedin.com/in/dulini-mendis-537aa11b/

## Identity

- **Name:** Dulini Mendis
- **Headline (hero):** `TODO(dulini)` — e.g. "Engineering leader who still ships."
- **Thesis line:** "I build products and the teams that ship them."
- **About (Intro section):** the TL;DR from Dulini's CV, used as-is.
- **Location / availability:** Melbourne, Australia. Open to engineering and leadership roles.
- **Links:** LinkedIn (above) · GitHub `TODO(dulini)` · Email `TODO(dulini)`

## Two threads

**Builder** — data-heavy, real-time UIs; generative-AI product surfaces; platform cost and
performance work. Proof: Seer Data Viewer, Leonardo Blueprints & Flow State, Canva cost reduction.

**Leader** — grows empowered, high-performance teams that sustain work-life balance. Proof:
Leonardo team-building story. `TODO(dulini)`: team sizes, tenure, outcomes you can cite.

## Career timeline

| Company | Role | Period |
|---|---|---|
| Canva | Engineering Manager (CV: Generative Foundations Platform) | May 2026 – Nov 2026 |
| Leonardo.ai | Frontend Tech Lead (LinkedIn: Technical Lead) | Nov 2024 – Apr 2026 (CV says Oct 2024 – May 2026) |
| Seer Medical | Software Engineer → Senior Engineering Manager → Staff Engineer | Jul 2017 – Oct 2024 |
| Outcome.Life | Web Developer (part-time) | Mar 2017 – Jun 2017 |
| IBM | Research Intern | Jun 2016 – Oct 2016 |
| University of Melbourne | PhD (Engineering), computational neuroscience | Jan 2014 – Sep 2017 |
| Virtusa (Sri Lanka) | Senior Engineer, Technology | Dec 2011 – Jul 2013 |

Source: LinkedIn experience page and CV, read 2026-11-08. Dates follow LinkedIn. Order on the
site: most recent first, by start date. Lives in `src/components/sections/Timeline.tsx`; the
three companies with project pages read role and period from `projects.ts`.

## Projects

### Seer Medical — slug `seer-medical`
- Role: Founding engineer to Senior Engineering Manager, 2017 – 2024. Full role list (from
  LinkedIn) is in `roles` in `src/content/projects.ts`.
- Copy for Data Viewer, Live monitoring and Clinic operations lives in `src/content/projects.ts`
  (drafted 2026-11-08 from Dulini's notes and LinkedIn, Rob Kerr's "Seer Cloud" Medium
  article, and public Seer Sense coverage).

### Leonardo.ai — slug `leonardo-ai`
- Role: Frontend Tech Lead. Period: Nov 2024 – Apr 2026.
- Copy for Flow State, Blueprints and Building the team lives in `src/content/projects.ts`
  (drafted 2026-11-08 from Leonardo's help centre, launch press and Dulini's notes).
- Also there, from Dulini's notes (2026-11-08) and the CV: Faster generation history (performance and
  decoupling the React components), Engineering standards (dos and don'ts with examples, knowledge-share
  talks; adopted company-wide per the CV), Secrets in one place (all secrets moved into AWS, built by a
  senior engineer reporting to Dulini, who oversaw and reviewed it), and Automatic security updates
  (package updates automated for security vulnerabilities, built by another senior engineer and
  supervised by Dulini). No metrics yet for any of these.

### Canva — slug `canva`
- Role: Engineering Manager. Period: May 2026 – Nov 2026.
- Worked in design generation, then a platform team supporting Canva AI.
- Copy for Cost reduction lives in `src/content/projects.ts` (drafted 2026-11-08 from Dulini's
  notes, with press links to Fortune and Forbes Australia coverage of Canva's 2026 AI costs).
  Outcome: Liberation's costs cut by 50% with no loss of design quality (Dulini, 2026-11-08).
- Copy for One-click bug reports (kind `build`: one-click Canva AI bug reports for staff, traces
  saved to CoreWeave Forge and Langfuse, Jira tickets, Slack alerts) also lives there. The
  project was never rolled out: it stopped when Canva made layoffs in November 2026.
- Copy for From pipelines to agent tools (kind `lead`: packaging pipelines as agent tools,
  retiring overtaken ones, negotiating timelines with internal teams during parallel Canva AI
  launches) also lives there. Outcome: one pipeline became three new tools in the tools service;
  the overtaken ones were retired and seven internal teams moved off them.
- AI automations (daily round-up, meeting slides, Jira weekly reporting) are a small mention in
  the Canva summary, not a case study: their impact was never measured (Dulini's call, 2026-11-08).

## Tone

Confident, plain, specific. Short sentences. Outcomes over adjectives. First person.
