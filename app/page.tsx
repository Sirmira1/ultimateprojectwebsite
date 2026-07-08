"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import Intro from "@/components/sections/Intro";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Career from "@/components/sections/Career";
import Playground from "@/components/sections/Playground";
import Contact from "@/components/sections/Contact";

// the WebGL world is client-only and code-split away from first paint
const Scene = dynamic(() => import("@/components/gl/Scene"), { ssr: false });

export default function Home() {
  const [started, setStarted] = useState(false);
  const onPreloaderDone = useCallback(() => setStarted(true), []);

  return (
    <SmoothScroll>
      <Scene />
      <Preloader onDone={onPreloaderDone} />
      <Cursor />
      <Header visible={started} />

      <main id="main" className="relative z-10">
        <Intro />
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Career />
        <Playground />
        <Contact />
      </main>
    </SmoothScroll>
  );
}
