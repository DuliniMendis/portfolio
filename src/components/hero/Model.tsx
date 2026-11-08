"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { QUALITIES } from "./qualities";

const PER_QUALITY = 7;
const COUNT = QUALITIES.length * PER_QUALITY;
const CYCLE = 11; // seconds for one scatter -> combine -> scatter loop
const MERGED_RADIUS = 1.1;
const MERGED_SCALE = 0.27;

type ModelProps = {
  /** Idle motion and the combine/distribute loop. False holds a static scattered pose. */
  animate: boolean;
  /** Tilt toward the pointer (fine pointers only). */
  tilt: boolean;
};

type Item = {
  colorIndex: number;
  orbit: number;
  speed: number;
  phase: number;
  y: number;
  size: number;
  delay: number;
  merged: THREE.Vector3;
};

// Small seeded PRNG so the layout is identical on every load.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
 * Forty-nine spheres in seven colours, one per quality. They drift on their own orbits,
 * stream together into a single ball, hold, then spread out again, on a loop.
 */
export function Model({ animate, tilt }: ModelProps) {
  const tiltGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const items = useMemo<Item[]>(() => {
    const rand = mulberry32(7);
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: COUNT }, (_, i) => {
      // Fibonacci sphere: the combined ball. Consecutive colours spiral around it.
      const yy = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - yy * yy);
      const th = i * golden;
      return {
        colorIndex: i % QUALITIES.length,
        orbit: 1.5 + rand() * 1.4,
        speed: (0.12 + rand() * 0.22) * (rand() < 0.5 ? -1 : 1),
        phase: rand() * Math.PI * 2,
        y: (rand() - 0.5) * 3.2,
        size: 0.13 + rand() * 0.15,
        delay: rand() * 0.3,
        merged: new THREE.Vector3(Math.cos(th) * r, yy, Math.sin(th) * r).multiplyScalar(MERGED_RADIUS),
      };
    });
  }, []);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new THREE.Color();
    items.forEach((it, i) => m.setColorAt(i, c.set(QUALITIES[it.colorIndex].color)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);

  useFrame((state, delta) => {
    const m = mesh.current;
    const spin = spinGroup.current;
    const tg = tiltGroup.current;
    if (!m || !spin || !tg) return;

    const t = animate ? state.clock.elapsedTime : 0;
    const merge = animate ? mergeAmount((t % CYCLE) / CYCLE) : 0;

    items.forEach((it, i) => {
      const local = easeInOut(clamp01(merge * 1.35 - it.delay));
      const a = it.phase + t * it.speed;
      const sx = Math.cos(a) * it.orbit;
      const sz = Math.sin(a) * it.orbit;
      const sy = it.y + Math.sin(t * 0.6 + it.phase) * 0.25;
      dummy.position.set(
        THREE.MathUtils.lerp(sx, it.merged.x, local),
        THREE.MathUtils.lerp(sy, it.merged.y, local),
        THREE.MathUtils.lerp(sz, it.merged.z, local),
      );
      dummy.scale.setScalar(THREE.MathUtils.lerp(it.size, MERGED_SCALE, local));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;

    const scroll = window.scrollY;
    const p = Math.min(scroll / Math.max(window.innerHeight, 1), 1);
    if (animate) spin.rotation.y += delta * 0.12;
    spin.rotation.z = p * 0.5;
    tg.scale.setScalar(THREE.MathUtils.lerp(tg.scale.x, 1 - p * 0.35, 0.1));
    if (tilt) {
      const { x, y } = state.pointer;
      tg.rotation.x = THREE.MathUtils.lerp(tg.rotation.x, -y * 0.25, 0.06);
      tg.rotation.y = THREE.MathUtils.lerp(tg.rotation.y, x * 0.35, 0.06);
    }
  });

  const body = (
    <group ref={tiltGroup} rotation={[0.15, 0, 0.1]}>
      <group ref={spinGroup}>
        <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshPhysicalMaterial
            roughness={0.3}
            metalness={0}
            clearcoat={0.7}
            clearcoatRoughness={0.2}
            envMapIntensity={0.45}
            toneMapped={false}
          />
        </instancedMesh>
      </group>
    </group>
  );

  return animate ? (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
      {body}
    </Float>
  ) : (
    body
  );
}
