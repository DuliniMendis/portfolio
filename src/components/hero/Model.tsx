"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeGrainTexture, makeNameTexture } from "./clayTextures";
import { QUALITIES } from "./qualities";

const COUNT = QUALITIES.length; // 7
const RADIUS = 0.9;
const CYCLE = 11; // seconds for one scatter -> combine -> scatter loop
const RING = 2.4; // scattered ring radius
const CLUSTER = 1.86; // touching cluster: one in the centre, six around it
const CENTER = COUNT - 1; // Humility sits at the heart of the cluster

type ModelProps = {
  /** Idle motion and the combine/distribute loop. False holds a static scattered pose. */
  animate: boolean;
  /** Tilt toward the pointer (fine pointers only). */
  tilt: boolean;
};

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0 = scattered, 1 = fully combined. Holds at both ends so each state can be read. */
function mergeAmount(c: number) {
  if (c < 0.27) return 0;
  if (c < 0.5) return easeInOut((c - 0.27) / 0.23);
  if (c < 0.68) return 1;
  if (c < 0.91) return 1 - easeInOut((c - 0.68) / 0.23);
  return 0;
}

/**
 * Seven matte clay spheres, one per quality, each lettered with its name. They drift
 * in a loose ring, draw together into a touching cluster, hold, then spread out again.
 * The spheres never rotate, so every name keeps facing the viewer.
 */
export function Model({ animate, tilt }: ModelProps) {
  const tiltGroup = useRef<THREE.Group>(null);
  const spheres = useRef<Array<THREE.Mesh | null>>([]);
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const [grain, setGrain] = useState<THREE.Texture | null>(null);

  // Textures are painted client-side once fonts are ready, so names use the site font.
  useEffect(() => {
    let cancelled = false;
    const made: THREE.Texture[] = [];
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const family =
        getComputedStyle(document.documentElement).getPropertyValue("--font-inter-tight").trim() ||
        "system-ui, sans-serif";
      QUALITIES.forEach((q) => made.push(makeNameTexture(q.name, q.color, family)));
      const g = makeGrainTexture();
      made.push(g);
      setTextures(made.slice(0, COUNT));
      setGrain(g);
    });
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, []);

  const layout = useMemo(() => {
    return QUALITIES.map((_, i) => {
      // Scattered: evenly spaced on a ring, with a small depth bob per sphere.
      const ringAngle = (i / COUNT) * Math.PI * 2 + Math.PI / 2;
      // Combined: Humility in the middle, the other six on a hexagon around it.
      const k = i < CENTER ? i : 0;
      const hexAngle = (k / (COUNT - 1)) * Math.PI * 2 + Math.PI / 2;
      const merged =
        i === CENTER
          ? new THREE.Vector3(0, 0, 0)
          : new THREE.Vector3(Math.cos(hexAngle) * CLUSTER, Math.sin(hexAngle) * CLUSTER, 0);
      return {
        ringAngle,
        merged,
        delay: ((i * 37) % 7) / 7 * 0.25,
        phase: i * 1.3,
        size: 0.86 + ((i * 53) % 5) * 0.03,
      };
    });
  }, []);

  useFrame((state) => {
    const tg = tiltGroup.current;
    if (!tg) return;

    const t = animate ? state.clock.elapsedTime : 0;
    const merge = animate ? mergeAmount((t % CYCLE) / CYCLE) : 0;
    const swirl = t * 0.12; // the whole ring turns slowly, in the plane facing the viewer

    layout.forEach((it, i) => {
      const mesh = spheres.current[i];
      if (!mesh) return;
      const local = easeInOut(clamp01(merge * 1.35 - it.delay));
      const a = it.ringAngle + swirl;
      const r = RING + Math.sin(t * 0.5 + it.phase) * 0.15;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r;
      const sz = Math.sin(t * 0.4 + it.phase) * 0.45;
      mesh.position.set(
        THREE.MathUtils.lerp(sx, it.merged.x, local),
        THREE.MathUtils.lerp(sy, it.merged.y, local),
        THREE.MathUtils.lerp(sz, it.merged.z, local),
      );
      mesh.scale.setScalar(THREE.MathUtils.lerp(it.size, 1.0, local));
    });

    // Fit the whole arrangement to narrow canvases, and shrink it as the hero scrolls away.
    const fit = THREE.MathUtils.clamp(state.viewport.width / 7.4, 0.55, 1);
    const p = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    const target = fit * (1 - p * 0.35);
    tg.scale.setScalar(THREE.MathUtils.lerp(tg.scale.x, target, 0.1));

    if (tilt) {
      const { x, y } = state.pointer;
      tg.rotation.x = THREE.MathUtils.lerp(tg.rotation.x, -y * 0.18, 0.06);
      tg.rotation.y = THREE.MathUtils.lerp(tg.rotation.y, x * 0.25, 0.06);
    }
  });

  const body = (
    <group ref={tiltGroup}>
      {QUALITIES.map((q, i) => (
        <mesh
          key={q.name}
          ref={(m) => {
            spheres.current[i] = m;
          }}
        >
          <sphereGeometry args={[RADIUS, 64, 64]} />
          <meshStandardMaterial
            // A new key forces a fresh material when textures arrive (three.js does not
            // recompile when `map` goes from null to a texture).
            key={textures ? "painted" : "plain"}
            // Until the painted texture is ready the sphere is a plain colour.
            color={textures ? "#ffffff" : q.color}
            map={textures?.[i] ?? null}
            bumpMap={grain}
            bumpScale={1.2}
            roughness={0.94}
            metalness={0}
            envMapIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );

  return animate ? (
    <Float speed={1.1} rotationIntensity={0} floatIntensity={0.35}>
      {body}
    </Float>
  ) : (
    body
  );
}
