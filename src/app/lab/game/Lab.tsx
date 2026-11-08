"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CareerGame } from "@/components/hero/game/CareerGame";
import type { Engine } from "@/components/hero/game/engine";
import { POSTCARD_P } from "@/components/hero/game/engine";
import { PALETTE } from "@/components/hero/game/palette";
import { ALL_FRAMES } from "@/components/hero/game/sprites/dulini";
import { raster } from "@/components/hero/game/sprites/raster";
import { BEAT_NAMES, STARTS, TOTAL, timeAt } from "@/components/hero/game/timeline";

function Sheet() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const z = 3;
    const per = 12;
    c.width = per * 34 * z;
    c.height = Math.ceil(ALL_FRAMES.length / per) * 36 * z;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ALL_FRAMES.forEach((f, i) =>
      ctx.drawImage(raster(f), (i % per) * 34 * z, (Math.floor(i / per) * 36 + 2) * z, f.w * z, f.h * z),
    );
  }, []);
  return <canvas ref={ref} style={{ background: PALETTE.s }} />;
}

const SIZES = [
  { w: 343, h: 352 },
  { w: 560, h: 600 },
];

export function Lab({ fallback }: { fallback: ReactNode }) {
  const engines = useRef<(Engine | null)[]>([null, null]);
  const [t, setT] = useState(0);
  const [calm, setCalm] = useState(false);
  const [held, setHeld] = useState(false);
  const [report, setReport] = useState("");
  const [onlyStatic, setOnlyStatic] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setT(Math.round(engines.current[1]?.time() ?? 0)), 200);
    return () => clearInterval(id);
  }, []);

  const seek = (v: number) => {
    setHeld(true);
    engines.current.forEach((e) => {
      e?.setHeld(true);
      e?.seek(v);
    });
    setT(v);
  };
  const play = () => {
    setHeld(false);
    engines.current.forEach((e) => e?.setHeld(false));
  };

  const measure = () => {
    const e = engines.current[1];
    if (!e) return;
    e.setHeld(true);
    setHeld(true);
    const n = Math.round(TOTAL / (1000 / 60));
    for (let i = 0; i < n; i++) e.seek(i * (1000 / 60));
    const s = e.stats().slice(-Math.min(600, n));
    // Re-run on the full loop and gather every timing.
    const all: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const t0 = performance.now();
      e.seek(i * (1000 / 60));
      all.push(performance.now() - t0);
    }
    all.sort((a, b) => a - b);
    const mean = all.reduce((a, b) => a + b, 0) / all.length;
    const p99 = all[Math.floor(all.length * 0.99)];
    setReport(`frames ${all.length}: mean ${mean.toFixed(3)} ms, p99 ${p99.toFixed(3)} ms, max ${all[all.length - 1].toFixed(3)} ms (engine stats sample ${s.length})`);
  };

  const colors = () => {
    const e = engines.current[1];
    if (!e) return;
    const allowed = new Set(Object.values(PALETTE).map((h) => h.toLowerCase()));
    const found = new Map<string, number>();
    for (let tt = 0; tt < TOTAL; tt += 125) {
      e.seek(tt);
      const b = e.buffer();
      const d = b.getContext("2d")!.getImageData(0, 0, b.width, b.height).data;
      for (let i = 0; i < d.length; i += 4) {
        const hex = "#" + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");
        if (d[i + 3] !== 255) found.set("alpha" + d[i + 3], (found.get("alpha" + d[i + 3]) ?? 0) + 1);
        else found.set(hex, (found.get(hex) ?? 0) + 1);
      }
    }
    const outside = [...found.keys()].filter((k) => !allowed.has(k));
    setReport(`colours used: ${found.size}; outside palette: ${outside.length ? outside.join(", ") : "none"}`);
  };

  return (
    <main style={{ padding: 16, display: "grid", gap: 12, fontFamily: "system-ui", fontSize: 13 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="range"
          min={0}
          max={TOTAL}
          step={10}
          value={t}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ width: 600 }}
          aria-label="time"
        />
        <span id="time">{(t / 1000).toFixed(2)} s</span>
        <button onClick={play} disabled={!held}>play</button>
        <label>
          <input type="checkbox" checked={calm} onChange={(e) => setCalm(e.target.checked)} /> reduced motion
        </label>
        <label>
          <input type="checkbox" checked={onlyStatic} onChange={(e) => setOnlyStatic(e.target.checked)} /> static SVG only
        </label>
        <button onClick={measure}>measure frames</button>
        <button onClick={colors}>count colours</button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {BEAT_NAMES.map((name, i) => (
          <button key={name} onClick={() => seek(timeAt(i, POSTCARD_P[i]))} data-beat={i}>
            {i} {name} ({(STARTS[i] / 1000).toFixed(1)})
          </button>
        ))}
      </div>
      <div id="report">{report}</div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {SIZES.map((s, i) => (
          <div key={i} style={{ width: s.w, height: s.h, position: "relative" }}>
            {onlyStatic ? (
              <div className="relative h-full w-full overflow-hidden rounded-card bg-sky [container-type:size]">{fallback}</div>
            ) : (
              <CareerGame
                active
                animate={!calm}
                fallback={fallback}
                onEngine={(e) => {
                  engines.current[i] = e;
                }}
              />
            )}
          </div>
        ))}
      </div>
      <Sheet />
    </main>
  );
}
