"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { calmMode } from "@/lib/calm";

/**
 * The portrait, in full colour, breathing with gentle waves — until the
 * cursor passes over it. Inside the lens, the same person appears as the
 * observatory sees him: ember-traced edges, halftone grain, scanlines.
 * Luminance-based parallax gives the image a shallow 3D relief.
 * Falls back to the plain photo in calm mode or without WebGL.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform float uHover;
uniform vec2 uMouse;
uniform vec2 uAspect;
uniform vec4 uCover; // uv * xy + zw → cover-cropped texture space

vec3 tex(vec2 uv) {
  return texture2D(uTex, clamp(uv, 0.002, 0.998) * uCover.xy + uCover.zw).rgb;
}
float lum(vec2 uv) {
  return dot(tex(uv), vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 uv = vUv;

  // little waves — the image is never quite still
  uv.x += sin(uv.y * 22.0 + uTime * 1.3) * 0.0035;
  uv.y += cos(uv.x * 17.0 - uTime * 1.05) * 0.0028;

  // pseudo-depth parallax: bright (near) pixels shift more than dark ones
  float depth = lum(uv) - 0.45;
  uv += (uMouse - 0.5) * depth * 0.022 * uHover;

  vec2 dvec = (uv - uMouse) * uAspect;
  float d = length(dvec);
  float R = 0.36;
  float m = smoothstep(R, R * 0.4, d) * uHover;

  // slight refraction inside the lens — glass, not a flat mask
  vec2 uvL = uv - normalize(dvec + 1e-5) * 0.03 * m * smoothstep(0.0, R, d);

  vec3 base = tex(uv);
  // gentle vignette so the photo sits in the void
  float vig = smoothstep(1.05, 0.45, length((vUv - 0.5) * vec2(1.1, 1.0)));
  base *= 0.72 + 0.28 * vig;

  vec3 col = base;
  if (m > 0.001) {
    // — the scan: what the observatory sees —
    float l = lum(uvL);
    vec2 px = vec2(1.0 / 380.0, 1.0 / 460.0);
    float gx = lum(uvL + vec2(px.x, 0.0)) - lum(uvL - vec2(px.x, 0.0));
    float gy = lum(uvL + vec2(0.0, px.y)) - lum(uvL - vec2(0.0, px.y));
    float edge = clamp(length(vec2(gx, gy)) * 4.0, 0.0, 1.0);

    vec2 g = fract(uvL * vec2(88.0, 108.0)) - 0.5;
    float dots = smoothstep(0.52, 0.12, length(g) / max(l, 0.1));

    float scan = 0.82 + 0.18 * sin(uvL.y * 260.0 + uTime * 5.0);

    vec3 voidC = vec3(0.031, 0.027, 0.043);
    vec3 bone = vec3(0.925, 0.906, 0.875);
    vec3 ember = vec3(1.0, 0.36, 0.157);
    vec3 alt = voidC + bone * l * l * 0.5 * dots + ember * (edge * 0.95 + l * 0.12);
    alt *= scan;

    col = mix(base, alt, m);

    // ember rim where the lens meets the photograph
    float rim = exp(-pow((d - R * 0.92) / 0.035, 2.0)) * uHover;
    col += ember * rim * 0.55;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function PortraitReveal({ src, alt }: { src: string; alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    if (calmMode()) {
      setCalm(true);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      setFallback(true);
      return;
    }

    let raf = 0;
    let visible = false;
    let disposed = false;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    /* ---- program ---- */
    const compile = (type: number, srcStr: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, srcStr);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(prog);

    // fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      time: gl.getUniformLocation(prog, "uTime"),
      hover: gl.getUniformLocation(prog, "uHover"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      aspect: gl.getUniformLocation(prog, "uAspect"),
      cover: gl.getUniformLocation(prog, "uCover"),
    };

    /* ---- texture ---- */
    let imgAspect = 4 / 5;
    let texReady = false;
    const texture = gl.createTexture();
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (disposed) return;
      imgAspect = img.width / img.height;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texReady = true;
    };
    img.onerror = () => setFallback(true);

    /* ---- state ---- */
    const pointer = { x: 0.5, y: 0.5, inside: false };
    let hover = 0;

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * DPR);
      canvas.height = Math.round(r.height * DPR);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    fit();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = 1 - (e.clientY - r.top) / r.height;
      pointer.inside = true;
    };
    const onLeave = () => (pointer.inside = false);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    let tPrev = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || !texReady) return;
      const dt = Math.min((now - tPrev) / 1000, 0.05);
      tPrev = now;

      const r = canvas.getBoundingClientRect();
      if (Math.round(r.width * DPR) !== canvas.width) fit();

      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-7 * dt));

      // cover-crop, biased toward the top of the photo (the face)
      const cA = r.width / Math.max(r.height, 1);
      let sx = 1, sy = 1, ox = 0, oy = 0;
      const rel = imgAspect / cA;
      if (rel > 1) {
        sx = 1 / rel;
        ox = (1 - sx) / 2;
      } else {
        sy = rel;
        oy = (1 - sy) * 0.75;
      }

      gl.uniform1f(U.time, now / 1000);
      gl.uniform1f(U.hover, hover);
      gl.uniform2f(U.mouse, pointer.x, pointer.y);
      gl.uniform2f(U.aspect, cA, 1);
      gl.uniform4f(U.cover, sx, sy, ox, oy);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src]);

  if (calm || fallback) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 80vw, 320px"
        priority
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label={alt}
    />
  );
}
