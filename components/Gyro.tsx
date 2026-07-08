"use client";

import { useEffect } from "react";
import { world } from "@/lib/world";

/**
 * On touch devices, device tilt takes over the cursor's job:
 * the observatory leans as the phone leans. iOS requires a
 * permission grant, requested quietly on the first touch.
 */
export default function Gyro() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    if (world.reducedMotion) return;
    if (!("DeviceOrientationEvent" in window)) return;

    let baseBeta: number | null = null;
    let baseGamma = 0;

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (baseBeta === null) {
        baseBeta = e.beta;
        baseGamma = e.gamma;
        return;
      }
      // slowly re-center so a new holding angle becomes the new neutral
      baseBeta += (e.beta - baseBeta) * 0.004;
      baseGamma += (e.gamma - baseGamma) * 0.004;

      const dx = Math.max(-1, Math.min(1, (e.gamma - baseGamma) / 20));
      const dy = Math.max(-1, Math.min(1, (e.beta - baseBeta) / 20));
      world.mouse.x += (dx - world.mouse.x) * 0.14;
      world.mouse.y += (-dy - world.mouse.y) * 0.14;
    };

    const attach = () =>
      window.addEventListener("deviceorientation", onOrient, { passive: true });

    type PermissionedDOE = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<string>;
    };
    const DOE = DeviceOrientationEvent as PermissionedDOE;

    let askListener: (() => void) | null = null;
    if (typeof DOE.requestPermission === "function") {
      // iOS: must be requested from a user gesture — piggyback the first touch
      askListener = () => {
        DOE.requestPermission!()
          .then((state) => {
            if (state === "granted") attach();
          })
          .catch(() => {
            /* denied or unsupported — the site works fine without tilt */
          });
      };
      window.addEventListener("touchend", askListener, { once: true });
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      if (askListener) window.removeEventListener("touchend", askListener);
    };
  }, []);

  return null;
}
