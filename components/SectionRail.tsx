"use client";

import { useEffect, useRef } from "react";
import { world } from "@/lib/world";
import { calmMode } from "@/lib/calm";

const STOPS = [
  { id: "#top", label: "SIGNATURE" },
  { id: "#hero", label: "ENTRY" },
  { id: "#about", label: "WHO" },
  { id: "#work", label: "WORK" },
  { id: "#craft", label: "CRAFT" },
  { id: "#path", label: "PATH" },
  { id: "#lab", label: "LAB" },
  { id: "#talk", label: "TALK" },
];

/**
 * Orientation for an immersive site: a quiet rail of ticks on the right
 * edge, one per world. The active tick stretches ember; hovering names
 * it; clicking flies there.
 */
export default function SectionRail({ visible }: { visible: boolean }) {
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (calmMode()) {
      // static highlight via scroll listener is enough in calm mode
      const onScroll = () => {
        const idx = Math.round(world.blend);
        itemRefs.current.forEach((el, i) => {
          if (el) el.style.width = i === idx ? "28px" : "12px";
          if (el) el.style.background = i === idx ? "#ff5c28" : "rgba(236,231,223,0.3)";
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    let raf = 0;
    const tick = () => {
      const b = world.blend;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        // proximity 1 at the section, 0 a full section away
        const p = Math.max(0, 1 - Math.abs(b - i));
        el.style.width = `${12 + p * 18}px`;
        el.style.background =
          p > 0.5
            ? `rgba(255,92,40,${0.45 + p * 0.55})`
            : `rgba(236,231,223,${0.22 + p * 0.35})`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(id, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Section progress"
      className={`fixed right-5 top-1/2 z-[190] hidden -translate-y-1/2 flex-col items-end gap-3 transition-opacity duration-1000 lg:flex ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {STOPS.map((s, i) => (
        <a
          key={s.id}
          href={s.id}
          onClick={(e) => go(e, s.id)}
          className="group flex items-center gap-3 py-0.5"
          aria-label={s.label}
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-dim opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {s.label}
          </span>
          <span
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="block h-px transition-[width] duration-300"
            style={{ width: 12, background: "rgba(236,231,223,0.3)" }}
          />
        </a>
      ))}
    </nav>
  );
}
