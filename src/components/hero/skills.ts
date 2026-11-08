// The skills the hero paints, one stroke each, in play order.
// Leadership: orange shades. Engineering: blue shades. AI: alternating deep orange and mid blue.
// The order is fixed (no runtime shuffle) so the server fallback and QA screenshots are predictable.
export type SkillGroup = "lead" | "build" | "ai";
export type Skill = { name: string; group: SkillGroup; color: string };

const LEAD = ["#ffbf85", "#ff9a3d", "#e8691f"];
const BUILD = ["#b4e0f5", "#4cc2f4", "#2f9bd8", "#1b6fa3"];
const AI = ["#e8691f", "#2f9bd8"];

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

const SHADES: Record<SkillGroup, string[]> = { lead: LEAD, build: BUILD, ai: AI };

// Each group cycles through its own shades in the order its skills appear.
const seen: Record<SkillGroup, number> = { lead: 0, build: 0, ai: 0 };
export const SKILLS: readonly Skill[] = ORDER.map(([name, group]) => {
  const shades = SHADES[group];
  const color = shades[seen[group]++ % shades.length];
  return { name, group, color };
});
