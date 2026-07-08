"use client";

import { CAREER } from "@/lib/data";
import { SectionLabel, Rise } from "@/components/ui/Split";

export default function Career() {
  return (
    <section
      id="path"
      data-shape
      aria-label="Experience"
      className="relative mx-auto max-w-[1400px] px-5 py-[20vh] md:px-10"
    >
      <div className="section-veil" aria-hidden="true" />
      <SectionLabel index="04" title="Trajectory — how I got here" />

      <ol className="relative" role="list">
        {/* the ascent line */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 hidden h-full w-px bg-gradient-to-b from-ember/60 via-ink/15 to-transparent md:block"
        />
        {CAREER.map((entry, i) => (
          <li key={entry.period}>
            <Rise delay={i * 0.05}>
              <div className="group grid gap-3 border-t border-line py-12 transition-transform duration-500 hover:translate-x-3 md:grid-cols-[200px_1fr_1fr] md:gap-10 md:pl-10">
                <span className="font-mono text-xs tracking-[0.25em] text-ember">
                  {entry.period}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-ink md:text-4xl">
                    {entry.role}
                  </h3>
                  <span className="mt-1 block font-serif text-xl italic text-dim">
                    {entry.place}
                  </span>
                </div>
                <p className="max-w-md font-mono text-sm leading-relaxed text-dim transition-colors duration-500 group-hover:text-ink/90">
                  {entry.note}
                </p>
              </div>
            </Rise>
          </li>
        ))}
      </ol>
    </section>
  );
}
