"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { world } from "@/lib/world";
import { calmMode } from "@/lib/calm";

const WORDS = [
  "CALIBRATING INSTRUMENTS",
  "SEEDING PARTICLES",
  "BENDING LIGHT",
  "TUNING GRAVITY",
  "OPENING OBSERVATORY",
];

/**
 * The loading rite: a counter climbs while the particle field assembles
 * behind it, then the veil tears open. Scroll is locked until the reveal.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [word, setWord] = useState(0);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const reduced = calmMode();
    const t0 = performance.now();
    const DURATION = reduced ? 400 : 2400;
    let raf = 0;

    const tick = () => {
      const t = Math.min((performance.now() - t0) / DURATION, 1);
      // eased, slightly stuttered climb
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      setWord(Math.min(Math.floor(t * WORDS.length), WORDS.length - 1));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        world.started = true;
        // small beat, then tear the veil
        setTimeout(() => {
          setGone(true);
          document.documentElement.style.overflow = "";
          onDone();
        }, reduced ? 50 : 450);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-void"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1.1, ease: [0.83, 0, 0.17, 1] }}
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center gap-6">
            <div
              className="font-display text-[18vw] font-extrabold leading-none tracking-tight text-ink md:text-[9rem]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {String(progress).padStart(3, "0")}
              <span className="text-ember">%</span>
            </div>
            <div className="h-px w-48 overflow-hidden bg-ink/10">
              <div
                className="h-full bg-ember transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div
              key={word}
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-dim"
              style={{ animation: "flicker 0.5s steps(2) 1" }}
            >
              {WORDS[word]}
            </div>
          </div>
          <div className="absolute bottom-8 flex w-full items-end justify-between px-8 font-mono text-[10px] uppercase tracking-[0.25em] text-dim/60">
            <span>N.A — PORTFOLIO</span>
            <span>©2026 / HAMILTON, ON — CANADA</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
