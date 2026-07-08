"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "@/lib/world";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

gsap.registerPlugin(ScrollTrigger);

/**
 * Owns the scroll pipeline: Lenis → GSAP ticker → ScrollTrigger,
 * and feeds the shared `world` state (section blend, velocity, cursor).
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    world.reducedMotion = reduced;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    world.tier = coarse || mem <= 4 ? 0 : 1;

    /* ---- section centers → continuous blend index ---- */
    let centers: number[] = [];
    const measure = () => {
      centers = Array.from(document.querySelectorAll<HTMLElement>("[data-shape]")).map((el) => {
        const r = el.getBoundingClientRect();
        // anchor: where along the section its shape is "at home" (0..1 of height)
        const anchor = parseFloat(el.dataset.shapeAnchor ?? "0.5");
        return r.top + window.scrollY + r.height * anchor;
      });
    };

    const computeBlend = (scrollY: number) => {
      if (centers.length < 2) return 0;
      const sc = scrollY + window.innerHeight / 2;
      if (sc <= centers[0]) return 0;
      const last = centers.length - 1;
      if (sc >= centers[last]) return last;
      let i = 0;
      while (i < last && sc > centers[i + 1]) i++;
      return i + (sc - centers[i]) / (centers[i + 1] - centers[i]);
    };

    const onScroll = (scrollY: number, velocity: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      world.scroll = max > 0 ? scrollY / max : 0;
      world.scrollVel = velocity;
      world.blend = computeBlend(scrollY);
    };

    /* ---- Lenis ---- */
    let lenis: Lenis | undefined;
    let rafTick: ((t: number) => void) | undefined;
    const nativeScroll = () => onScroll(window.scrollY, 0);

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      });
      window.__lenis = lenis;
      lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
        ScrollTrigger.update();
        onScroll(e.scroll, e.velocity);
      });
      rafTick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(rafTick);
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener("scroll", nativeScroll, { passive: true });
    }

    /* ---- pointer → world (NDC + smoothed velocity) ---- */
    let lastX = 0, lastY = 0, lastT = performance.now(), hasLast = false;
    const onPointer = (e: PointerEvent) => {
      world.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      world.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      const now = performance.now();
      if (hasLast) {
        const dt = Math.max(now - lastT, 1);
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        const v = Math.min(dist / dt / 2.5, 1);
        world.mouseVel += (v - world.mouseVel) * 0.18;
      }
      lastX = e.clientX; lastY = e.clientY; lastT = now; hasLast = true;
    };
    const decay = window.setInterval(() => {
      world.mouseVel *= 0.86;
    }, 60);
    window.addEventListener("pointermove", onPointer, { passive: true });

    // every click detonates a shockwave in the particle field
    const onDown = (e: PointerEvent) => {
      world.clickAt = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
        t: performance.now() / 1000,
        power: 1,
      };
    };
    window.addEventListener("pointerdown", onDown, { passive: true });

    /* ---- measurement lifecycle ---- */
    measure();
    onScroll(window.scrollY, 0);
    const onRefresh = () => {
      measure();
      onScroll(window.scrollY, 0);
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);
    window.addEventListener("resize", onRefresh);
    // re-measure once everything (fonts, pinned sections) settles
    const settle = window.setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      window.clearTimeout(settle);
      window.clearInterval(decay);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onRefresh);
      window.removeEventListener("scroll", nativeScroll);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      if (rafTick) gsap.ticker.remove(rafTick);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}
