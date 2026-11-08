"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createEngine, type Engine } from "./engine";

/**
 * The hero's career story as a looping pixel-art cutscene. `animate` is null until the motion preference is
 * known on the client; until then (and without JavaScript) the server-rendered `fallback` frame shows.
 * `animate` false gives the reduced-motion postcards.
 */
export function CareerGame({
  active,
  animate,
  fallback,
  onEngine,
}: {
  active: boolean;
  animate: boolean | null;
  fallback?: ReactNode;
  /** Lab only: receives the engine for the scrubber and timings. */
  onEngine?: (engine: Engine | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const engineRef = useRef<Engine | null>(null);
  const onEngineRef = useRef(onEngine);

  useEffect(() => {
    onEngineRef.current = onEngine;
  }, [onEngine]);

  useEffect(() => {
    activeRef.current = active;
    engineRef.current?.wake();
  }, [active]);

  useEffect(() => {
    if (animate === null) return;
    const engine = createEngine({
      wrap: wrapRef.current!,
      canvas: canvasRef.current!,
      staticEl: staticRef.current,
      animate,
      isActive: () => activeRef.current,
    });
    engineRef.current = engine;
    onEngineRef.current?.(engine);
    return () => {
      engine?.destroy();
      engineRef.current = null;
      onEngineRef.current?.(null);
    };
  }, [animate]);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden rounded-card bg-sky [container-type:size]">
      <div ref={staticRef} className="absolute inset-0">
        {fallback}
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
