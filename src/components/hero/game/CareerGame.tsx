"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createEngine, type Engine } from "./engine";
import type { Sound } from "./sound";

/** Remembers a visitor who turned the sound off. */
const SOUND_KEY = "hero-game-sound";

const soundPrefOff = () => {
  try {
    return localStorage.getItem(SOUND_KEY) === "off";
  } catch {
    return false;
  }
};
const setSoundPref = (on: boolean) => {
  try {
    if (on) localStorage.removeItem(SOUND_KEY);
    else localStorage.setItem(SOUND_KEY, "off");
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
};

/**
 * The hero's career story as a looping pixel-art cutscene. `animate` is null until the motion preference is
 * known on the client; until then (and without JavaScript) the server-rendered `fallback` frame shows.
 * `animate` false gives the reduced-motion postcards (silent).
 *
 * Sound effects are on by default (there is no background music), but browsers only allow them after the visitor's first click or key
 * press, so they start then. The speaker button turns them off or on, and the choice is remembered.
 */
export function CareerGame({
  active,
  animate,
  fallback,
}: {
  active: boolean;
  animate: boolean | null;
  fallback?: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeRef = useRef(active);
  const engineRef = useRef<Engine | null>(null);
  const soundRef = useRef<Sound | null>(null);
  const loadingRef = useRef(false);
  const [soundOn, setSoundOn] = useState(false);

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
    if (animate && soundRef.current) engine?.setSound(soundRef.current);
    // Development only: lets the browser console seek the story (window.__careerGame.seek(ms)).
    if (process.env.NODE_ENV !== "production") (window as unknown as { __careerGame?: Engine | null }).__careerGame = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [animate]);

  /** Start (or unmute) the sound. Must run inside a click or key press: that is what unlocks audio. */
  function startSound() {
    if (soundRef.current) {
      soundRef.current.setMuted(false);
      setSoundOn(true);
      return;
    }
    if (loadingRef.current) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    loadingRef.current = true;
    const ctx = new AC();
    void ctx.resume();
    import("./sound").then(({ createSound }) => {
      if (!wrapRef.current) {
        void ctx.close();
        return;
      }
      const sound = createSound(ctx);
      soundRef.current = sound;
      engineRef.current?.setSound(sound);
      setSoundOn(true);
    });
  }

  // Sound is on by default: begin at the visitor's first click or key press anywhere (not on the button itself,
  // which handles its own clicks), unless they turned it off on an earlier visit.
  useEffect(() => {
    if (animate !== true || soundPrefOff()) return;
    const onGesture = (e: Event) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      remove();
      startSound();
    };
    const events = ["click", "keydown", "touchend"] as const;
    const remove = () => events.forEach((t) => window.removeEventListener(t, onGesture, true));
    events.forEach((t) => window.addEventListener(t, onGesture, true));
    return remove;
  }, [animate]);

  useEffect(
    () => () => {
      soundRef.current?.dispose();
      soundRef.current = null;
    },
    [],
  );

  function toggleSound() {
    if (soundOn) {
      soundRef.current?.setMuted(true);
      setSoundOn(false);
      setSoundPref(false);
    } else {
      setSoundPref(true);
      startSound();
    }
  }

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden rounded-card bg-sky [container-type:size]">
      <div ref={staticRef} aria-hidden className="absolute inset-0">
        {fallback}
      </div>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      {animate === true && (
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          title={soundOn ? "Sound off" : "Sound on"}
          className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
        >
          {soundOn ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        </button>
      )}
    </div>
  );
}
