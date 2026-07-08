"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIMENTS } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

function ExperimentCard({ e }: { e: (typeof EXPERIMENTS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);

  const tilt = (ev: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width - 0.5;
    const y = (ev.clientY - r.top) / r.height - 0.5;
    gsap.to(el, {
      rotateY: x * 10,
      rotateX: -y * 10,
      scale: 1.02,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 900,
    });
  };
  const untilt = () => {
    if (ref.current)
      gsap.to(ref.current, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.9, ease: "elastic.out(1,0.45)" });
  };

  return (
    <div
      ref={ref}
      onPointerMove={tilt}
      onPointerLeave={untilt}
      data-cursor="PLAY"
      className="group relative h-[58vh] w-[78vw] shrink-0 overflow-hidden rounded-sm border border-line will-change-transform sm:w-[46vw] lg:w-[30vw]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${e.gradient[1]}66, transparent 60%), radial-gradient(circle at 75% 80%, ${e.gradient[1]}33, transparent 55%), linear-gradient(155deg, ${e.gradient[0]}, #08070b 90%)`,
        }}
      />
      {/* drifting light bar */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-full inset-y-0 opacity-0 transition-opacity duration-500 group-hover:opacity-40"
        style={{
          background: `linear-gradient(105deg, transparent 45%, ${e.gradient[1]}88 50%, transparent 55%)`,
          animation: "marquee 3.2s linear infinite",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ink/70">
          <span>{e.index}</span>
          <span className="h-2 w-2 rounded-full transition-colors duration-300" style={{ background: e.gradient[1] }} />
        </div>
        <div>
          <h3 className="font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {e.title}
          </h3>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
            {e.medium}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Playground() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="lab"
      data-shape
      ref={sectionRef}
      aria-label="Creative experiments"
      className="relative overflow-hidden"
    >
      <div className={`flex h-[100svh] items-center ${reduced ? "overflow-x-auto" : ""}`}>
        <div ref={trackRef} className="flex w-max items-center gap-6 px-5 md:gap-10 md:px-10">
          {/* opening slate */}
          <div className="flex w-[80vw] shrink-0 flex-col justify-center gap-6 sm:w-[46vw] lg:w-[26vw]">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs tracking-[0.25em] text-ember">05</span>
              <span className="h-px w-12 bg-ink/20" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-dim">The lab</span>
            </div>
            <h2 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink md:text-6xl">
              BUILT
              <br />
              AT <span className="font-serif italic text-ember">2AM</span>
            </h2>
            <p className="max-w-xs font-mono text-xs leading-relaxed text-dim">
              Experiments with no client, no brief, no deadline. This is where
              the techniques in the real work are born.
            </p>
          </div>

          {EXPERIMENTS.map((e) => (
            <ExperimentCard key={e.index} e={e} />
          ))}

          {/* closing slate */}
          <div className="flex w-[60vw] shrink-0 items-center justify-center sm:w-[30vw]">
            <p className="max-w-[24ch] text-center font-serif text-2xl italic leading-snug text-dim">
              &ldquo;Every experiment is a question the browser answers.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
