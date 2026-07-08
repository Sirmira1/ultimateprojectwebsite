# THE OBSERVATORY — Nikola Anastasijević, Portfolio 2026

An interactive portfolio built as a single WebGL world: ~16,000 GPU particles
morph through eight formations (signature → galaxy → wave → torus knot → helix
→ vortex → chaos → portal ring) as you scroll, while a cinematic camera flies
between them.

The opening is a signature rite: a near-empty void where scrolling makes a pen
of light write the signature in particle dust (echoed by a faint SVG ink ghost)
before the site begins. The signature pen strokes live in `lib/signature.ts` —
swap the path strings there to use a real signature; everything else follows.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Stack

Next.js 15 · TypeScript · TailwindCSS 4 · React Three Fiber · custom GLSL ·
@react-three/postprocessing (bloom, chromatic aberration, vignette) ·
GSAP + ScrollTrigger · Lenis · Framer Motion · Web Audio (generative, no assets)

## Architecture

- `lib/world.ts` — mutable singleton bridging DOM ↔ WebGL (scroll blend, cursor,
  palettes, camera keyframes). Written at scroll/pointer frequency, read in
  `useFrame`; nothing re-renders on the hot path.
- `components/gl/Particles.tsx` — all seven formations baked into one RGBA-float
  DataTexture; a vertex shader morphs between rows with per-particle stagger,
  simplex turbulence, cursor repulsion and scroll-velocity smear.
- `components/gl/Scene.tsx` — camera rig lerping between per-section keyframes
  with drift + cursor parallax, plus the post-processing stack.
- `components/SmoothScroll.tsx` — Lenis → GSAP ticker → ScrollTrigger pipeline;
  computes the continuous section blend that drives morph, palette and camera.
- `components/sections/*` — each section has its own layout language; the lab
  is a GSAP-pinned horizontal scroll.
- `lib/audio.ts` — synthesized ambient drone + hover/click blips, off by default.

## Customize

- Content: `lib/data.ts` (projects, skills, career, experiments, email, socials).
- Colors per section: `SECTION_PALETTES` in `lib/world.ts`.
- Camera path: `CAMERA_KEYS` in `lib/world.ts`.
- Formations: `shapeFns` in `components/gl/Particles.tsx`.

## Notes

- Respects `prefers-reduced-motion` (no smooth-scroll hijack, static-calm field,
  no char animation), keyboard navigable, semantic sections.
- Particle count and post-processing degrade on coarse-pointer / low-memory
  devices (`world.tier`).
