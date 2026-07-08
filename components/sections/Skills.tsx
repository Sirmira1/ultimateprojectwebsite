"use client";

import { SKILLS } from "@/lib/data";
import { SectionLabel, Rise } from "@/components/ui/Split";

const MARQUEE = [
  "TYPESCRIPT", "JAVA", "PYTHON", "C#", "SWIFT", "PHP", "REACT",
  "NEXT.JS", "REACT NATIVE", ".NET", "LARAVEL", "MYSQL", "UNITY", "SUPABASE",
];

export default function Skills() {
  return (
    <section
      id="craft"
      data-shape
      aria-label="Skills and craft"
      className="relative py-[20vh]"
    >
      <div className="section-veil" aria-hidden="true" />
      {/* marquee — the toolbox in motion */}
      <div className="mb-24 overflow-hidden border-y border-line py-4" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap" style={{ "--marquee-speed": "32s" } as React.CSSProperties}>
          {[...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} className="flex items-center gap-8 font-mono text-xs uppercase tracking-[0.35em] text-dim">
              {w}
              <span className="text-ember">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionLabel index="03" title="Craft — the instruments" />

        <div className="flex flex-col">
          {SKILLS.map((group, gi) => (
            <Rise key={group.label} delay={gi * 0.06} className="grid gap-4 border-t border-line py-10 last:border-b md:grid-cols-[220px_1fr] md:gap-12">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">
                  {group.label}
                </span>
                <span className="font-serif text-lg italic text-dim">{group.note}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="text-stroke cursor-default font-display text-4xl font-bold tracking-tight transition-colors duration-300 hover:text-ink md:text-6xl"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Rise>
          ))}
        </div>

        <Rise className="mt-16 flex justify-end">
          <p className="max-w-sm text-right font-mono text-xs leading-relaxed text-dim">
            Tools change every semester. What stays: start it, build it,{" "}
            <span className="text-ember">finish the thing</span>.
          </p>
        </Rise>
      </div>
    </section>
  );
}
