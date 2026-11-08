"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeGrainTexture, makeNameTexture } from "./clayTextures";
import { makeMarbleTexture } from "./marbleTexture";
import { QUALITIES } from "./qualities";

const COUNT = QUALITIES.length; // 7
const RADIUS = 0.9;
const WHOLE_RADIUS = 1.35; // the single sphere the seven become
const CYCLE = 12; // seconds for one scatter -> merge -> break apart loop
const RING = 2.4; // scattered ring radius
const SQUEEZE = 0.4; // offset of each sphere from the centre while they press together

type ModelProps = {
  /** Idle motion and the merge/break loop. False holds a static scattered pose. */
  animate: boolean;
  /** Tilt toward the pointer (fine pointers only). */
  tilt: boolean;
};

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0 = seven apart, 1 = one sphere. Holds at both ends so each state can be read. */
function mergeAmount(c: number) {
  if (c < 0.22) return 0;
  if (c < 0.46) return easeInOut((c - 0.22) / 0.24);
  if (c < 0.66) return 1;
  if (c < 0.9) return 1 - easeInOut((c - 0.66) / 0.24);
  return 0;
}

/**
 * Seven matte clay spheres, one per quality, each lettered with its name. They drift in
 * a loose ring, press together, and become a single marbled sphere holding all seven
 * colours. Then it breaks back into seven. The seven never rotate, so names face the viewer.
 */
export function Model({ animate, tilt }: ModelProps) {
  const tiltGroup = useRef<THREE.Group>(null);
  const spheres = useRef<Array<THREE.Mesh | null>>([]);
  const whole = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const [marble, setMarble] = useState<THREE.Texture | null>(null);
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
      const names = QUALITIES.map((q) => makeNameTexture(q.name, q.color, family));
      const m = makeMarbleTexture();
      const g = makeGrainTexture();
      made.push(...names, m, g);
      setTextures(names);
      setMarble(m);
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
      // Pressed together: a tight hexagon around the centre. Small depth offsets keep
      // the overlapping surfaces from fighting each other.
      const k = i % (COUNT - 1);
      const hexAngle = (k / (COUNT - 1)) * Math.PI * 2 + Math.PI / 2;
      const squeeze =
        i === COUNT - 1
          ? new THREE.Vector3(0, 0, 0.1)
          : new THREE.Vector3(Math.cos(hexAngle) * SQUEEZE, Math.sin(hexAngle) * SQUEEZE, (k % 2 ? 1 : -1) * 0.08);
      return {
        ringAngle,
        squeeze,
        delay: (((i * 37) % 7) / 7) * 0.12,
        phase: i * 1.3,
        size: 0.86 + ((i * 53) % 5) * 0.03,
      };
    });
  }, []);

  useFrame((state, delta) => {
    const tg = tiltGroup.current;
    const w = whole.current;
    if (!tg || !w) return;

    const t = animate ? state.clock.elapsedTime : 0;
    const merge = animate ? mergeAmount((t % CYCLE) / CYCLE) : 0;
    const swirl = t * 0.12; // the ring turns slowly, in the plane facing the viewer

    // The seven fly together first, then shrink away inside the whole sphere as it grows.
    const shrink = Math.pow(clamp01((merge - 0.7) / 0.3), 2);

    layout.forEach((it, i) => {
      const mesh = spheres.current[i];
      if (!mesh) return;
      const local = easeInOut(clamp01((merge - it.delay) / 0.63));
      const a = it.ringAngle + swirl;
      const r = RING + Math.sin(t * 0.5 + it.phase) * 0.15;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r;
      const sz = Math.sin(t * 0.4 + it.phase) * 0.45;
      mesh.position.set(
        THREE.MathUtils.lerp(sx, it.squeeze.x, local),
        THREE.MathUtils.lerp(sy, it.squeeze.y, local),
        THREE.MathUtils.lerp(sz, it.squeeze.z, local),
      );
      const s = THREE.MathUtils.lerp(it.size, 0.95, local) * (1 - shrink);
      mesh.scale.setScalar(Math.max(s, 0.0001));
      mesh.visible = s > 0.002;
    });

    // The single sphere grows out of the middle of the pressed-together spheres.
    const grow = easeInOut(clamp01((merge - 0.6) / 0.4));
    w.scale.setScalar(Math.max(WHOLE_RADIUS * grow, 0.0001));
    w.visible = grow > 0.002;
    if (animate) w.rotation.y += delta * 0.35;

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

      {/* The one sphere: marbled clay holding all seven colours. Unit radius, scaled up. */}
      <mesh ref={whole} visible={false}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          key={marble ? "painted" : "plain"}
          color={marble ? "#ffffff" : "#c9b8a8"}
          map={marble}
          bumpMap={grain}
          bumpScale={1.2}
          roughness={0.94}
          metalness={0}
          envMapIntensity={0.35}
        />
      </mesh>
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
