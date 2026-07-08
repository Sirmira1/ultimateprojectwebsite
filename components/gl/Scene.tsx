"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { world, CAMERA_KEYS, NUM_SHAPES } from "@/lib/world";
import Particles from "./Particles";
import Trail from "./Trail";

function CameraRig() {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }, dt) => {
    const delta = Math.min(dt, 0.05);
    const t = clock.elapsedTime;
    const blend = THREE.MathUtils.clamp(world.blend, 0, NUM_SHAPES - 1);
    const i0 = Math.min(Math.floor(blend), NUM_SHAPES - 1);
    const i1 = Math.min(i0 + 1, NUM_SHAPES - 1);
    const f = THREE.MathUtils.smoothstep(blend - i0, 0, 1);

    a.fromArray(CAMERA_KEYS[i0].pos);
    b.fromArray(CAMERA_KEYS[i1].pos);
    targetPos.lerpVectors(a, b, f);

    a.fromArray(CAMERA_KEYS[i0].look);
    b.fromArray(CAMERA_KEYS[i1].look);
    targetLook.lerpVectors(a, b, f);

    if (!world.reducedMotion) {
      // slow cinematic drift + cursor parallax
      targetPos.x += Math.sin(t * 0.11) * 0.22 + world.mouse.x * 0.55;
      targetPos.y += Math.cos(t * 0.13) * 0.18 + world.mouse.y * 0.35;
      targetLook.x += world.mouse.x * -0.2;
      targetLook.y += world.mouse.y * -0.12;
    }

    const k = 1 - Math.exp(-3.2 * delta);
    camera.position.lerp(targetPos, k);
    look.lerp(targetLook, k);
    camera.lookAt(look);
  });

  return null;
}

function PostFX() {
  const offset = useMemo(() => new THREE.Vector2(0.0007, 0.0004), []);
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.75} luminanceThreshold={0.12} luminanceSmoothing={0.4} mipmapBlur />
      <ChromaticAberration offset={offset} />
      <Vignette eskil={false} offset={0.28} darkness={0.72} />
    </EffectComposer>
  );
}

/** Pauses the render loop while the tab is scrolled far off / hidden is automatic via rAF. */
function Guard() {
  useThree(); // reserved for future adaptive quality
  return null;
}

export default function Scene() {
  const [dpr] = useState<[number, number]>(() => [1, 1.75]);
  const post = world.tier > 0 && !world.reducedMotion;

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ fov: 50, near: 0.1, far: 80, position: CAMERA_KEYS[0].pos }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
        }}
        onCreated={({ gl }) => gl.setClearColor("#08070b")}
      >
        <Suspense fallback={null}>
          <Particles />
          <Trail />
          <CameraRig />
          <Guard />
          {post && <PostFX />}
        </Suspense>
      </Canvas>
      {/* readability veil — keeps type legible over the brightest formations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,7,11,0.45)_100%)]" />
    </div>
  );
}
