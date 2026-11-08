"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CareerGame } from "./game/CareerGame";
import { STORY } from "./game/story";

// Reduced motion, or a reduced-data preference, gets still postcards that cross-fade instead of the game.
const CALM_QUERY = "(prefers-reduced-motion: reduce), (prefers-reduced-data: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(CALM_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getAnimate = () => !window.matchMedia(CALM_QUERY).matches;
// Unknown on the server: show the server-rendered frame and decide after hydration.
const getServerAnimate = () => null;

/** `fallback` is the server-rendered first frame (`StaticFrame`), passed from the server component. */
export function HeroVisual({ fallback }: { fallback?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const animate = useSyncExternalStore<boolean | null>(subscribe, getAnimate, getServerAnimate);
  const [visible, setVisible] = useState(true);

  // Pause the game while the hero is scrolled out of view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      {/* The picture itself is hidden from screen readers (the list below tells the story); its sound button is not. */}
      <div ref={ref} className="relative min-h-0 flex-1">
        <CareerGame active={visible} animate={animate} fallback={fallback} />
      </div>
      <ol className="sr-only" aria-label="Career story">
        {STORY.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
