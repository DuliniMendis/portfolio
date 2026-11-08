"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Model } from "./Model";

type SceneProps = {
  /** Render loop runs only while the hero is on screen. */
  active: boolean;
  animate: boolean;
  tilt: boolean;
};

export default function Scene({ active, animate, tilt }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 12.5], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      frameloop={active ? (animate || tilt ? "always" : "demand") : "never"}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[4, 5, 6]} intensity={1.9} color="#fff4e6" />
      <pointLight position={[-5, -2, 3]} intensity={18} color="#056c95" />
      {/* Local studio lights for reflections; no HDR download. */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} color="#ffd9b0" position={[3, 3, 4]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#7fc4e0" position={[-4, 0, 3]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 4, -3]} scale={4} />
      </Environment>
      <Model animate={animate} tilt={tilt} />
    </Canvas>
  );
}
