// Content model for projects. Copy marked TODO(dulini) is a draft to be confirmed.
export type ProjectSection = {
  slug: string;
  title: string;
  kind: "build" | "lead";
  blurb: string;
};

export type Project = {
  slug: string;
  name: string;
  role: string;
  period: string;
  summary: string;
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "seer-medical",
    name: "Seer Medical",
    role: "TODO(dulini)",
    period: "TODO(dulini)",
    summary:
      "A clinical Data Viewer that shows EEG time-series data in sync with patient video.",
    sections: [
      {
        slug: "data-viewer",
        title: "Data Viewer",
        kind: "build",
        blurb:
          "EEG time-series data synchronised frame-accurately with video, so clinicians can review events in context.",
      },
    ],
  },
  {
    slug: "leonardo-ai",
    name: "Leonardo.ai",
    role: "TODO(dulini)",
    period: "TODO(dulini)",
    summary:
      "Two generative AI products, Blueprints and Flow State, and the team that built them.",
    sections: [
      { slug: "blueprints", title: "Blueprints", kind: "build", blurb: "TODO(dulini)" },
      { slug: "flow-state", title: "Flow State", kind: "build", blurb: "TODO(dulini)" },
      {
        slug: "building-the-team",
        title: "Building the team",
        kind: "lead",
        blurb:
          "How the team became empowered and high performing while protecting work-life balance.",
      },
    ],
  },
  {
    slug: "canva",
    name: "Canva",
    role: "TODO(dulini)",
    period: "TODO(dulini)",
    summary: "Cost reduction work across the platform.",
    sections: [
      { slug: "cost-reduction", title: "Cost reduction", kind: "build", blurb: "TODO(dulini)" },
    ],
  },
];

/** True for copy that is still a placeholder (see CONTENT.md). Pages hide it instead of showing it. */
export function isDraft(text: string | undefined): boolean {
  return !text || text.includes("TODO(");
}

/** Returns the text, or undefined while it is still a placeholder. */
export function finalCopy(text: string | undefined): string | undefined {
  return isDraft(text) ? undefined : text;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getSection(project: Project, slug: string): ProjectSection | undefined {
  return project.sections.find((s) => s.slug === slug);
}

/** Previous and next project, wrapping around the ends. */
export function neighbours(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

export const KIND_LABEL: Record<ProjectSection["kind"], string> = {
  build: "Build",
  lead: "Leadership",
};
