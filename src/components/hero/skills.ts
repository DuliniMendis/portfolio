// The skills the hero paints, one stroke each, in play order.
// Leadership: orange shades. Engineering: blue shades. AI: deep orange or mid blue.
// The order is fixed (no runtime shuffle) so the server fallback and QA screenshots are predictable.
export type SkillGroup = "lead" | "build" | "ai";
export type Skill = { name: string; group: SkillGroup; color: string };

// Labels are white, so strokes use the mid and deep shades of the palette; the palest
// (#ffbf85, #b4e0f5) are left out because white lettering does not read on them.
const SHADES: Record<SkillGroup, string[]> = {
  lead: ["#ff9a3d", "#e8691f"],
  build: ["#4cc2f4", "#2f9bd8", "#1b6fa3"],
  ai: ["#e8691f", "#2f9bd8"],
};

/** Up to three strokes show at once, so a colour is not reused within this many neighbours. */
const DISTINCT = 2;

const ORDER: [string, SkillGroup][] = [
  ["Building empowered teams", "lead"],
  ["TypeScript", "build"],
  ["AI-native development", "ai"],
  ["React", "build"],
  ["Project management & delivery", "lead"],
  ["Next.js", "build"],
  ["Evals", "ai"],
  ["Node.js", "build"],
  ["Stakeholder management", "lead"],
  ["GraphQL", "build"],
  ["LLM ops", "ai"],
  ["PostgreSQL", "build"],
  ["Cross-team leadership", "lead"],
  ["AWS", "build"],
  ["Microservices", "build"],
  ["Jest", "build"],
  ["Resilience & adaptability", "lead"],
  ["Playwright", "build"],
  ["Observability & monitoring", "build"],
  ["Datadog", "build"],
  ["Redux", "build"],
  ["Storybook", "build"],
];

/** If every shade of a group is in use by a neighbour, these (same palette) are tried next. */
const SPARE: Record<SkillGroup, string[]> = { lead: [], build: [], ai: ["#ff9a3d", "#1b6fa3"] };

// Each group cycles through its shades, skipping any shade one of the previous strokes is using.
const next: Record<SkillGroup, number> = { lead: 0, build: 0, ai: 0 };
const used: string[] = [];
export const SKILLS: readonly Skill[] = ORDER.map(([name, group]) => {
  const shades = SHADES[group];
  const recent = used.slice(-DISTINCT);
  const cycle = shades.map((_, i) => shades[(next[group] + i) % shades.length]);
  const color =
    [...cycle, ...SPARE[group]].find((c) => !recent.includes(c)) ??
    cycle.find((c) => c !== recent[recent.length - 1]) ??
    cycle[0];
  if (shades.includes(color)) next[group] = shades.indexOf(color) + 1;
  used.push(color);
  return { name, group, color };
});
