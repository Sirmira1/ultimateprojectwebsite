/**
 * Shared mutable state bridging the DOM (scroll, cursor) and the WebGL scene.
 * A plain module singleton — written at scroll/pointer frequency, read inside
 * useFrame — so nothing re-renders on the hot path.
 */

export const SHAPES = [
  "signature",
  "hero",
  "about",
  "projects",
  "skills",
  "career",
  "playground",
  "contact",
] as const;

export type ShapeName = (typeof SHAPES)[number];

export const NUM_SHAPES = SHAPES.length;

/** Per-section particle palettes: [core color, edge color] as hex. */
export const SECTION_PALETTES: [string, string][] = [
  ["#ffd9c2", "#ece7df"], // signature — warm ink
  ["#ffb454", "#7c5cff"], // hero    — amber galaxy, violet rim
  ["#6ea8ff", "#dfe8ff"], // about   — cool tide
  ["#ff5c28", "#ffd9c2"], // projects — ember (overridden by hovered project)
  ["#3fd2c7", "#c3fff4"], // skills  — mint helix
  ["#c9a2ff", "#7c5cff"], // career  — violet ascent
  ["#ff6ad5", "#ffd166"], // playground — magenta/gold chaos
  ["#ff5c28", "#fff3ea"], // contact — portal
];

/** Particle field opacity per section — the world recedes while you read. */
export const SECTION_OPACITY = [1, 1, 0.7, 0.45, 0.4, 0.55, 0.75, 0.95];

/** Camera keyframes per section: position + lookAt. */
export const CAMERA_KEYS: { pos: [number, number, number]; look: [number, number, number] }[] = [
  { pos: [0, 0, 12.5], look: [0, 0, 0] },     // signature — dead-on, reverent
  { pos: [0, 0.6, 11.5], look: [0, 0, 0] },   // hero — front, slightly above
  { pos: [3.2, 2.0, 9.0], look: [0, -0.4, 0] }, // about — oblique over the wave
  { pos: [-1.6, 0.4, 10.5], look: [0, 0, 0] }, // projects — off-axis
  { pos: [4.2, 0.2, 7.5], look: [0, 0, 0] },   // skills — side of helix
  { pos: [0.4, 2.6, 9.5], look: [0, 0.6, 0] }, // career — looking up the stream
  { pos: [0, -0.8, 13.0], look: [0, 0, 0] },   // playground — pulled back
  { pos: [0, 0, 7.2], look: [0, 0, 0] },       // contact — flying into the ring
];

type WorldState = {
  /** continuous section index, 0..NUM_SHAPES-1, drives particle morph + camera */
  blend: number;
  /** overall page scroll 0..1 */
  scroll: number;
  /** lenis velocity (px/frame-ish), used for turbulence */
  scrollVel: number;
  /** pointer in NDC (-1..1), y up */
  mouse: { x: number; y: number };
  /** smoothed pointer speed 0..~1 */
  mouseVel: number;
  /** signature draw progress 0..1, scrubbed by the intro's scroll */
  sigDraw: number;
  /** accent override while hovering a project (hex) or null */
  accent: string | null;
  /** last click: NDC coords + timestamp (s) + power (1 = click, >1 = boom) */
  clickAt: { x: number; y: number; t: number; power: number };
  /** queued visitor-signature strokes (world-space xyz triplets) for the trail system */
  markQueue: Float32Array[];
  /** true once the preloader has finished revealing */
  started: boolean;
  reducedMotion: boolean;
  /** device tier: 0 = low, 1 = high */
  tier: number;
};

export const world: WorldState = {
  blend: 0,
  scroll: 0,
  scrollVel: 0,
  mouse: { x: 0, y: 0 },
  mouseVel: 0,
  sigDraw: 0,
  accent: null,
  clickAt: { x: 0, y: 0, t: -100, power: 0 },
  markQueue: [],
  started: false,
  reducedMotion: false,
  tier: 1,
};
