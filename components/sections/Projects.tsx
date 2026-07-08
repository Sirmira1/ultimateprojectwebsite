"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { PROJECTS } from "@/lib/data";
import { world } from "@/lib/world";
import { SectionLabel, Rise } from "@/components/ui/Split";

export default function Projects() {
  const [hovered, setHovered] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // cursor-following preview panel
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 140, damping: 18, mass: 0.6 });
  const tilt = useMotionValue(0);
  const rot = useSpring(tilt, { stiffness: 120, damping: 14 });
  const lastX = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    mx.set(e.clientX);
    my.set(e.clientY);
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    tilt.set(Math.max(-14, Math.min(14, dx * 0.6)));
  };

  useEffect(() => {
    world.accent = hovered !== null ? PROJECTS[hovered].accent : null;
    return () => {
      world.accent = null;
    };
  }, [hovered]);

  const active = hovered !== null ? PROJECTS[hovered] : null;

  return (
    <section
      id="work"
      data-shape
      ref={sectionRef}
      aria-label="Selected work"
      className="relative px-5 py-[20vh] md:px-10"
      onPointerMove={onMove}
      onPointerLeave={() => setHovered(null)}
    >
      <div className="section-veil" aria-hidden="true" />
      {/* ambient glow that adopts the hovered project's color */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: active
            ? `radial-gradient(ellipse 70% 55% at 50% 50%, ${active.accent}14, transparent 70%)`
            : undefined,
        }}
      />

      <div className="mx-auto max-w-[1400px]">
        <SectionLabel index="02" title="Selected work — 2023 → 2026" />

        <ul role="list">
          {PROJECTS.map((p, i) => {
            const isActive = hovered === i;
            const isDimmed = hovered !== null && !isActive;
            return (
              <li key={p.index} className="border-t border-line last:border-b">
                <Rise y={30} delay={i * 0.04}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="VISIT"
                    className="group block py-8 outline-offset-[-4px] md:py-10"
                    onPointerEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                  >
                    <div
                      className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 transition-opacity duration-500 md:gap-10"
                      style={{ opacity: isDimmed ? 0.25 : 1 }}
                    >
                      <span className="font-mono text-[10px] tracking-[0.3em] text-dim">
                        {p.index}
                      </span>
                      <h3
                        className={`text-stroke font-display text-[11vw] font-extrabold leading-[0.95] tracking-tight transition-all duration-500 md:text-[6.5vw] ${
                          isActive ? "translate-x-3" : ""
                        }`}
                        style={isActive ? { color: p.accent, WebkitTextStroke: "0px" } : undefined}
                      >
                        {p.title}
                      </h3>
                      <span className="text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-dim">
                        {p.year}
                        <br className="hidden md:block" />
                        <span className="hidden text-ink/60 md:inline">{p.role}</span>
                      </span>
                    </div>

                    {/* description drawer */}
                    <div
                      className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ gridTemplateRows: isActive ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-wrap items-start justify-between gap-4 pt-6 pl-[calc(2.5rem)] md:pl-[calc(3.5rem+2.5vw)]">
                          <p className="max-w-md font-mono text-xs leading-relaxed text-ink/80">
                            {p.description}
                          </p>
                          <span className="flex gap-2">
                            {p.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-line px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-dim"
                              >
                                {t}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                </Rise>
              </li>
            );
          })}
        </ul>

        <Rise className="mt-10 text-right font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
          Everything above is live & clickable — plus three design studies in the lab
        </Rise>
      </div>

      {/* floating preview — follows the cursor, leans with its velocity */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[150] hidden lg:block"
        style={{ x, y, rotate: rot, translateX: "-50%", translateY: "-115%" }}
      >
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.index}
              initial={{ opacity: 0, scale: 0.7, clipPath: "inset(45% 0 45% 0)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0 0% 0)" }}
              exit={{ opacity: 0, scale: 0.85, clipPath: "inset(45% 0 45% 0)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-56 w-96 overflow-hidden rounded-sm border border-ink/10"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 25% 20%, ${active.gradient[1]}cc, transparent 60%), radial-gradient(circle at 80% 85%, ${active.gradient[1]}66, transparent 55%), linear-gradient(160deg, ${active.gradient[0]}, #08070b 85%)`,
                }}
              />
              <motion.div
                className="absolute -inset-1/2 opacity-50 mix-blend-screen"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%, transparent, ${active.gradient[1]}55, transparent 30%)`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono text-[9px] uppercase tracking-[0.25em] text-ink/90">
                <div className="flex justify-between">
                  <span>{active.index}</span>
                  <span>{active.year}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-display text-xl font-bold tracking-normal">{active.title}</span>
                  <span>LIVE PREVIEW</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
