"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "@/lib/world";

/**
 * The comet + guestbook system. A ring buffer of short-lived particles:
 *  - mode 0: comet dust streaming off the cursor, sized by velocity
 *  - mode 1: visitor "marks" — drawn strokes that hold in place,
 *    then burst outward into the void
 */

const COUNT = 6000;
const HOLD = 2.2; // seconds a mark holds before bursting

const VERT = /* glsl */ `
uniform float uNow;
uniform float uPixelRatio;
attribute vec3 aPos0;
attribute vec3 aVel;
attribute float aBirth;
attribute float aLife;
attribute float aMode;
attribute float aRand;
varying float vFade;
varying float vMode;
varying float vRand;

void main() {
  float age = uNow - aBirth;
  float alive = step(0.0, age) * step(age, aLife);

  vec3 pos;
  float fade;
  if (aMode < 0.5) {
    // comet dust: drift + slight gravity curl, quick fade
    float t = age;
    pos = aPos0 + aVel * t + vec3(0.0, -0.25 * t * t, 0.0);
    fade = 1.0 - age / aLife;
    fade *= fade;
  } else {
    // mark: hold perfectly still, shimmer, then burst
    float tb = max(age - ${HOLD.toFixed(1)}, 0.0);
    float ease = (1.0 - exp(-tb * 1.4)) / 1.4;
    pos = aPos0 + aVel * ease * 2.4 + vec3(0.0, tb * 0.35, 0.0);
    pos += vec3(
      sin(uNow * 3.0 + aRand * 40.0),
      cos(uNow * 2.6 + aRand * 31.0),
      sin(uNow * 2.2 + aRand * 57.0)
    ) * 0.012 * step(age, ${HOLD.toFixed(1)});
    float burstFade = 1.0 - clamp(tb / (aLife - ${HOLD.toFixed(1)}), 0.0, 1.0);
    fade = mix(1.0, burstFade * burstFade, step(${HOLD.toFixed(1)}, age));
  }

  vFade = fade * alive;
  vMode = aMode;
  vRand = aRand;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = mix(26.0, 34.0, aMode) * (0.4 + aRand * 1.2);
  // pop at the burst moment
  if (aMode > 0.5) {
    float tb = age - ${HOLD.toFixed(1)};
    size *= 1.0 + exp(-abs(tb) * 6.0) * 1.6;
  }
  gl_PointSize = size * uPixelRatio * vFade / max(-mv.z, 0.1) * alive;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uEmber;
uniform vec3 uBone;
varying float vFade;
varying float vMode;
varying float vRand;

void main() {
  if (vFade <= 0.001) discard;
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.06, d);
  vec3 col = mix(uEmber, uBone, smoothstep(0.2, 0.9, vRand));
  gl_FragColor = vec4(col * (1.0 + vFade * 0.6), alpha * vFade * 0.85);
}
`;

export default function Trail() {
  const gl = useThree((s) => s.gl);

  const { geometry, material, arrays } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const pos0 = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const birth = new Float32Array(COUNT).fill(-1000);
    const life = new Float32Array(COUNT).fill(1);
    const mode = new Float32Array(COUNT);
    const rand = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) rand[i] = Math.random();

    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    geometry.setAttribute("aPos0", new THREE.BufferAttribute(pos0, 3));
    geometry.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
    geometry.setAttribute("aBirth", new THREE.BufferAttribute(birth, 1));
    geometry.setAttribute("aLife", new THREE.BufferAttribute(life, 1));
    geometry.setAttribute("aMode", new THREE.BufferAttribute(mode, 1));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uNow: { value: 0 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uEmber: { value: new THREE.Color("#ff5c28") },
        uBone: { value: new THREE.Color("#ffe8d6") },
      },
    });
    return { geometry, material, arrays: { pos0, vel, birth, life, mode } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const head = useRef(0);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const cursor3 = useMemo(() => new THREE.Vector3(999, 999, 0), []);
  const prevCursor = useMemo(() => new THREE.Vector3(999, 999, 0), []);

  useFrame(({ camera, clock }, dt) => {
    const now = clock.elapsedTime;
    material.uniforms.uNow.value = now;
    if (world.reducedMotion) return;

    const delta = Math.min(dt, 0.05);
    const { pos0, vel, birth, life, mode } = arrays;
    let dirty = false;

    const spawn = (
      px: number, py: number, pz: number,
      vx: number, vy: number, vz: number,
      lifeS: number, m: number
    ) => {
      const i = head.current;
      pos0[i * 3] = px; pos0[i * 3 + 1] = py; pos0[i * 3 + 2] = pz;
      vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
      birth[i] = now;
      life[i] = lifeS;
      mode[i] = m;
      head.current = (i + 1) % COUNT;
      dirty = true;
    };

    // ---- comet dust off the cursor ----
    proj.set(world.mouse.x, world.mouse.y, 0.5).unproject(camera);
    proj.sub(camera.position).normalize();
    const t = -camera.position.z / (proj.z || -1);
    if (t > 0) {
      cursor3.copy(camera.position).addScaledVector(proj, t);
      const moved = cursor3.distanceTo(prevCursor);
      if (moved < 8) {
        const n = Math.min(Math.floor(world.mouseVel * 9 + (moved > 0.02 ? 1 : 0)), 8);
        for (let s = 0; s < n; s++) {
          const f = (s + 1) / n;
          spawn(
            THREE.MathUtils.lerp(prevCursor.x, cursor3.x, f) + (Math.random() - 0.5) * 0.06,
            THREE.MathUtils.lerp(prevCursor.y, cursor3.y, f) + (Math.random() - 0.5) * 0.06,
            (Math.random() - 0.5) * 0.06,
            (cursor3.x - prevCursor.x) * 1.6 / Math.max(delta * 60, 0.5) + (Math.random() - 0.5) * 0.5,
            (cursor3.y - prevCursor.y) * 1.6 / Math.max(delta * 60, 0.5) + (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            0.5 + Math.random() * 0.7,
            0
          );
        }
      }
      prevCursor.copy(cursor3);
    }

    // ---- visitor marks from the guestbook ----
    while (world.markQueue.length > 0) {
      const pts = world.markQueue.shift()!;
      // centroid for the radial burst
      let cx = 0, cy = 0;
      const n = pts.length / 3;
      for (let i = 0; i < n; i++) { cx += pts[i * 3]; cy += pts[i * 3 + 1]; }
      cx /= n; cy /= n;
      for (let i = 0; i < n; i++) {
        const px = pts[i * 3], py = pts[i * 3 + 1], pz = pts[i * 3 + 2];
        const dx = px - cx, dy = py - cy;
        const dl = Math.hypot(dx, dy) + 0.001;
        const sp = 1.2 + Math.random() * 2.2;
        spawn(
          px, py, pz,
          (dx / dl) * sp + (Math.random() - 0.5) * 1.4,
          (dy / dl) * sp + (Math.random() - 0.5) * 1.4 + 0.5,
          (Math.random() - 0.5) * 2.4,
          HOLD + 2.6 + Math.random() * 1.2,
          1
        );
      }
    }

    if (dirty) {
      (geometry.getAttribute("aPos0") as THREE.BufferAttribute).needsUpdate = true;
      (geometry.getAttribute("aVel") as THREE.BufferAttribute).needsUpdate = true;
      (geometry.getAttribute("aBirth") as THREE.BufferAttribute).needsUpdate = true;
      (geometry.getAttribute("aLife") as THREE.BufferAttribute).needsUpdate = true;
      (geometry.getAttribute("aMode") as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
