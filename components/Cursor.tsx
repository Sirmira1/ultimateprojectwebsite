"use client";

import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";

/**
 * Custom cursor: an ember dot + trailing ring. The ring inflates and
 * shows a label over elements tagged with `data-cursor="LABEL"`,
 * stretches with velocity, and compresses on press.
 */
export default function Cursor() {
  const [fine, setFine] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setFine(true);
    document.body.classList.add("has-cursor");

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let pressed = false;
    let label = "";
    let raf = 0;
    let visible = false;

    const dot = dotRef.current!;
    const ringEl = ringRef.current!;
    const labelEl = labelRef.current!;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ring.x = pos.x;
        ring.y = pos.y;
        dot.style.opacity = "1";
        ringEl.style.opacity = "1";
      }
    };

    const setLabel = (text: string) => {
      if (text === label) return;
      label = text;
      labelEl.textContent = text;
      labelEl.style.opacity = text ? "1" : "0";
      labelEl.style.transform = `scale(${text ? 1 : 0.6})`;
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-cursor], a, button") as HTMLElement | null;
      if (!el) {
        targetScale = 1;
        setLabel("");
        return;
      }
      const tag = el.getAttribute("data-cursor");
      if (tag) {
        targetScale = 3.2;
        setLabel(tag);
      } else {
        targetScale = 1.9;
        setLabel("");
      }
      audio.hover();
    };

    const onOut = (e: PointerEvent) => {
      const to = e.relatedTarget as HTMLElement | null;
      if (!to || !to.closest?.("[data-cursor], a, button")) {
        targetScale = 1;
        setLabel("");
      }
    };

    const onDown = () => {
      pressed = true;
      audio.click();
    };
    const onUp = () => (pressed = false);
    const onLeaveWindow = () => {
      visible = false;
      dot.style.opacity = "0";
      ringEl.style.opacity = "0";
    };

    let prevX = 0, prevY = 0;
    const tick = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      const goal = pressed ? targetScale * 0.72 : targetScale;
      scale += (goal - scale) * 0.18;

      // stretch along velocity
      const vx = ring.x - prevX;
      const vy = ring.y - prevY;
      prevX = ring.x; prevY = ring.y;
      const speed = Math.min(Math.hypot(vx, vy) / 30, 0.35);
      const angle = Math.atan2(vy, vx);

      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%)`;
      ringEl.style.transform =
        `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%,-50%) ` +
        `rotate(${angle}rad) scale(${scale * (1 + speed)}, ${scale * (1 - speed)}) rotate(${-angle}rad)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, []);

  return (
    <div aria-hidden="true" className={fine ? "" : "hidden"}>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[400] h-1.5 w-1.5 rounded-full bg-ember opacity-0 transition-opacity duration-300"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[399] flex h-9 w-9 items-center justify-center rounded-full border border-ink/40 opacity-0 backdrop-invert-0 transition-opacity duration-300"
      >
        <div
          ref={labelRef}
          className="font-mono text-[7px] uppercase tracking-[0.2em] text-ink opacity-0 transition-all duration-200"
        />
      </div>
    </div>
  );
}
