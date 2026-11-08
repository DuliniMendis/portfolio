"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const PER_STRAND = 52;
// Each strand shades within its own hue (mixing orange into blue would go grey).
const ORANGE_LIGHT = new THREE.Color("#ffb468");
const ORANGE_DEEP = new THREE.Color("#e8681a");
const BLUE_LIGHT = new THREE.Color("#1aa3d6");
const BLUE_DEEP = new THREE.Color("#045a80");

type ModelProps = {
  /** Idle spin, float and pointer tilt. False renders a single static pose. */
  animate: boolean;
  /** Tilt toward the pointer (fine pointers only). */
  tilt: boolean;
};

/**
 * Two interleaved strands of spheres twisting around a spine. Sphere size follows a
 * wave envelope, so it reads as a signal. One strand is orange, the other blue.
 */
export function Model({ animate, tilt }: ModelProps) {
  const tiltGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const color = new THREE.Color();
    let i = 0;
    for (let strand = 0; strand < 2; strand++) {
      for (let k = 0; k < PER_STRAND; k++) {
        const t = k / (PER_STRAND - 1);
        const angle = t * Math.PI * 4 + strand * Math.PI;
        const radius = 1.2 + 0.22 * Math.sin(t * Math.PI * 6);
        const y = (t - 0.5) * 4.4;
        dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        const s = 0.1 + 0.17 * Math.abs(Math.sin(t * Math.PI * 3 + strand * 0.6));
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        if (strand === 0) color.copy(ORANGE_LIGHT).lerp(ORANGE_DEEP, t);
        else color.copy(BLUE_DEEP).lerp(BLUE_LIGHT, t);
        m.setColorAt(i, color);
        i++;
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [dummy]);

  useFrame((state, delta) => {
    const spin = spinGroup.current;
    const tg = tiltGroup.current;
    if (!spin || !tg) return;
    const scroll = typeof window === "undefined" ? 0 : window.scrollY;
    const p = Math.min(scroll / Math.max(window.innerHeight, 1), 1);
    if (animate) spin.rotation.y += delta * 0.25;
    // Scroll: extra twist and shrink as the hero leaves the viewport.
    spin.rotation.z = p * 0.6;
    const scale = 1 - p * 0.35;
    tg.scale.setScalar(THREE.MathUtils.lerp(tg.scale.x, scale, 0.1));
    if (tilt) {
      const { x, y } = state.pointer;
      tg.rotation.x = THREE.MathUtils.lerp(tg.rotation.x, -y * 0.25, 0.06);
      tg.rotation.y = THREE.MathUtils.lerp(tg.rotation.y, x * 0.35, 0.06);
    }
  });

  const body = (
    <group ref={tiltGroup} rotation={[0.15, 0, 0.2]}>
      <group ref={spinGroup}>
        <instancedMesh ref={mesh} args={[undefined, undefined, PER_STRAND * 2]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshPhysicalMaterial roughness={0.35} metalness={0} clearcoat={0.6} clearcoatRoughness={0.2} envMapIntensity={0.45} toneMapped={false} />
        </instancedMesh>
        {/* Spine: a deep blue core the strands wrap around. */}
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 4.6, 16]} />
          <meshStandardMaterial color="#033749" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );

  return animate ? (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
      {body}
    </Float>
  ) : (
    body
  );
}
