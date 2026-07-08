"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { world, NUM_SHAPES, SECTION_PALETTES, SECTION_OPACITY } from "@/lib/world";
import { sampleSignature, signatureScale } from "@/lib/signature";
import { audio } from "@/lib/audio";

/* ------------------------------------------------------------------ */
/*  Shape generation — every section is a formation of the same        */
/*  particles, baked into one RGBA float texture (SIZE × SIZE rows     */
/*  per shape, stacked vertically).                                    */
/* ------------------------------------------------------------------ */

const gauss = () => Math.random() + Math.random() + Math.random() - 1.5;

type ShapeFn = (i: number, count: number, out: THREE.Vector3) => void;

const TILT = new THREE.Matrix4().makeRotationX(-0.42);

// shapes 1..N — shape 0 (the signature) is sampled from SVG pen paths
const shapeFns: ShapeFn[] = [
  // 1 — HERO: spiral galaxy, tilted toward the camera
  (i, count, out) => {
    const arm = i % 3;
    const t = Math.random();
    const r = Math.pow(t, 0.55) * 6.2;
    const angle = arm * ((Math.PI * 2) / 3) + r * 0.85 + gauss() * 0.22;
    out.set(
      Math.cos(angle) * r,
      gauss() * 0.34 * (1.15 - r / 7),
      Math.sin(angle) * r * 0.9
    );
    out.applyMatrix4(TILT);
  },
  // 1 — ABOUT: a slow ocean of sine waves
  (i, count, out) => {
    const cols = Math.ceil(Math.sqrt(count * 1.8));
    const rows = Math.ceil(count / cols);
    const cx = i % cols;
    const cz = Math.floor(i / cols);
    const x = (cx / cols - 0.5) * 15 + gauss() * 0.06;
    const z = (cz / rows - 0.5) * 8.5 + gauss() * 0.06;
    const y =
      Math.sin(x * 0.75) * 0.55 +
      Math.cos(z * 1.15 + x * 0.35) * 0.5 +
      gauss() * 0.05 -
      0.6;
    out.set(x, y, z);
  },
  // 2 — PROJECTS: a (2,3) torus knot, matter wound into craft
  (i, count, out) => {
    const u = (i / count) * Math.PI * 2;
    const p = 2, q = 3;
    const r = Math.cos(q * u) + 2;
    out.set(
      r * Math.cos(p * u) * 1.55,
      r * Math.sin(p * u) * 1.55,
      -Math.sin(q * u) * 1.55
    );
    out.x += gauss() * 0.14;
    out.y += gauss() * 0.14;
    out.z += gauss() * 0.14;
  },
  // 3 — SKILLS: double helix with rungs
  (i, count, out) => {
    const kind = i % 10;
    const t = i / count;
    const y = (t - 0.5) * 9.5;
    const angle = t * Math.PI * 7;
    if (kind < 4) {
      out.set(Math.cos(angle) * 1.7, y, Math.sin(angle) * 1.7);
    } else if (kind < 8) {
      out.set(Math.cos(angle + Math.PI) * 1.7, y, Math.sin(angle + Math.PI) * 1.7);
    } else {
      const s = Math.random() * 2 - 1;
      out.set(Math.cos(angle) * 1.7 * s, y, Math.sin(angle) * 1.7 * s);
    }
    out.x += gauss() * 0.09;
    out.y += gauss() * 0.09;
    out.z += gauss() * 0.09;
  },
  // 4 — CAREER: an ascending vortex — trajectory
  (i, count, out) => {
    const t = i / count;
    const y = (t - 0.5) * 10.5;
    const r = 0.45 + (y + 5.25) * 0.34 + gauss() * 0.28;
    const angle = y * 1.25 + gauss() * 0.35 + t * 40;
    out.set(Math.cos(angle) * r, y, Math.sin(angle) * r * 0.9);
  },
  // 5 — PLAYGROUND: clustered chaos
  (i, count, out) => {
    const cluster = i % 6;
    const ca = (cluster / 6) * Math.PI * 2;
    const cr = 2.6 + (cluster % 3) * 0.9;
    const cx = Math.cos(ca) * cr;
    const cy = Math.sin(ca * 2.3) * 1.9;
    const cz = Math.sin(ca) * cr * 0.7;
    out.set(cx + gauss() * 1.35, cy + gauss() * 1.35, cz + gauss() * 1.35);
  },
  // 6 — CONTACT: a portal ring, facing the viewer
  (i, count, out) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    const R = 2.7;
    const m = 0.16 + Math.pow(Math.random(), 3) * 0.55;
    out.set(
      Math.cos(theta) * (R + Math.cos(phi) * m),
      Math.sin(theta) * (R + Math.cos(phi) * m),
      Math.sin(phi) * m
    );
  },
];

