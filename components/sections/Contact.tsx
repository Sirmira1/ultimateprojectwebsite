"use client";

import { useEffect, useState } from "react";
import { EMAIL, SOCIALS } from "@/lib/data";
import { SectionLabel, RevealLines, Line, Rise } from "@/components/ui/Split";
import Magnetic from "@/components/ui/Magnetic";

function LocalTime() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Toronto",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time} ET</span>;
}

export default function Contact() {
  const toTop = (e: React.MouseEvent) => {
    e.preventDefault();
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(0, { duration: 2.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="talk"
      data-shape
      aria-label="Contact"
      className="relative flex min-h-[100svh] flex-col justify-between px-5 pt-[18vh] md:px-10"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <SectionLabel index="06" title="Transmission — open channel" />
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center gap-14 text-center">
        <RevealLines className="font-display text-[11.5vw] font-extrabold leading-[0.98] tracking-tight text-ink md:text-[7.5vw]" start="top 90%">
          <Line>LET&rsquo;S BUILD</Line>
          <Line>
            <span className="font-serif font-normal italic text-ember">something</span>
          </Line>
          <Line>REAL</Line>
        </RevealLines>

        <Rise delay={0.2}>
          <Magnetic strength={0.45}>
            <a
              href={`mailto:${EMAIL}`}
              data-cursor="SEND"
              className="group relative flex h-40 w-40 items-center justify-center rounded-full border border-ink/25 bg-void/55 backdrop-blur-[2px] transition-colors duration-500 hover:border-ember md:h-48 md:w-48"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 scale-0 rounded-full bg-ember transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100"
              />
              <span className="relative z-10 font-mono text-[11px] uppercase tracking-[0.3em] text-ink transition-colors duration-500 group-hover:text-void">
                SAY HELLO
                <span aria-hidden="true" className="mt-1 block text-base tracking-normal">↗</span>
              </span>
            </a>
          </Magnetic>
        </Rise>

        <Rise delay={0.3} className="flex flex-col items-center gap-2 font-mono text-xs text-dim">
          <a href={`mailto:${EMAIL}`} className="group relative text-ink/80 transition-colors hover:text-ink">
            {EMAIL}
            <span className="absolute -bottom-1 left-0 block h-px w-0 bg-ember transition-all duration-300 group-hover:w-full" />
          </a>
          <span className="text-[10px] uppercase tracking-[0.25em]">
            Usually replies within 24h — open to co-ops, freelance builds & good problems
          </span>
        </Rise>

        <Rise delay={0.4}>
          <button
            onClick={() => window.dispatchEvent(new Event("open-guestbook"))}
            data-cursor="SIGN"
            className="group flex items-center gap-4 border border-ink/20 px-8 py-4 font-mono text-[10px] uppercase tracking-[0.3em] text-dim transition-all duration-500 hover:border-ember hover:text-ink"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ember transition-transform duration-500 group-hover:scale-150" />
            You&rsquo;ve seen my signature — leave yours
          </button>
        </Rise>
      </div>

      <footer className="mx-auto mt-[12vh] w-full max-w-[1400px] border-t border-line py-6">
        <div className="flex flex-col items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-dim md:flex-row">
          <span>© 2026 NIKOLA ANASTASIJEVIĆ</span>
          <nav aria-label="Social links" className="flex gap-6">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group relative transition-colors hover:text-ink"
              >
                {s.label}
                <span className="absolute -bottom-0.5 left-0 block h-px w-0 bg-ember transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
          <span className="flex items-center gap-4">
            <span>
              HAMILTON, ON — <LocalTime />
            </span>
            <a href="#top" onClick={toTop} data-cursor="TOP" className="text-ink/70 transition-colors hover:text-ember">
              ↑ TOP
            </a>
          </span>
        </div>
        <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-ink/25 md:text-left">
          Designed & built by hand — no templates were harmed
        </p>
      </footer>
    </section>
  );
}
