// Content model for projects. Copy marked TODO(dulini) is a draft to be confirmed.
import type { StaticImageData } from "next/image";
import blueprintsCatalogue from "./images/leonardo/blueprints-catalogue.jpg";
import blueprintsSteps from "./images/leonardo/blueprints-steps.jpg";
import flowStateStream from "./images/leonardo/flow-state-stream.jpg";

export type ProjectImage = {
  src: StaticImageData;
  alt: string;
  caption?: string;
};

export type ProjectSection = {
  slug: string;
  title: string;
  kind: "build" | "lead";
  blurb: string;
  /** Case-study body. Each part is a list of paragraphs; a missing part shows as in progress. */
  body?: Partial<Record<BodyPart, string[]>>;
  /** Main technologies, shown as tags under the intro. */
  stack?: string[];
  /** Screenshots shown between the intro and the story. */
  images?: ProjectImage[];
};

export type BodyPart = "context" | "did" | "outcome";

export const BODY_PARTS: { key: BodyPart; heading: string }[] = [
  { key: "context", heading: "Context" },
  { key: "did", heading: "What I did" },
  { key: "outcome", heading: "Outcome" },
];

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
    role: "Frontend Tech Lead",
    period: "TODO(dulini)",
    summary:
      "Frontend tech lead for the squad behind two flagship generative AI features, Flow State and Blueprints.",
    sections: [
      {
        slug: "flow-state",
        title: "Flow State",
        kind: "build",
        blurb:
          "An endless stream of images from a single prompt, built for exploring ideas before you commit to one.",
        stack: ["TypeScript", "React", "Next.js", "Client-side rendering", "GraphQL", "XState"],
        images: [
          {
            src: flowStateStream,
            alt: "Flow State: a prompt for a Japanese modernist interior above a grid of generated rooms, with Vibe, Lighting, Shot Type and Colour Theme controls on the left and a More Like This button on one image.",
            caption:
              "One prompt, a stream of different takes on it. Style controls on the left, More Like This on any image.",
          },
        ],
        body: {
          context: [
            "Image generators are built for precision. You write a careful prompt, wait, and judge a small batch. That works when you know what you want. It is slow when you are still looking.",
            "Flow State turns that around. You type one idea and images generate in near real time as you scroll, each a different take on it. Style controls for vibe, lighting, shot type and colour theme set the starting look.",
            "When an image catches your eye, More Like This digs into it and generates versions closer to that original. Do it again and they get closer still. You start wide, across very different aesthetics, and dig down until you are making the smallest refinements. That makes it a tool for ideation, not just generation.",
          ],
          did: [
            "Our squad built Flow State end to end. As frontend tech lead I set the direction for the frontend and led the engineers who built it: the prompt and style controls, the scrolling image stream, More Like This, the stages that let you step back to an earlier point, and saving images to your Library.",
            "Two constraints shaped the frontend. It had to feel instant, with new options arriving in under five seconds. And every image that appears costs the user a token, so images are generated as you scroll rather than far ahead of you.",
            "It was a TypeScript and React app on Next.js, rendered entirely on the client, talking to the backend over GraphQL. The state was the hard part: images generating as you scroll, a trail of stages as you dig into an image, and prompt or style changes that restart the stream. We modelled it as a state machine in XState, so every state and every transition between them was explicit.",
          ],
          outcome: [
            "Flow State launched in December 2024 for free and paid users. It sits on Leonardo's home page next to the main prompt bar, and Leonardo's founder pointed to its speed when talking about the product in the press.",
          ],
        },
      },
      {
        slug: "blueprints",
        title: "Blueprints",
        kind: "build",
        blurb:
          "Ready-made AI workflows that turn a few simple inputs into a finished result, with no prompt writing.",
        stack: ["React", "Next.js", "Server-side rendering", "GraphQL", "Apollo Client", "Node.js", "React Hook Form"],
        images: [
          {
            src: blueprintsCatalogue,
            alt: "The Blueprints catalogue: a search bar, audience filters, and an Ideate row with Consistent Character, Storyboard Sheet, Product Photography, Brand Mockup and Style Exploration.",
            caption: "The catalogue, filtered by audience and grouped by what you want to do.",
          },
          {
            src: blueprintsSteps,
            alt: "The Product Photography Blueprint open in a modal: a preview image on the left and a four-step flow on the right, starting with uploading a product image.",
            caption: "Each Blueprint is a few guided steps. Product Photography starts with your product image.",
          },
        ],
        body: {
          context: [
            "Getting a professional result out of generative AI usually means knowing which model to pick, how to write the prompt and which settings to tune. Most creators and marketers just want the product shot, the brand kit or the short video.",
            "A Blueprint packages all of that into one workflow. You pick one, answer a few guided steps, such as uploading a product photo and choosing a scene, and press Generate. Each Blueprint shows what it will make and what it costs before you run it.",
          ],
          did: [
            "Our squad built Blueprints. As frontend tech lead I led the frontend: the catalogue with its categories and search, the guided input steps, and the results view that hands outputs to the inline editor for further changes.",
            "Each Blueprint asks for different inputs and returns images, video or both, so the frontend could not be a set of one-off pages. It had to handle every Blueprint in the catalogue, including ones that did not exist yet.",
            "We built it in React and Next.js and leaned heavily on server-side rendering, so pages arrived already rendered. A Node backend served the frontend over GraphQL. Apollo's cache held the data from the server, React context held shared UI state, and React Hook Form ran the input forms.",
          ],
          outcome: [
            "Blueprints launched in November 2025 with Instant Brand Kit, Product Lifestyle Photoshoot and Instant Animate. The catalogue has since grown to dozens of workflows across ideation, creation, refining and motion, including Blueprints made by community creators.",
          ],
        },
      },
      {
        slug: "building-the-team",
        title: "Building the team",
        kind: "lead",
        blurb:
          "How the team became empowered and high performing while protecting work-life balance.",
        body: {
          context: [
            "Our squad built two of Leonardo's flagship features, Flow State and Blueprints. I was the frontend tech lead, leading a team of two mid-level and two senior engineers.",
          ],
          did: [
            "I split each feature into sections and gave every section an engineer to champion it. A champion leads their section and brings others in, rather than working on it alone.",
            "That gave each engineer a full loop of ownership. They ran the technical kickoff for their section, took open questions to our product and design counterparts, planned and split the work in Jira, and delivered it. After launch they kept watching their section for bugs and improvements.",
            "My job shifted from assigning tasks to coaching champions: helping them run their first kickoff, shape the plan and make the calls that were theirs to make.",
          ],
          outcome: [
            "We shipped both flagship features. By the end of my time there, one of the mid-level engineers had grown into a senior engineer.",
          ],
        },
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
