"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { world } from "@/lib/world";
import { audio } from "@/lib/audio";

/**
 * "Leave your mark" — a full-screen pad. Visitors draw with light;
 * on release their strokes are handed to the WebGL trail system,
 * where they hold for a beat and then burst into the void.
 *
 * Open it by dispatching:  window.dispatchEvent(new Event("open-guestbook"))
 */
export default function Guestbook() {
  const [open, setOpen] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const drawing = useRef(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-guestbook", onOpen);
    return () => window.removeEventListener("open-guestbook", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [open]);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (!open) return;
    resize();
    strokes.current = [];
    setHasInk(false);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [open, resize]);

  const redraw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
    ctx.strokeStyle = "#ffe8d6";
    ctx.shadowColor = "#ff5c28";
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2.5;
    for (const stroke of strokes.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drawing.current = true;
    strokes.current.push([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetic or already-released pointer — capture is best-effort */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const stroke = strokes.current[strokes.current.length - 1];
    const last = stroke[stroke.length - 1];
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    if (Math.hypot(x - last.x, y - last.y) < 3) return;
    stroke.push({ x, y });
    setHasInk(true);
    redraw();
  };

  const onPointerUp = () => {
    drawing.current = false;
  };

  const clear = () => {
    strokes.current = [];
    setHasInk(false);
    redraw();
  };

  /** Convert canvas strokes → world coords and hand them to the trail. */
  const release = () => {
    const c = canvasRef.current;
    if (!c || !hasInk) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    // world scale: camera sits ~7.2 from z=0 at contact (fov 50)
    const worldH = 2 * Math.tan((50 * Math.PI) / 360) * 7.2;
    const worldPerPx = worldH / window.innerHeight;

    const pts: number[] = [];
    for (const stroke of strokes.current) {
      for (let i = 0; i < stroke.length; i++) {
        const p = stroke[i];
        // densify: also interpolate midpoints for a fuller mark
        pts.push(
          (p.x - w / 2) * worldPerPx,
          -(p.y - h / 2) * worldPerPx,
          0
        );
        const nx = stroke[i + 1];
        if (nx) {
          for (let f = 0.25; f < 1; f += 0.25) {
            pts.push(
              (p.x + (nx.x - p.x) * f - w / 2) * worldPerPx,
              -((p.y + (nx.y - p.y) * f) - h / 2) * worldPerPx,
              0
            );
          }
        }
      }
    }
    world.markQueue.push(new Float32Array(pts));
    audio.click();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[350] flex flex-col bg-void/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-label="Leave your mark"
        >
          <div className="flex items-center justify-between px-6 py-5 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
            <span>
              GUESTBOOK <span className="text-ember">/</span> DRAW YOUR MARK
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-ink/70 transition-colors hover:text-ember"
              data-cursor="CLOSE"
            >
              ESC — CLOSE
            </button>
          </div>

          <canvas
            ref={canvasRef}
            className="mx-6 flex-1 cursor-crosshair rounded-sm border border-dashed border-ink/15"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{ touchAction: "none" }}
          />

          <div className="flex items-center justify-between px-6 py-5">
            <button
              onClick={clear}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim transition-colors hover:text-ink"
              data-cursor="CLEAR"
            >
              CLEAR
            </button>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.25em] text-ink/30 sm:block">
              Your mark joins the field for a moment — then becomes stardust
            </span>
            <button
              onClick={release}
              disabled={!hasInk}
              className={`border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] transition-all duration-300 ${
                hasInk
                  ? "border-ember bg-ember text-void hover:bg-transparent hover:text-ember"
                  : "border-ink/15 text-ink/30"
              }`}
              data-cursor="RELEASE"
            >
              RELEASE INTO THE VOID
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
