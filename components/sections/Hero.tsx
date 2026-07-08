"use client";

import { motion } from "framer-motion";
import { SplitChars } from "@/components/ui/Split";

export default function Hero() {
  return (
    <section
      id="hero"
      data-shape
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-8 pt-24 md:px-10"
    >
      {/* rotating dial — an instrument, not decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]"
      >
        <div className="animate-spin-slow absolute inset-0 rounded-full border border-ink/30" style={{ animationDuration: "60s" }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0 h-3 w-px origin-bottom bg-ink/50"
              style={{ transform: `rotate(${i * 15}deg) translateY(-1px)`, transformOrigin: `0 65vmin` }}
            />
          ))}
        </div>
        <div className="absolute inset-[12%] rounded-full border border-dashed border-ink/20 animate-spin-slow" style={{ animationDuration: "90s", animationDirection: "reverse" }} />
      </div>

      <motion.div
        className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-dim"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, delay: 0.6 }}
      >
        <span>PORTFOLIO — 2026 EDITION</span>
        <span className="hidden text-right sm:block">
          43.2557° N — 79.8711° W
          <br />
          SIGNAL: LIVE
        </span>
      </motion.div>

      <h1 className="relative mx-auto w-full max-w-[1400px] text-center">
        <SplitChars
          text="THE SPACE"
          as="span"
          delay={0.1}
          className="block whitespace-nowrap font-display text-[12vw] font-extrabold leading-[0.95] tracking-tight text-ink md:text-[8.6vw]"
        />
        <SplitChars
          text="BETWEEN"
          as="span"
          delay={0.25}
          className="text-stroke block whitespace-nowrap font-display text-[12vw] font-extrabold leading-[0.95] tracking-tight md:text-[8.6vw]"
        />
        <span className="mt-2 block font-serif text-[8vw] italic leading-[1.05] text-ink md:text-[5.2vw]">
          <SplitChars text="idea" as="span" delay={0.45} stagger={0.045} />
          <motion.span
            className="mx-3 inline-block not-italic text-ember"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
          >
            &amp;
          </motion.span>
          <SplitChars text="shipped" as="span" delay={0.6} stagger={0.045} className="text-ember" />
        </span>
      </h1>

      <motion.div
        className="flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-dim"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, delay: 0.9 }}
      >
        <span className="max-w-[46ch] leading-relaxed">
          NIKOLA ANASTASIJEVIĆ
          <br />
          <span className="text-ink/80">SOFTWARE DEVELOPER</span> — I FINISH THE THING
        </span>
        <span className="flex flex-col items-end gap-3">
          <span>KEEP GOING</span>
          <span className="relative h-12 w-px overflow-hidden bg-ink/15" aria-hidden="true">
            <motion.span
              className="absolute left-0 top-0 h-4 w-px bg-ember"
              animate={{ y: [-16, 48] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </span>
      </motion.div>
    </section>
  );
}
