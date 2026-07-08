"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "@/lib/world";
import { SIG_PATHS, SIG_VIEWBOX } from "@/lib/signature";
import { calmMode } from "@/lib/calm";

gsap.registerPlugin(ScrollTrigger);

/**
 * The opening rite. A near-empty void; scrolling makes a pen of light
 * write the signature in particle dust, echoed by a faint ink ghost.
 * The ghost dissolves as the particles leave for the galaxy.
 */
export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const beginRef = useRef<HTMLDivElement>(null);

  // fly through the signature for people who'd rather watch than scroll
  const begin = () => {
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo("#hero", {
        duration: 5,
        easing: (t: number) => 1 - Math.pow(1 - t, 2.2),
      });
    } else {
      document.querySelector("#hero")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const reduced = calmMode();
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    const lengths = paths.map((p) => p.getTotalLength());
    const total = lengths.reduce((a, b) => a + b, 0);
    // cumulative fraction range each stroke occupies in pen order
    const starts: number[] = [];
    let acc = 0;
    for (const len of lengths) {
      starts.push(acc / total);
      acc += len;
    }

    if (reduced) {
      world.sigDraw = 1;
      paths.forEach((p) => p.style.setProperty("stroke-dasharray", "none"));
      if (captionRef.current) captionRef.current.style.opacity = "1";
      return;
    }

    paths.forEach((p, i) => {
      p.style.strokeDasharray = `${lengths[i]}`;
      p.style.strokeDashoffset = `${lengths[i]}`;
    });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        const draw = gsap.utils.clamp(0, 1, (p - 0.05) / 0.62);
        world.sigDraw = draw;

        paths.forEach((el, i) => {
          const span = lengths[i] / total;
          const local = gsap.utils.clamp(0, 1, (draw - starts[i]) / span);
          el.style.strokeDashoffset = `${lengths[i] * (1 - local)}`;
        });

        // the ink ghost dissolves as the dust departs for the galaxy
        const fadeOut = 1 - gsap.utils.clamp(0, 1, (p - 0.84) / 0.12);
        svg.style.opacity = `${fadeOut}`;
        if (captionRef.current) {
          const fadeIn = gsap.utils.clamp(0, 1, (p - 0.68) / 0.12);
          captionRef.current.style.opacity = `${fadeIn * fadeOut}`;
        }

        // the begin button retires as soon as the visitor takes over
        if (beginRef.current) {
          const gone = p > 0.03;
          beginRef.current.style.opacity = gone ? "0" : "1";
          beginRef.current.style.pointerEvents = gone ? "none" : "auto";
        }
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section
      id="top"
      data-shape
      data-shape-anchor="0.82"
      ref={sectionRef}
      aria-label="Signature"
      className="relative h-[320vh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center px-5">
        {/* ink ghost — the particles write, this echoes */}
        <svg
          ref={svgRef}
          viewBox={SIG_VIEWBOX}
          className="w-[min(90vw,920px)]"
          aria-hidden="true"
        >
          {SIG_PATHS.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={p.ember ? "#ff5c28" : "#ece7df"}
              strokeWidth={p.ember ? 2 : 2.5}
              strokeLinecap="round"
              opacity={0}
            />
          ))}
        </svg>

        <div
          ref={captionRef}
          className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-dim opacity-0"
        >
          Nikola Anastasijević
          <span className="mx-3 text-ember">/</span>
          Hamilton, Ontario — Canada
        </div>

        <div
          ref={beginRef}
          className="absolute bottom-12 transition-opacity duration-700"
        >
          <button
            onClick={begin}
            data-cursor="GO"
            className="group flex flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-dim transition-colors hover:text-ink"
            aria-label="Begin — scrolls through the intro for you"
          >
            <span className="relative flex h-11 w-11 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-ink/25 transition-colors duration-300 group-hover:border-ember"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full border border-ember/40 [animation-duration:2.4s]"
              />
              <span aria-hidden="true" className="text-sm text-ember">↓</span>
            </span>
            Begin
          </button>
        </div>
      </div>
    </section>
  );
}
