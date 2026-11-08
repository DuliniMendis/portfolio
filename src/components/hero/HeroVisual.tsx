"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { StaticOrb } from "./StaticOrb";

// The 3D code (three.js and friends) loads only on the client, after first paint.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <StaticOrb />,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [tilt, setTilt] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client capability detection
    setMode(hasWebGL() ? "webgl" : "fallback");
    setAnimate(!reduce);
    setTilt(!reduce && finePointer);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative flex h-full w-full items-center justify-center">
      {mode === "webgl" ? (
        <Scene active={visible} animate={animate} tilt={tilt} />
      ) : (
        <StaticOrb />
      )}
    </div>
  );
}
