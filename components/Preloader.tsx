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

const BONE = [236, 231, 223] as const;
const EMBER = [255, 92, 40] as const;

type Star = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  speed: number;
  ember: boolean;
  dust: boolean;
};

/**
 * The loading rite, in the site's own language: a swarm of stars
 * forms the percentage, re-forming digit by digit, then bursts into
 * the void as the veil tears open. Calm mode gets a plain counter.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [word, setWord] = useState(0);
  const [gone, setGone] = useState(false);
  const [calm, setCalm] = useState(false);
  const doneRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pctRef = useRef(0);
  const burstRef = useRef(false);

  /* ---- progress clock ---- */
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const reduced = calmMode();
    setCalm(reduced);
    const t0 = performance.now();
    const DURATION = reduced ? 400 : 2600;
    let raf = 0;

    const tick = () => {
      const t = Math.min((performance.now() - t0) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const pct = Math.round(eased * 100);
      pctRef.current = pct;
      setProgress(pct);
      setWord(Math.min(Math.floor(t * WORDS.length), WORDS.length - 1));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        world.started = true;
        burstRef.current = true; // the constellation lets go
        setTimeout(() => {
          setGone(true);
          document.documentElement.style.overflow = "";
          onDone();
        }, reduced ? 50 : 550);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, [onDone]);

  /* ---- star-counter engine ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || calmMode()) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      width = r.width;
      height = r.height;
      canvas.width = Math.round(width * DPR);
      canvas.height = Math.round(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    fit();

    const family =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-syne")
        .trim() || "system-ui, sans-serif";

    // low-res sampling canvas — glyph shapes → target points
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    const OW = 560;
    const OH = 230;
    off.width = OW;
    off.height = OH;

    const samplePass = (draw: () => void, step: number) => {
      octx.clearRect(0, 0, OW, OH);
      octx.fillStyle = "#fff";
      octx.textBaseline = "middle";
      draw();
      const img = octx.getImageData(0, 0, OW, OH).data;
      const pts: [number, number][] = [];
      for (let y = 0; y < OH; y += step) {
        for (let x = 0; x < OW; x += step) {
          if (img[(y * OW + x) * 4 + 3] > 120) pts.push([x, y]);
        }
      }
      return pts;
    };

    const N = 3000;
    const cx = () => width / 2;
    const cy = () => height / 2;
    const stars: Star[] = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * Math.max(width, height) * 0.5;
      return {
        x: cx() + Math.cos(a) * d,
        y: cy() + Math.sin(a) * d,
        tx: 0,
        ty: 0,
        vx: 0,
        vy: 0,
        r: 0.55 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.4,
        ember: false,
        dust: true,
      };
    });

    let lastPct = -1;
    const retarget = (pct: number) => {
      const text = String(pct).padStart(3, "0");
      octx.font = `800 168px ${family}`;
      const digitsW = octx.measureText(text).width;
      octx.font = `800 74px ${family}`;
      const pctW = octx.measureText("%").width;
      const totalW = digitsW + 14 + pctW;
      const left = (OW - totalW) / 2;

      const digitPts = samplePass(() => {
        octx.font = `800 168px ${family}`;
        octx.textAlign = "left";
        octx.fillText(text, left, OH / 2);
      }, 5);
      const pctPts = samplePass(() => {
        octx.font = `800 74px ${family}`;
        octx.textAlign = "left";
        octx.fillText("%", left + digitsW + 14, OH / 2 - 34);
      }, 4);

      // map sampling space → display space
      const scale = Math.min((width * 0.86) / OW, (height * 0.8) / OH);
      const ox = cx() - (OW / 2) * scale;
      const oy = cy() - (OH / 2) * scale;

      const all = [
        ...digitPts.map((p) => ({ p, ember: false })),
        ...pctPts.map((p) => ({ p, ember: true })),
      ];
      for (let i = 0; i < N; i++) {
        const s = stars[i];
        if (i < all.length) {
          const { p, ember } = all[i];
          s.tx = ox + p[0] * scale + (Math.random() - 0.5) * 1.5;
          s.ty = oy + p[1] * scale + (Math.random() - 0.5) * 1.5;
          s.ember = ember;
          s.dust = false;
        } else {
          // spare stars hang as loose dust around the counter
          const a = Math.random() * Math.PI * 2;
          const d = Math.max(width, height) * (0.18 + Math.random() * 0.4);
          s.tx = cx() + Math.cos(a) * d;
          s.ty = cy() + Math.sin(a) * d * 0.7;
          s.ember = Math.random() < 0.08;
          s.dust = true;
        }
      }
    };

    // re-sample once the display face actually arrives
    const refont = () => {
      lastPct = -1;
    };
    document.fonts?.ready.then(refont).catch(() => {});

    let raf = 0;
    let tPrev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - tPrev) / 1000, 0.05);
      tPrev = now;
      const t = now / 1000;

      if (pctRef.current !== lastPct && !burstRef.current) {
        lastPct = pctRef.current;
        retarget(lastPct);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const burst = burstRef.current;
      for (const s of stars) {
        if (burst) {
          if (s.vx === 0 && s.vy === 0) {
            const dx = s.x - cx();
            const dy = s.y - cy();
            const len = Math.hypot(dx, dy) || 1;
            const v = 90 + Math.random() * 320;
            s.vx = (dx / len) * v;
            s.vy = (dy / len) * v - 40;
          }
          s.x += s.vx * dt;
          s.y += s.vy * dt;
        } else {
          s.x += (s.tx - s.x) * (1 - Math.exp(-7 * dt));
          s.y += (s.ty - s.y) * (1 - Math.exp(-7 * dt));
          s.x += Math.sin(t * s.speed + s.phase) * 0.22;
          s.y += Math.cos(t * s.speed * 0.9 + s.phase) * 0.18;
        }

        const tw = 0.55 + 0.45 * Math.sin(t * (1.2 + s.speed) + s.phase * 7);
        const base = s.dust ? 0.22 : 0.8;
        const a = Math.max(base * tw * (burst ? 0.7 : 1), 0.04);
        const [cr, cg, cb] = s.ember ? EMBER : BONE;

        // core
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        // halo
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${a * 0.09})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-void"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1.1, ease: [0.83, 0, 0.17, 1] }}
          aria-hidden="true"
        >
          <div className="relative flex w-full flex-col items-center gap-6">
            {calm ? (
              <div
                className="font-display text-[18vw] font-extrabold leading-none tracking-tight text-ink md:text-[9rem]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {String(progress).padStart(3, "0")}
                <span className="text-ember">%</span>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="h-[38vh] w-full max-w-[900px]"
              />
            )}
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
