import { Reveal } from "@/components/motion/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <Reveal className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-strong">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {lead ? <p className="mt-4 text-lg text-muted">{lead}</p> : null}
    </Reveal>
  );
}
