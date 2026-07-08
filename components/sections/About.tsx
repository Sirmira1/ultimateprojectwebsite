"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealLines, Line, Rise, SectionLabel } from "@/components/ui/Split";

gsap.registerPlugin(ScrollTrigger);

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(value);
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: value,
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%" },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.v));
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value]);
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <span className="font-display text-4xl font-bold text-ink md:text-5xl">
        <span ref={ref}>0</span>
        <span className="text-ember">{suffix}</span>
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">{label}</span>
    </div>
  );
}

export default function About() {
  const cardRef = useRef<HTMLDivElement>(null);

  const tilt = (e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, {
      rotateY: x * 16,
      rotateX: -y * 16,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 700,
    });
  };
  const untilt = () => {
    if (cardRef.current)
      gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1,0.4)" });
  };

  return (
    <section
      id="about"
      data-shape
      aria-label="About"
      className="relative mx-auto max-w-[1400px] px-5 py-[22vh] md:px-10"
    >
      <div className="section-veil" aria-hidden="true" />
      <SectionLabel index="01" title="Who is behind this" />

      <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
        <RevealLines className="font-display text-[7.2vw] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[5vw] lg:text-[3.4vw]">
          <Line>I finish</Line>
          <Line>
            the <span className="font-serif italic text-ember">thing</span>.
          </Line>
          <Line className="mt-8 font-mono text-sm font-normal normal-case leading-relaxed tracking-normal text-dim lg:text-base">
            Nikola Anastasijević — software development student at Mohawk
          </Line>
          <Line className="font-mono text-sm font-normal leading-relaxed tracking-normal text-dim lg:text-base">
            College, co-op developer at MBPSD. I build web apps end-to-end
          </Line>
          <Line className="font-mono text-sm font-normal leading-relaxed tracking-normal text-dim lg:text-base">
            and actually ship them: rentals with real payments, apps with
          </Line>
          <Line className="font-mono text-sm font-normal leading-relaxed tracking-normal text-dim lg:text-base">
            real users, a bot with real money on the line. I learn by
          </Line>
          <Line className="font-mono text-sm font-normal leading-relaxed tracking-normal text-dim lg:text-base">
            shipping, not by watching tutorials.
          </Line>
        </RevealLines>

        <div className="flex flex-col gap-10">
          <Rise delay={0.15}>
            <div
              ref={cardRef}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              data-cursor="HELLO"
              className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-sm border border-line will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, #7c5cff55, transparent 55%), radial-gradient(circle at 75% 70%, #ff5c2855, transparent 50%), radial-gradient(circle at 55% 45%, #6ea8ff33, transparent 60%), #0c0a14",
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-2xl"
                style={{ background: "conic-gradient(from 0deg, #ff5c28, #7c5cff, #3fd2c7, #ff5c28)", animation: "spin-slow 9s linear infinite" }}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/70">
                <span>SELF-PORTRAIT</span>
                <span>RENDERED LIVE</span>
              </div>
            </div>
          </Rise>

          <Rise delay={0.25} className="flex flex-col gap-3 font-mono text-xs leading-relaxed tracking-wide text-dim">
            {[
              ["BASE", "Hamilton, Ontario"],
              ["NOW", "Co-op @ MBPSD / Mohawk"],
              ["FOCUS", "Web apps, end-to-end"],
              ["BELIEF", "Finish the thing"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 border-b border-line pb-3">
                <span className="text-ink/50">{k}</span>
                <span className="text-right text-ink">{v}</span>
              </div>
            ))}
          </Rise>
        </div>
      </div>

      <div className="mt-28 grid grid-cols-2 gap-8 md:grid-cols-4">
        <Stat value={4} suffix="" label="Products shipped" />
        <Stat value={3} suffix="" label="Design studies live" />
        <Stat value={2} suffix="" label="Co-op terms" />
        <Stat value={1} suffix="" label="Bot trading gold" />
      </div>
    </section>
  );
}
