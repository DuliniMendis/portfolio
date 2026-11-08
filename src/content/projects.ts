// Content model for projects. Copy marked TODO(dulini) is a draft to be confirmed.
import type { StaticImageData } from "next/image";
import blueprintsCatalogue from "./images/leonardo/blueprints-catalogue.jpg";
import blueprintsSteps from "./images/leonardo/blueprints-steps.jpg";
import flowStateStream from "./images/leonardo/flow-state-stream.jpg";
import seerDataViewer from "./images/seer/data-viewer.jpg";

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

export type ProjectRole = {
  title: string;
  period: string;
  note?: string;
};

export type Project = {
  slug: string;
  name: string;
  role: string;
  period: string;
  summary: string;
  /** Roles held there, earliest first. Shown on the project page as a progression. */
  roles?: ProjectRole[];
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "seer-medical",
    name: "Seer Medical",
    role: "Founding engineer to Senior Engineering Manager",
    period: "2017 – 2024",
    summary:
      "Seer moved week-long epilepsy monitoring out of hospital and into the home. I joined as one of its first software engineers and grew into leading its clinic and platform teams.",
    roles: [
      {
        title: "Software Engineer",
        period: "Jul 2017 – Oct 2018",
        note: "One of the founding members of the software team.",
      },
      {
        title: "Senior Software Engineer",
        period: "Oct 2018 – May 2020",
        note: "Built the Data Viewer, the live device interfaces and the clinic tools, backend to frontend.",
      },
      {
        title: "Engineering Manager",
        period: "May 2020 – Mar 2023",
        note: "Led the Seer-Clinic team of three to five engineers: hiring, onboarding, mentoring and planning.",
      },
      {
        title: "Senior Engineering Manager",
        period: "Mar 2023 – Feb 2024",
        note: "Led the Seer-Clinic product team and the Platform team, running cross-team projects and migrations.",
      },
      {
        title: "Staff Engineer",
        period: "Feb 2024 – Oct 2024",
        note: "When Seer scaled back, went back to hands-on work, maintaining the product and its integrations across the stack.",
      },
    ],
    sections: [
      {
        slug: "data-viewer",
        title: "Data Viewer",
        kind: "build",
        blurb:
          "Days of EEG, ECG and video from home monitoring in one synchronised view, so clinicians can find and judge events quickly.",
        stack: ["React", "TypeScript", "GraphQL", "Node.js", "PostgreSQL", "Python", "AWS"],
        images: [
          {
            src: seerDataViewer,
            alt: "The Seer Data Viewer: EEG and ECG traces across the screen with a highlighted region and a red time cursor, a video of the monitored room in a floating panel, a timeline of the study along the bottom, and window size, channel group, amplitude and filter controls on the right.",
            caption:
              "EEG and ECG traces with the video locked to the same moment. Window size, amplitude and filters on the right, the whole study on the timeline below.",
          },
        ],
        body: {
          context: [
            "Diagnosing epilepsy often depends on capturing a seizure on a recording. Traditionally that meant days in a hospital bed, wired to an EEG. Seer moved it home. Patients wear the Seer Sense, which records brain and heart activity for up to ten days, while a hub in the home records video.",
            "That leaves days of continuous signals and video for every patient. Clinicians have to move through all of it, find the abnormal moments, and check what the patient was doing at each one.",
          ],
          did: [
            "I was one of the founding members of Seer's software team, and I built the Data Viewer in the Seer Cloud web app, from the backend to the frontend.",
            "The viewer draws each EEG and ECG channel as a trace and keeps a video player locked to the same moment in the recording. Reviewers set the window size, amplitude and filters, switch between channel groups, and move through the whole study on a timeline. The video sits in a panel that can be moved, shrunk or expanded, so it never hides the signal they are reading.",
            "We built it with React and TypeScript, a Node and GraphQL API, PostgreSQL and Python, running on AWS.",
          ],
          outcome: [
            "The Data Viewer became the core of how Seer's clinical team reviewed studies, scanning EEG and ECG in sync with video at up to 40 times normal speed. Referring doctors used the same platform to see their patients' data and reports.",
            "In 2022 Seer Home received FDA clearance for diagnosing epilepsy through multi-day video-EEG-ECG monitoring.",
          ],
        },
      },
      {
        slug: "live-monitoring",
        title: "Live monitoring",
        kind: "build",
        blurb:
          "A real-time version of the Data Viewer that streams signals and video from a patient's Seer Sense while they are wearing it.",
        stack: ["React", "TypeScript", "GraphQL", "Node.js", "AWS"],
        body: {
          context: [
            "The Data Viewer worked on recordings after they had been uploaded. Seer's next step was to connect to devices in real time, so the team could see a patient's data while monitoring was still under way.",
          ],
          did: [
            "I built the live version of the viewer and the interfaces that talk to the Seer Sense in real time. Signals and video stream in from the patient's home as they are recorded, and the viewer keeps them in sync as they arrive.",
            "It builds on the review viewer, so clinicians work with the same traces, video panel and controls whether a study is live or finished.",
          ],
          outcome: ["TODO(dulini)"],
        },
      },
      {
        slug: "clinic-operations",
        title: "Clinic operations",
        kind: "build",
        blurb:
          "The tools that ran Seer's clinics: a referrals board, a bookings and equipment calendar, dynamic forms, and integrations with Zendesk, Asset Panda and Mailchimp.",
        stack: ["React", "TypeScript", "GraphQL", "Node.js", "PostgreSQL", "AWS"],
        body: {
          context: [
            "Every home study has a lot around it. A doctor sends a referral, the patient is booked in, a device and hub go out to their home, and patient and billing details have to be collected. Seer's clinics ran this for patients across Australia, and the team needed tools built for that workflow.",
          ],
          did: [
            "I built a set of operational tools into the Seer Cloud platform.",
            "A Kanban board for referrals, so the team could see where every referral was and move it along. A calendar for bookings and equipment, so patients were scheduled against the devices that were free.",
            "Dynamic forms that clinicians, patients and admin staff used to add referrals, patient information and billing details. The forms were generated from definitions rather than built one by one, so each group got the form it needed.",
            "Integrations with Zendesk, Asset Panda and Mailchimp for managing equipment, bookings and communications, so the platform and those tools stayed in step.",
          ],
          outcome: [
            "These tools ran the day-to-day work of Seer's clinics. As an engineering manager I went on to lead the Seer-Clinic team that owned them.",
          ],
        },
      },
    ],
  },
  {
    slug: "leonardo-ai",
    name: "Leonardo.ai",
    role: "Frontend Tech Lead",
    period: "TODO(dulini)",
    summary:
      "I led the frontend for the squad behind two of Leonardo's flagship AI features, Flow State and Blueprints, and grew the team along the way.",
    sections: [
      {
        slug: "flow-state",
        title: "Flow State",
        kind: "build",
        blurb:
          "Type a rough idea and scroll through an endless stream of images based on it. Made for exploring before you know exactly what you want.",
        stack: ["TypeScript", "React", "Next.js", "Client-side rendering", "GraphQL", "XState"],
        images: [
          {
            src: flowStateStream,
            alt: "Flow State: a prompt for a Japanese modernist interior above a grid of generated rooms, with Vibe, Lighting, Shot Type and Colour Theme controls on the left and a More Like This button on one image.",
            caption:
              "One prompt, and the images keep coming as you scroll. Style controls sit on the left, and every image has a More Like This button.",
          },
        ],
        body: {
          context: [
            "Most image generators expect you to already know what you want. You write a careful prompt, wait, and get back a handful of pictures. That's fine when you have a clear image in your head. When you're still figuring it out, it's slow going.",
            "Flow State works the other way round. You type a rough idea and start scrolling, and new images keep appearing almost as fast as you can scroll, each one a different take. Simple controls for vibe, lighting, camera angle and colour let you nudge the overall feel.",
            "When something catches your eye, you hit More Like This and the stream fills up with versions closer to that image. Do it again on one of those and you get closer still. You start broad, with wildly different looks, and keep narrowing until you're only fiddling with the small details. It's made for the messy early stage of a creative idea.",
          ],
          did: [
            "I joined Leonardo partway through Flow State, and the project was pretty chaotic at that point. I got up to speed fast and helped the squad finish it. That meant fixing bugs, getting it out the door, and bringing some calm and clarity to a project that badly needed it.",
            "Two things made it tricky. It had to feel instant, with new images showing up in under five seconds. And every image costs the user a token, Leonardo's credits, so the app can't race ahead and make hundreds of images nobody sees. Images are only made as you scroll towards them.",
            "Under the hood, it was a Next.js app written in TypeScript and React. It ran entirely in the browser (client-side rendering) and used GraphQL to talk to the backend. The hardest part was keeping track of everything happening at once: images loading as you scroll, the trail of steps as you dig into an image, and the stream starting over whenever you change the prompt or style. XState handled that by describing the feature as a state machine. Think of it as a map of every situation the screen can be in, and exactly how it gets from one to the next. With that many moving parts, having the map written down makes the feature far easier to reason about and to debug.",
          ],
          outcome: [
            "Flow State launched in December 2024 for everyone, free and paid. It sits on Leonardo's home page right next to the main prompt bar, and speed was the headline when Leonardo's founder talked about it in the press.",
          ],
        },
      },
      {
        slug: "blueprints",
        title: "Blueprints",
        kind: "build",
        blurb:
          "Ready-made AI recipes. Fill in a few simple steps and get a finished result, with no prompt writing needed.",
        stack: ["React", "Next.js", "Server-side rendering", "GraphQL", "Apollo Client", "Node.js", "React Hook Form"],
        images: [
          {
            src: blueprintsCatalogue,
            alt: "The Blueprints catalogue: a search bar, audience filters, and an Ideate row with Consistent Character, Storyboard Sheet, Product Photography, Brand Mockup and Style Exploration.",
            caption: "The catalogue. Filter by who you are, or browse by what you want to make.",
          },
          {
            src: blueprintsSteps,
            alt: "The Product Photography Blueprint open in a modal: a preview image on the left and a four-step flow on the right, starting with uploading a product image.",
            caption: "Each Blueprint walks you through a few steps. Product Photography starts by asking for a photo of your product.",
          },
        ],
        body: {
          context: [
            "Getting a really good result out of AI image tools usually takes know-how. Which model? What goes in the prompt? Which of the dozen settings actually matter? Most people, especially marketers and content creators, don't want to learn all that. They just want the product shot, the brand kit or the short video.",
            "A Blueprint does that homework for you. You pick one, follow a few guided steps, like uploading a product photo and choosing a scene, and hit Generate. Before you start, it tells you what you'll get and what it will cost.",
          ],
          did: [
            "Our squad built Blueprints, and I led the frontend, which is everything you see and click. That covers the catalogue with its filters and search, the step-by-step flow for your inputs, and the results screen, which hands your images to the editor if you want to keep tweaking.",
            "The big challenge was variety. One Blueprint wants a photo and a colour, another wants a story brief, and what comes back might be images, video or both. Building a custom page for each one would never keep up, so the frontend had to handle any Blueprint, including ones nobody had thought of yet.",
            "Under the hood, it's React and Next.js, leaning heavily on server-side rendering. That means pages are put together on the server and arrive ready to show, rather than assembling themselves in your browser. A Node backend talks to the frontend through GraphQL. Apollo's built-in cache kept track of data from the server, React context held state shared across the page, and the step-by-step forms ran on React Hook Form, a popular form library.",
          ],
          outcome: [
            "Blueprints launched in November 2025 with a big first batch, including Instant Brand Kit, Product Lifestyle Photoshoot and Instant Animate. The catalogue has kept growing since, from ideation tools to video, and now includes Blueprints made by people in Leonardo's creator community.",
          ],
        },
      },
      {
        slug: "building-the-team",
        title: "Building the team",
        kind: "lead",
        blurb:
          "How I helped my engineers own their work and grow into bigger roles, while still logging off on time.",
        body: {
          context: [
            "Our squad built two of Leonardo's biggest features, Flow State and Blueprints. I was the frontend tech lead, looking after four engineers: two mid-level and two senior.",
          ],
          did: [
            "Rather than handing out tickets, I split each feature into sections and gave every section a champion. That's one engineer who leads the piece and pulls others in to help.",
            "Being a champion meant owning it from start to finish. They ran the technical kickoff, took their questions to product and design, planned the work and broke it into tasks in Jira, and then delivered it. Once it shipped it was still theirs, so they kept an eye out for bugs and ways to make it better.",
            "My job changed too. I spent less time deciding who does what and more time coaching: helping someone through their first kickoff, talking a plan through with them, and backing them on the calls that were theirs to make.",
          ],
          outcome: [
            "We shipped both features. And by the time I left, one of the mid-level engineers had grown into a senior engineer.",
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
