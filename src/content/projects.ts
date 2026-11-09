// Content model for projects. Copy marked TODO(dulini) is a draft to be confirmed.
import type { StaticImageData } from "next/image";
import blueprintsCatalogue from "./images/leonardo/blueprints-catalogue.jpg";
import blueprintsSteps from "./images/leonardo/blueprints-steps.jpg";
import flowStateStream from "./images/leonardo/flow-state-stream.jpg";
import generationHistory from "./images/leonardo/generation-history.jpg";
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
  /** News coverage that gives the work context, shown after the story. */
  press?: PressLink[];
};

export type PressLink = {
  title: string;
  publisher: string;
  date: string;
  href: string;
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
  /** One sentence for the home page card. The full summary stays on the project page. */
  teaser: string;
  /** Up to three section slugs shown as tags on the home page card, most important first. */
  featured: string[];
  /** The company's brand colours (one, or two for a gradient), used as a faded wash on cards. */
  brand: readonly string[];
  /** Roles held there, earliest first. Shown on the project page as a progression. */
  roles?: ProjectRole[];
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "seer-medical",
    name: "Seer Medical",
    role: "Founding engineer to Senior Engineering Manager",
    period: "Jul 2017 – Oct 2024",
    summary:
      "Seer moved week-long epilepsy monitoring out of hospital and into the home. I joined as one of its first software engineers and grew into leading its clinic and platform teams.",
    teaser:
      "Founding engineer, then leader of the clinic and platform teams, at the company that moved epilepsy monitoring from hospital to home.",
    featured: ["data-viewer", "live-monitoring", "leading-the-teams"],
    brand: ["#e40046"], // Seer Medical red, from its logo
    roles: [
      {
        title: "Software Engineer",
        period: "Jul 2017 – Oct 2018",
        note: "One of the founding members of the software team.",
      },
      {
        title: "Senior Software Engineer",
        period: "Oct 2018 – May 2020",
        note: "Built the Data Viewer, the live device interfaces and the clinic tools, from backend to frontend.",
      },
      {
        title: "Engineering Manager",
        period: "May 2020 – Mar 2023",
        note: "Hired the whole Seer-Clinic team and led it, three to five engineers, through onboarding, mentoring and planning. Promoted one engineer from mid-level to senior.",
      },
      {
        title: "Senior Engineering Manager",
        period: "Mar 2023 – Feb 2024",
        note: "Led the Seer-Clinic product team and two platform teams, API and DevOps, about 11 people in all, running cross-team projects and migrations.",
      },
      {
        title: "Staff Engineer",
        period: "Feb 2024 – Oct 2024",
        note: "When Seer scaled back, I went back to hands-on work, looking after the product and its integrations across the stack.",
      },
    ],
    sections: [
      {
        slug: "data-viewer",
        title: "Data Viewer",
        kind: "build",
        blurb:
          "Days of EEG, ECG and video from a patient's home, kept in sync in one view so clinicians can find the moments that matter.",
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
          ],
        },
      },
      {
        slug: "live-monitoring",
        title: "Live monitoring",
        kind: "build",
        blurb:
          "A real-time version of the Data Viewer that streams signals and video from a patient's Seer Sense while they're wearing it.",
        stack: ["React", "TypeScript", "GraphQL", "Node.js", "AWS"],
        body: {
          context: [
            "The Data Viewer worked on recordings after they had been uploaded. Seer's next step was to connect to devices in real time, so the team could see a patient's data while monitoring was still under way.",
          ],
          did: [
            "I built the live version of the viewer and the interfaces that talk to the Seer Sense in real time. Signals and video stream in from the patient's home as they are recorded, and the viewer keeps them in sync as they arrive.",
            "It builds on the review viewer, so clinicians work with the same traces, video panel and controls whether a study is live or finished.",
          ],
          outcome: [
            "Seer's support team used it to watch how each home study was going, remotely. If there was a problem with an electrode or the video, they could see it and get it fixed while the study was still running.",
            "Live monitoring of data quality was also a requirement for FDA approval.",
          ],
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
            "There was a Kanban board for referrals, so the team could see where each one was and move it along, and a calendar for bookings and equipment, so patients were booked against devices that were free.",
            "Clinicians, patients and admin staff used dynamic forms to add referrals, patient information and billing details. The forms were generated from definitions rather than built one by one, so each group got the form it needed.",
            "I also built integrations with Zendesk, Asset Panda and Mailchimp for managing equipment, bookings and communications, so the platform and those tools stayed in step.",
          ],
          outcome: [
            "These tools ran the day-to-day work of Seer's clinics. As an engineering manager I went on to lead the Seer-Clinic team that owned them.",
          ],
        },
      },
      {
        slug: "leading-the-teams",
        title: "Leading clinic and platform teams",
        kind: "lead",
        blurb:
          "Hiring Seer's clinic product team, then leading it alongside two platform teams, about 11 people in all, through growth and hard times.",
        body: {
          context: [
            "When I joined Seer in 2017, the whole company was about ten people. As it grew into a regulated medtech business running clinics across Australia, its software needed real teams around it, and those teams needed leading.",
            "I moved into engineering management in 2020, after three years building Seer's web app myself.",
          ],
          did: [
            "I hired the whole Seer-Clinic product team, the team that owned the tools Seer's clinics ran on, and sat on the hiring panel for more than ten engineers in all. I onboarded and trained the people who joined my teams, and kept mentoring them as they grew in their careers.",
            "I led the Seer-Clinic team for three years, with three to five engineers reporting to me. I owned the technical planning and ran delivery, and built a team culture that was efficient, inclusive and collaborative. I also stayed hands-on, shipping code as an equal member of the team.",
            "In 2023 I became senior engineering manager and took on Seer's two platform teams, API and DevOps, as well. That made about 11 reports across three teams. I led cross-team projects that delivered real business value and landed on time. I also drove the migrations to Next.js and PostGraphile and their adoption across other teams.",
            "It was a hard stretch for the company too. I learned how to guide teams through change, work through conflict, and keep things steady when much around them wasn't.",
          ],
          outcome: [
            "One engineer on my teams was promoted from mid-level to senior. The Seer-Clinic team I hired owned the tools that ran Seer's clinics day to day.",
            "When Seer scaled back in 2024, I went back to hands-on work as a staff engineer, looking after the product and its integrations across the stack.",
          ],
        },
      },
    ],
  },
  {
    slug: "leonardo-ai",
    name: "Leonardo.ai",
    role: "Frontend Tech Lead",
    period: "Oct 2024 – May 2026",
    summary:
      "I led the frontend for the squad behind two of Leonardo's biggest AI features, Flow State and Blueprints, and grew the team along the way. I also led work on performance, engineering standards and security.",
    teaser:
      "I led the frontend for Flow State and Blueprints, two of Leonardo's biggest AI features, and grew the team behind them.",
    featured: ["flow-state", "blueprints", "building-the-team"],
    brand: ["#7261f9", "#2b1e7a"], // Leonardo.Ai purple, sampled from its interface
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
            "I joined Leonardo partway through Flow State, and the project was pretty chaotic at that point. I got up to speed fast and drove it to launch. That meant fixing bugs, getting it out the door, and bringing calm and clarity to a project that badly needed it.",
            "Two things made it tricky. It had to feel instant, with new images showing up in under five seconds. And every image costs the user a token, Leonardo's credits, so the app can't race ahead and make hundreds of images nobody sees. Images are only made as you scroll towards them.",
            "Under the hood, it was a Next.js app written in TypeScript and React. It ran entirely in the browser (client-side rendering) and used GraphQL to talk to the backend. The hardest part was keeping track of everything happening at once: images loading as you scroll, the trail of steps as you dig into an image, and the stream starting over whenever you change the prompt or style.",
            "XState handled that by describing the feature as a state machine. Think of it as a map of every situation the screen can be in, and exactly how it gets from one to the next. With that many moving parts, having the map written down makes the feature far easier to reason about and to debug.",
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
        stack: ["TypeScript", "React", "Next.js", "Server-side rendering", "GraphQL", "Apollo Client", "Node.js", "React Hook Form"],
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
            "Under the hood, it's TypeScript, React and Next.js, leaning heavily on server-side rendering. That means pages are put together on the server and arrive ready to show, rather than assembling themselves in your browser. A Node backend talks to the frontend through GraphQL. Apollo's built-in cache kept track of data from the server, React context held state shared across the page, and the step-by-step forms ran on React Hook Form, a popular form library.",
          ],
          outcome: [
            "Blueprints launched in November 2025 with a big first batch, including Instant Brand Kit, Product Lifestyle Photoshoot and Instant Animate. The catalogue has kept growing since, from ideation tools to video, and now includes Blueprints made by people in Leonardo's creator community.",
          ],
        },
      },
      {
        slug: "generation-history",
        title: "Faster generation history",
        kind: "build",
        blurb:
          "Making generation history, where people go back to everything they've made, fast again, and untangling the React components behind it.",
        stack: ["React", "Next.js", "TypeScript"],
        images: [
          {
            src: generationHistory,
            alt: "Leonardo's generation history: two past prompts for illustrations of a fluffy cat, each with model, size and style tags, a How was this output? rating, and a row of four generated images, one set of orange cats and one of grey cats.",
            caption:
              "Every prompt you've run, with its settings and the images it made. Long histories like this are what had to stay fast.",
          },
        ],
        body: {
          context: [
            "Generation history is where Leonardo users go back to the images and videos they've made, and it had become slow.",
            "The code behind it was part of the problem. Over time its React components had grown tangled together, so a change in one place could ripple into others, and it was hard to see why the page was slow, let alone fix it.",
          ],
          did: [
            "I led the work to make generation history fast again.",
            "Alongside the performance fixes, we cleaned up the component hierarchy around it. We pulled apart components that knew too much about each other, so each one has a clear job and can change without breaking its neighbours.",
          ],
          outcome: [
            "Generation history got faster, and the code behind it is easier to understand and safer to change. That makes the next improvement to it cheaper too.",
          ],
        },
      },
      {
        slug: "building-the-team",
        title: "Building the team",
        kind: "lead",
        blurb:
          "How I empowered my engineers to own their work and grow into bigger roles, while still logging off on time.",
        body: {
          context: [
            "Our squad built two of Leonardo's biggest features, Flow State and Blueprints. I was the frontend tech lead, looking after four engineers: two mid-level and two senior.",
          ],
          did: [
            "Rather than handing out tickets, I split each feature into sections and gave every section a champion. That's one engineer who leads the piece and pulls others in to help.",
            "Being a champion meant owning it from start to finish. They ran the technical kickoff, took their questions to product and design, planned the work and broke it into tasks in Jira, and then delivered it. Once it shipped it was still theirs, so they kept an eye out for bugs and ways to make it better.",
            "My job changed too. I spent less time deciding who does what and more time coaching: guiding someone through their first kickoff, talking a plan through with them, and backing them on the calls that were theirs to make.",
          ],
          outcome: [
            "We shipped both features. And by the time I left, one of the mid-level engineers had grown into a senior engineer.",
          ],
        },
      },
      {
        slug: "engineering-standards",
        title: "Engineering standards",
        kind: "lead",
        blurb:
          "Clear frontend standards with dos and don'ts and real examples, taught through talks at the weekly knowledge share.",
        stack: ["React", "Next.js"],
        body: {
          context: [
            "When a team moves fast, everyone ends up solving the same problems in slightly different ways. The code gets harder to read, reviews turn into debates about style, and new people have no way of knowing which pattern is the right one to copy.",
          ],
          did: [
            "I set up engineering standards for the team to follow, built around React and Next.js best practice.",
            "Each standard came with clear dos and don'ts, and real examples of both, so it was obvious what good looked like rather than left to interpretation.",
            "I also walked people through them in talks at our weekly knowledge share, so people heard the reasons behind each standard and could ask about them, rather than just reading a document.",
          ],
          outcome: [
            "The standards caught on beyond my own team and were adopted across the company.",
          ],
        },
      },
      {
        slug: "secrets-in-aws",
        title: "Secrets in one place",
        kind: "lead",
        blurb:
          "Moving all our secrets into AWS, so that if there's ever a security breach, every one of them can be rotated from one place.",
        stack: ["AWS"],
        body: {
          context: [
            "Every app runs on secrets: API keys, tokens and passwords for the services it talks to. When there's a security breach, all of them have to be rotated, and fast.",
            "That's only quick if you know where every secret lives. When they're spread around, rotating them means hunting each one down, and it's easy to miss one.",
          ],
          did: [
            "I led the work to move all our secrets into AWS. A senior engineer reporting to me did the build.",
            "I owned the outcome: I oversaw the work and reviewed the solution, so it covered every secret we had and would hold up when we actually needed it.",
          ],
          outcome: [
            "All our secrets now live in one place in AWS. If there's ever a breach, they can be rotated from there, rather than tracked down one by one.",
          ],
        },
      },
      {
        slug: "security-updates",
        title: "Automatic security updates",
        kind: "lead",
        blurb:
          "Automating package updates whenever a security vulnerability is found, so fixes go in quickly instead of waiting for someone to notice.",
        body: {
          context: [
            "A modern web app depends on hundreds of open-source packages. When a security vulnerability turns up in one of them, the fix is usually a newer version of that package.",
            "Doing those updates by hand means someone has to spot the alert, find every place the package is used, update it and check nothing broke. It's easy for that to slip behind feature work, and the app stays exposed while it does.",
          ],
          did: [
            "I led a project to automate package updates whenever a security vulnerability is found. Another senior engineer reporting to me did the build.",
            "As with moving our secrets into AWS, I owned the outcome, supervising the work and reviewing the solution.",
          ],
          outcome: [
            "Security fixes to our packages now start automatically, rather than depending on someone noticing an alert and finding time for it.",
          ],
        },
      },
    ],
  },
  {
    slug: "canva",
    name: "Canva",
    role: "Engineering Manager",
    period: "May 2026 – Nov 2026",
    summary:
      "At Canva I led a team of seven backend and ML engineers on the platform behind Canva AI's design generation. I drove the work to halve the cost of one of its design generation methods and to move design generation from fixed pipelines to agent tools, and built tools like one-click bug reports to accelerate everyday work. Along the way I set up a few small AI automations for the team: a daily round-up, slides for regular meetings, and Jira updates for weekly reporting.",
    teaser:
      "I led seven backend and ML engineers on the platform behind Canva AI, and halved the cost of one of its design generation methods.",
    featured: ["cost-reduction", "pipelines-to-agent-tools", "one-click-bug-reports"],
    brand: ["#00c4cc", "#7d2ae8"], // Canva teal to purple, from its logo gradient
    sections: [
      {
        slug: "cost-reduction",
        title: "Cost reduction",
        kind: "build",
        blurb:
          "Halving the cost of Liberation, one of the ways Canva AI makes designs, by switching it to cheaper models and testing with real users that the designs were still good.",
        stack: ["LLM evals", "A/B testing", "Open-source models", "First-party models", "Frontier models"],
        body: {
          context: [
            "Canva AI can turn a prompt into a finished design, whether that's a presentation, an Instagram post or something else. I led engineering first in the design generation space, and then on the platform team that powers Canva AI.",
            "Liberation was one of the methods Canva used to generate those designs, and it ran on frontier models. They made great designs, but each one cost real money, and Canva AI was being used a lot. Cost turned into one of the biggest questions for the whole company. In 2026 Canva's founders said publicly that the cost of serving AI had forced them to slow its rollout and lower the year's revenue forecast.",
          ],
          did: [
            "I led the work to bring Liberation's costs down. The main lever was the model itself. Wherever it could do the job, we replaced an expensive frontier model with an open-source model, one of Canva's own first-party models, or a cheaper frontier model.",
            "A cheaper model only counts as a saving if the designs are still good. Every candidate went through evals first, which compared its output with the model it would replace. The ones that passed went into A/B tests with real user cohorts, so we could see whether people accepted the designs as readily as before.",
            "A lot of the work was coordination. I partnered with Canva's CORE research group, who trained the first-party models, and with outside vendors to get access to third-party models, and kept everyone moving towards the same goal.",
          ],
          outcome: [
            "We cut Liberation's costs by 50%. The evals and A/B tests showed design quality held up, so users got designs just as good for half the cost.",
            "Getting AI costs under control became one of Canva's top priorities. By August 2026 the company said it had cut the cost of serving an AI task by nearly 90%, by moving work onto its own and cheaper models and reviewing the economics of its AI tools every week. Moving Liberation onto cheaper models was part of that same effort.",
          ],
        },
        press: [
          {
            title: "AI was supposed to power Canva's next act. It also exposed software's most expensive problem",
            publisher: "Fortune",
            date: "12 Aug 2026",
            href: "https://fortune.com/2026/08/12/canva-startup-growth-ai-costs-revenue-forecast-by-third/",
          },
          {
            title: "Canva founder says AI costs down 90% after skyrocketing bills delayed product rollout",
            publisher: "Forbes Australia",
            date: "19 Aug 2026",
            href: "https://www.forbes.com.au/news/innovation/canva-founder-says-ai-costs-down-90-per-cent/",
          },
        ],
      },
      {
        slug: "one-click-bug-reports",
        title: "One-click bug reports",
        kind: "build",
        blurb:
          "A way for Canva staff to report a Canva AI bug with one click and a short description, with the traces and everything else needed to fix it captured automatically.",
        stack: ["Weights & Biases", "Langfuse", "Jira", "Slack"],
        body: {
          context: [
            "Canva's own staff use Canva AI every day, which makes them some of the best people to catch its bugs. But a useful AI bug report needs much more than a description: what was asked, what the AI did at each step, which models ran and what came back.",
            "Gathering all of that by hand takes time. So reports tend to arrive thin, or not at all, and engineers have to go back and ask for the missing pieces before they can start.",
          ],
          did: [
            "I drove a project to let internal staff report a Canva AI bug with one click and a short description of what went wrong.",
            "Everything else was captured automatically, saved and linked to the report. The AI traces, the step-by-step record of how a response was made, went to Weights & Biases and Langfuse, so engineers could see exactly what happened.",
            "Each report also created a Jira ticket for triage, and posted to Slack so engineers heard about new bugs straight away.",
          ],
          outcome: [
            "The goal was to turn reporting a bug from a chore into a click, so more problems got reported and each one arrived with what an engineer needed to start fixing it.",
            "We didn't get to roll it out. The project stopped when Canva made layoffs in November 2026.",
          ],
        },
      },
      {
        slug: "pipelines-to-agent-tools",
        title: "From pipelines to agent tools",
        kind: "lead",
        blurb:
          "Moving Canva's design generation from fixed pipelines to tools an AI agent can call, and retiring old pipelines without disrupting the Canva AI launches happening at the same time.",
        body: {
          context: [
            "Canva's design generation had grown up as a set of workflows: fixed pipelines that each took a request through the same steps to produce a design. As Canva AI moved to an agent, which decides for itself which tools to use, those pipelines no longer fit how the product worked.",
            "Many of them had also been overtaken. Newer design generation methods made better designs, but the older pipelines were still running, and plenty of internal teams still relied on them.",
          ],
          did: [
            "I led the project to move design generation from pipelines to agent tools. We went through the pipelines one by one. The one that still had a future was turned into tools the agent could call. The ones that newer methods had surpassed in quality were retired.",
            "Retiring them was mostly about people. Many internal teams were still using the older pipelines, so I partnered with each of them on how and when they would move off, and negotiated timelines we could all keep.",
            "The timing made it harder. Canva was launching different versions of Canva AI to different groups of users at the same time. Every deprecation had to land without disrupting any of those launches, and without breaking anything for users still on the older versions.",
          ],
          outcome: [
            "The pipeline worth keeping became three new tools in the tools service, ready for the agent to call. The ones newer methods had replaced were retired, and seven internal teams moved off them, leaving fewer old systems to keep running.",
          ],
        },
      },
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

/** The sections named in `featured`, in that order, for the home page card. */
export function featuredSections(project: Project): ProjectSection[] {
  return project.featured
    .map((slug) => getSection(project, slug))
    .filter((s): s is ProjectSection => Boolean(s));
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
