"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PaintStrokes } from "./PaintStrokes";
import { SKILLS } from "./skills";

// Reduced motion, or a reduced-data preference, gets the calm cross-fade instead of the drawing.
const CALM_QUERY = "(prefers-reduced-motion: reduce), (prefers-reduced-data: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(CALM_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getAnimate = () => !window.matchMedia(CALM_QUERY).matches;
// Unknown on the server: render the static stroke and decide after hydration.
const getServerAnimate = () => null;

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const animate = useSyncExternalStore<boolean | null>(subscribe, getAnimate, getServerAnimate);
  const [visible, setVisible] = useState(true);

  // Pause the painting while the hero is scrolled out of view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={ref} aria-hidden className="relative min-h-0 flex-1">
        <PaintStrokes active={visible} animate={animate} />
      </div>
      <ul className="sr-only" aria-label="Skills">
        {SKILLS.map((s) => (
          <li key={s.name}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}
