"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { calmMode } from "@/lib/calm";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => typeof window !== "undefined" && calmMode();

/**
 * Splits text into characters wrapped in overflow masks and slides
 * them in — either on a signal (`play`) or when scrolled into view.
 */
export function SplitChars({
  text,
  as = "span",
  className = "",
  play,
  delay = 0,
  stagger = 0.028,
  y = 110,
  duration = 1.1,
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  /** undefined → animate on scroll into view; boolean → manual trigger */
  play?: boolean;
  delay?: number;
  stagger?: number;
  y?: number;
  duration?: number;
}) {
  const Tag = as as "span";
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || played.current) return;
    const chars = el.querySelectorAll<HTMLElement>("[data-char]");
    if (reduced()) {
      gsap.set(chars, { yPercent: 0, rotate: 0 });
      played.current = true;
      return;
    }
    if (play === false) {
      gsap.set(chars, { yPercent: y, rotate: 6 });
      return;
    }
    played.current = true;
    gsap.fromTo(
      chars,
      { yPercent: y, rotate: 6 },
      {
        yPercent: 0,
        rotate: 0,
        duration,
        delay,
        stagger,
        ease: "power4.out",
        ...(play === undefined
          ? { scrollTrigger: { trigger: el, start: "top 88%" } }
          : {}),
      }
    );
  }, [play, delay, stagger, y, duration]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split("").map((c, i) =>
        c === " " ? (
          <span key={i} className="inline-block">
            &nbsp;
          </span>
        ) : (
          <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
            <span data-char className="inline-block will-change-transform" style={{ transform: `translateY(${y}%)` }}>
              {c}
            </span>
          </span>
        )
      )}
    </Tag>
  );
}

/**
 * Reveals arbitrary children line-by-line: each direct child is
 * masked and slides up on scroll.
 */
export function RevealLines({
  children,
  className = "",
  stagger = 0.12,
  start = "top 85%",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const lines = el.querySelectorAll<HTMLElement>(".line-mask > span");
    if (reduced()) return;
    const tween = gsap.fromTo(
      lines,
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.2,
        stagger,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [stagger, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** A single masked line for use inside RevealLines. */
export function Line({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`line-mask ${className}`}>
      <span>{children}</span>
    </span>
  );
}

/** Fades + lifts a block on scroll. The quiet fallback for small elements. */
export function Rise({
  children,
  className = "",
  delay = 0,
  y = 40,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, y]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Mono section label with an index and a growing rule. */
export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <Rise className="mb-14 flex items-center gap-4 md:mb-20">
      <span className="font-mono text-xs tracking-[0.25em] text-ember">{index}</span>
      <span className="h-px w-12 bg-ink/20" />
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-dim">{title}</span>
    </Rise>
  );
}
