"use client";

import { useEffect, useRef } from "react";
import { ALL_FRAMES, WALK } from "@/components/hero/game/sprites/dulini";
import { raster } from "@/components/hero/game/sprites/raster";
import { PALETTE } from "@/components/hero/game/palette";

function Sheet() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const z = Number(new URLSearchParams(location.search).get("z") ?? 4);
    c.width = ALL_FRAMES.length * 28 * z;
    c.height = 36 * z;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ALL_FRAMES.forEach((f, i) => ctx.drawImage(raster(f), i * 28 * z, 2 * z, f.w * z, f.h * z));
  }, []);
  return <canvas ref={ref} style={{ background: PALETTE.s }} />;
}

function Walker({ w, h, scale }: { w: number; h: number; scale: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr;
    c.height = h * dpr;
    const lw = Math.ceil(w / scale);
    const lh = Math.ceil(h / scale);
    const buf = document.createElement("canvas");
    buf.width = lw;
    buf.height = lh;
    const b = buf.getContext("2d")!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const start = performance.now();
    const sky = [PALETTE.s, PALETTE.a, PALETTE.b];
    const tick = (now: number) => {
      const t = now - start;
      // sky bands
      const groundY = lh - 28;
      const band = Math.ceil(groundY / sky.length);
      sky.forEach((col, i) => {
        b.fillStyle = col;
        b.fillRect(0, i * band, lw, band);
      });
      // ground
      b.fillStyle = PALETTE.y;
      b.fillRect(0, groundY, lw, lh - groundY);
      b.fillStyle = PALETTE.k;
      b.fillRect(0, groundY, lw, 1);
      const off = Math.floor(t / 1000 * 40) % 8;
      b.fillStyle = PALETTE.Y;
      for (let x = -off; x < lw; x += 8) b.fillRect(x, groundY + 4, 3, 1);
      for (let x = -off + 4; x < lw; x += 8) b.fillRect(x, groundY + 9, 2, 1);
      const f = WALK[Math.floor(t / 130) % 4];
      b.drawImage(raster(f), Math.floor(lw / 2 - 12), groundY - 32);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, lw * scale * dpr, lh * scale * dpr);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [w, h, scale]);
  return <canvas ref={ref} style={{ width: w, height: h, border: "1px solid #dbe3e6" }} />;
}

export function Lab() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 24 }}>
      <Sheet />
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <Walker w={343} h={352} scale={2} />
        <Walker w={560} h={600} scale={3} />
      </div>
    </main>
  );
}