function buildShapeTexture(size: number) {
  const count = size * size;
  const data = new Float32Array(count * NUM_SHAPES * 4);
  const v = new THREE.Vector3();

  // shape 0 — the signature, in pen order
  const sig = sampleSignature(count);
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    data[o] = sig[i * 3];
    data[o + 1] = sig[i * 3 + 1];
    data[o + 2] = sig[i * 3 + 2];
    data[o + 3] = 1;
  }

  for (let s = 1; s < NUM_SHAPES; s++) {
    const fn = shapeFns[s - 1];
    for (let i = 0; i < count; i++) {
      fn(i, count, v);
      const o = (s * count + i) * 4;
      data[o] = v.x;
      data[o + 1] = v.y;
      data[o + 2] = v.z;
      data[o + 3] = 1;
    }
  }
  const tex = new THREE.DataTexture(
    data,
    size,
    size * NUM_SHAPES,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Shaders                                                            */
/* ------------------------------------------------------------------ */

const NOISE = /* glsl */ `
// Simplex 3D noise — Ian McEwan / Ashima Arts (MIT)
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERT = /* glsl */ `
uniform sampler2D uShapes;
uniform float uBlend;
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uIntro;
uniform float uForce;
uniform float uVel;
uniform float uDraw;
uniform float uSigK;
uniform vec3 uMouse;
uniform vec3 uClickPos;
uniform float uClickTime;
uniform float uClickPower;
attribute vec2 aRef;
attribute float aRand;
attribute float aT;
varying float vRand;
varying float vGlow;
varying float vFade;

${NOISE}

void main() {
  float shapes = ${NUM_SHAPES}.0;
  float idx = floor(uBlend);
  float f = fract(uBlend);

  // per-particle stagger so formations dissolve rather than slide
  float t = clamp((f - aRand * 0.28) / 0.72, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  vec2 uvA = vec2(aRef.x, (aRef.y + idx) / shapes);
  vec2 uvB = vec2(aRef.x, (aRef.y + min(idx + 1.0, shapes - 1.0)) / shapes);
  vec3 pA = texture2D(uShapes, uvA).xyz;
  vec3 pB = texture2D(uShapes, uvB).xyz;

  // shape 0 is the signature: unwritten particles hang as loose dust,
  // a pen of light writes them onto the stroke as uDraw advances
  float sig = 1.0 - clamp(uBlend, 0.0, 1.0);
  vFade = 0.0;
  float tip = 0.0;
  if (sig > 0.001) {
    float drawn = 1.0 - smoothstep(uDraw - 0.002, uDraw + 0.014, aT);
    vec3 dust = pA + vec3(
      sin(aT * 913.7 + aRand * 17.0),
      cos(aT * 547.3 + aRand * 11.0),
      sin(aT * 311.9 + aRand * 23.0)
    ) * (1.3 + aRand * 3.2) * uSigK;
    pA = mix(dust, pA, drawn);
    vFade = sig * (1.0 - drawn);
    tip = exp(-abs(aT - uDraw) * 90.0) * sig
        * smoothstep(0.0, 0.02, uDraw)
        * (1.0 - smoothstep(0.97, 1.0, uDraw));
  }

  vec3 pos = mix(pA, pB, t);

  // idle breathing — the formation is never still
  float n1 = snoise(pos * 0.32 + uTime * 0.055);
  float n2 = snoise(pos.yzx * 0.38 - uTime * 0.045);
  float n3 = snoise(pos.zxy * 0.35 + uTime * 0.05);
  pos += vec3(n2, n3, n1) * 0.16;

  // turbulence while morphing between worlds
  float storm = sin(3.14159 * t) * (0.55 + uVel * 0.8);
  pos += vec3(n1, n2, n3) * storm;

  // scroll velocity smears the field vertically
  pos.y += uVel * aRand * 0.6;

  // cursor repulsion — a pressure wave in the field
  vec3 d = pos - uMouse;
  float force = exp(-dot(d, d) / 2.4) * uForce;
  pos += normalize(d + vec3(0.0001)) * force;

  // click shockwave — an expanding ring of displacement + light
  float ct = uTime - uClickTime;
  if (ct > 0.0 && ct < 2.5 && uClickPower > 0.0) {
    vec3 cd = pos - uClickPos;
    float cdist = length(cd);
    float ring = ct * 7.0;
    float band = exp(-pow(cdist - ring, 2.0) * 2.2);
    float decay = exp(-ct * 2.2) * uClickPower;
    pos += normalize(cd + vec3(0.0001)) * band * decay * 0.9;
    force += band * decay * 0.5;
  }

  // intro: particles fall in from a distant shell
  float ti = clamp((uIntro - aRand * 0.35) / 0.65, 0.0, 1.0);
  ti = 1.0 - pow(1.0 - ti, 3.0);
  vec3 shell = normalize(pos + vec3(0.001, 0.002, 0.001)) * (16.0 + aRand * 14.0);
  pos = mix(shell, pos, ti);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.5 + aRand * 1.6)
    * (1.0 + force * 1.2 + tip * 2.0)
    * (1.0 - vFade * 0.45)
    * mix(1.0, uSigK, sig)
    / max(-mv.z, 0.1);

  vRand = aRand;
  vGlow = force + tip * 2.2;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uOpacity;
varying float vRand;
varying float vGlow;
varying float vFade;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.08, d);
  float tw = 0.72 + 0.28 * sin(uTime * (0.8 + vRand * 2.6) + vRand * 43.7);
  vec3 col = mix(uColorB, uColorA, smoothstep(0.05, 0.95, vRand));
  col += vGlow * 0.9;
  float fade = mix(1.0, 0.14, vFade);
  gl_FragColor = vec4(col, alpha * tw * uOpacity * fade);
}
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Particles() {
  const gl = useThree((s) => s.gl);
  const size = world.tier > 0 ? 128 : 80;
  const count = size * size;

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3); // required by three, unused
    const refs = new Float32Array(count * 2);
    const rands = new Float32Array(count);
    const ts = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      refs[i * 2] = ((i % size) + 0.5) / size;
      refs[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
      rands[i] = Math.random();
      ts[i] = i / count; // pen-order progress along the signature
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aRef", new THREE.BufferAttribute(refs, 2));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(rands, 1));
    geometry.setAttribute("aT", new THREE.BufferAttribute(ts, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uShapes: { value: buildShapeTexture(size) },
        uBlend: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uSize: { value: 34 },
        uIntro: { value: 0 },
        uForce: { value: 0 },
        uVel: { value: 0 },
        uDraw: { value: 0 },
        uSigK: { value: signatureScale() },
        uMouse: { value: new THREE.Vector3(999, 999, 0) },
        uClickPos: { value: new THREE.Vector3(0, 0, 0) },
        uClickTime: { value: -100 },
        uClickPower: { value: 0 },
        uColorA: { value: new THREE.Color(SECTION_PALETTES[0][0]) },
        uColorB: { value: new THREE.Color(SECTION_PALETTES[0][1]) },
        uOpacity: { value: 1 },
      },
    });
    return { geometry, material };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const points = useRef<THREE.Points>(null);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);
  const tmpA = useMemo(() => new THREE.Color(), []);
  const tmpB = useMemo(() => new THREE.Color(), []);
  const mouse3 = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const lastClick = useRef(-100);
  const audioLvl = useRef(0);

  useFrame(({ camera, clock }, dt) => {
    const u = material.uniforms;
    const rm = world.reducedMotion;
    const delta = Math.min(dt, 0.05);

    u.uTime.value = rm ? clock.elapsedTime * 0.12 : clock.elapsedTime;

    // morph target follows scroll with a soft damp
    const k = 1 - Math.exp(-5.5 * delta);
    u.uBlend.value += (world.blend - u.uBlend.value) * k;

    // intro assembly
    if (world.started && u.uIntro.value < 1) {
      u.uIntro.value = Math.min(1, u.uIntro.value + delta / (rm ? 0.01 : 2.6));
    }

    // scroll velocity → turbulence (normalised, clamped)
    const vel = THREE.MathUtils.clamp(world.scrollVel / 40, -1.4, 1.4);
    u.uVel.value += (vel - u.uVel.value) * k;

    // the pen follows the intro's scrub closely
    const drawTarget = rm ? 1 : world.sigDraw;
    u.uDraw.value += (drawTarget - u.uDraw.value) * (1 - Math.exp(-8 * delta));

    // new click → project into world space and detonate
    if (!rm && world.clickAt.t !== lastClick.current) {
      lastClick.current = world.clickAt.t;
      proj.set(world.clickAt.x, world.clickAt.y, 0.5).unproject(camera);
      proj.sub(camera.position).normalize();
      const ct = -camera.position.z / (proj.z || -1);
      if (ct > 0) {
        (u.uClickPos.value as THREE.Vector3)
          .copy(camera.position)
          .addScaledVector(proj, ct);
        u.uClickTime.value = u.uTime.value;
        u.uClickPower.value = world.clickAt.power;
      }
    }

    // cursor in world space, projected onto the z=0 plane
    if (!rm) {
      proj.set(world.mouse.x, world.mouse.y, 0.5).unproject(camera);
      proj.sub(camera.position).normalize();
      const t = -camera.position.z / (proj.z || -1);
      if (t > 0) {
        mouse3.copy(camera.position).addScaledVector(proj, t);
        u.uMouse.value.lerp(mouse3, 1 - Math.exp(-9 * delta));
      }
      const targetForce = 0.35 + world.mouseVel * 2.4;
      u.uForce.value += (targetForce - u.uForce.value) * (1 - Math.exp(-4 * delta));
    } else {
      u.uForce.value = 0;
    }

    // palette follows the section blend; project hover overrides it
    const b = u.uBlend.value;
    const i0 = Math.min(Math.floor(b), NUM_SHAPES - 1);
    const i1 = Math.min(i0 + 1, NUM_SHAPES - 1);
    const f = b - i0;
    if (world.accent) {
      tmpA.set(world.accent);
      tmpB.set(world.accent).lerp(new THREE.Color("#ffffff"), 0.75);
    } else {
      tmpA.set(SECTION_PALETTES[i0][0]).lerp(colB.set(SECTION_PALETTES[i1][0]), f);
      tmpB.set(SECTION_PALETTES[i0][1]).lerp(colA.set(SECTION_PALETTES[i1][1]), f);
    }
    (u.uColorA.value as THREE.Color).lerp(tmpA, 1 - Math.exp(-3.5 * delta));
    (u.uColorB.value as THREE.Color).lerp(tmpB, 1 - Math.exp(-3.5 * delta));

    // the field recedes while you read, returns when the type thins out —
    // and when sound is on, it breathes with the drone
    audioLvl.current += (audio.level() - audioLvl.current) * (1 - Math.exp(-4 * delta));
    const targetOpacity =
      THREE.MathUtils.lerp(SECTION_OPACITY[i0], SECTION_OPACITY[i1], f) *
      (1 + audioLvl.current * 0.45);
    u.uOpacity.value += (targetOpacity - u.uOpacity.value) * (1 - Math.exp(-3 * delta));
    u.uSize.value = 34 * (1 + audioLvl.current * 0.18);
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
