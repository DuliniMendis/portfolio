import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  default: "border-border bg-surface text-muted",
  /** On a dark brand colour: white text on a translucent white pill. */
  light: "border-white/45 bg-white/15 text-white",
  /** On a light brand colour: ink text on a translucent white pill. */
  dark: "border-ink/25 bg-white/45 text-ink",
};

export function Tag({ children, tone = "default" }: { children: ReactNode; tone?: keyof typeof TONES }) {
  return (
    <span className={cn("inline-block rounded-full border px-3 py-1 text-xs font-medium", TONES[tone])}>
      {children}
    </span>
  );
}
