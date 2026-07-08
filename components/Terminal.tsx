"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS, SKILLS, SOCIALS, EMAIL } from "@/lib/data";
import { world } from "@/lib/world";
import { audio } from "@/lib/audio";
import { toggleCalm } from "@/lib/calm";

type LogLine = { text: string; kind?: "in" | "ember" | "dim" };

const BANNER: LogLine[] = [
  { text: "OBSERVATORY CONSOLE v2.6 — nikola@observatory", kind: "ember" },
  { text: "type 'help' to see what this thing can do", kind: "dim" },
];

const HELP: LogLine[] = [
  { text: "help ............ this list" },
  { text: "whoami .......... who is nikola" },
  { text: "projects ........ list shipped work" },
  { text: "open <name> ..... open a project (e.g. open lusso)" },
  { text: "goto <section> .. fly there (who/work/craft/path/lab/talk)" },
  { text: "skills .......... the toolbox" },
  { text: "socials ......... where else to find me" },
  { text: "contact ......... start an email" },
  { text: "sign ............ leave your mark in the void" },
  { text: "boom ............ do not press" },
  { text: "calm ............ toggle calm mode (no effects)" },
  { text: "sudo hire nikola  worth a try" },
  { text: "clear / exit" },
];

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<LogLine[]>(BANNER);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const histIdx = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // open with "/" or backtick anywhere; also via custom event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if ((e.key === "/" || e.key === "`") && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-terminal", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-terminal", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    inputRef.current?.focus();
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("keydown", onEsc);
      window.__lenis?.start();
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [log]);

  const print = (lines: LogLine[]) => setLog((l) => [...l, ...lines]);

  const goto = (id: string) => {
    const map: Record<string, string> = {
      who: "#about", work: "#work", craft: "#craft",
      path: "#path", lab: "#lab", talk: "#talk", top: "#top",
    };
    const href = map[id];
    if (!href) return false;
    setOpen(false);
    setTimeout(() => {
      window.__lenis?.scrollTo(href, { duration: 1.8 });
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 250);
    return true;
  };

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    print([{ text: `> ${raw}`, kind: "in" }]);
    audio.hover();
    const [head, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");

    switch (head) {
      case "help":
        print(HELP);
        break;
      case "whoami":
        print([
          { text: "Nikola Anastasijević — software developer, Hamilton, Ontario, Canada." },
          { text: "Mohawk College (559) · co-op @ MPBSDP · ships real things." },
          { text: "Current status: probably building. Or driving.", kind: "dim" },
        ]);
        break;
      case "projects":
      case "ls":
        print(
          PROJECTS.map((p) => ({
            text: `${p.index}  ${p.title.padEnd(16)} ${p.year.padEnd(12)} ${p.tags.join(", ")}`,
          }))
        );
        print([{ text: "open <name> to visit", kind: "dim" }]);
        break;
      case "open": {
        const p = PROJECTS.find((p) => p.title.toLowerCase().includes(arg));
        if (p?.href) {
          print([{ text: `opening ${p.title.toLowerCase()}…`, kind: "ember" }]);
          window.open(p.href, "_blank", "noopener");
        } else {
          print([{ text: `unknown project '${arg}' — try 'projects'`, kind: "dim" }]);
        }
        break;
      }
      case "goto":
        if (!goto(arg)) print([{ text: `unknown section '${arg}'`, kind: "dim" }]);
        break;
      case "skills":
        print(
          SKILLS.map((g) => ({ text: `${g.label.padEnd(10)} ${g.items.join(" · ")}` }))
        );
        break;
      case "socials":
        print(SOCIALS.map((s) => ({ text: `${s.label.padEnd(10)} ${s.href}` })));
        break;
      case "contact":
      case "email":
        print([{ text: `opening mail to ${EMAIL}…`, kind: "ember" }]);
        window.location.href = `mailto:${EMAIL}`;
        break;
      case "sign":
        setOpen(false);
        setTimeout(() => window.dispatchEvent(new Event("open-guestbook")), 250);
        break;
      case "boom":
        print([{ text: "detonating…", kind: "ember" }]);
        world.clickAt = { x: 0, y: 0, t: performance.now() / 1000, power: 3.2 };
        audio.click();
        break;
      case "sudo":
        if (arg.startsWith("hire")) {
          print([
            { text: "PERMISSION GRANTED.", kind: "ember" },
            { text: `drafting offer letter… just kidding — email ${EMAIL}` },
          ]);
        } else {
          print([{ text: "nice try. this incident will be reported.", kind: "dim" }]);
        }
        break;
      case "calm":
        print([{ text: "switching mode…", kind: "ember" }]);
        setTimeout(() => toggleCalm(), 400);
        break;
      case "clear":
        setLog([]);
        break;
      case "exit":
      case "quit":
        setOpen(false);
        break;
      default:
        print([{ text: `command not found: ${head} — try 'help'`, kind: "dim" }]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      if (value.trim()) {
        setHistory((h) => [value, ...h].slice(0, 40));
      }
      histIdx.current = -1;
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx.current + 1, history.length - 1);
      if (history[next] !== undefined) {
        histIdx.current = next;
        setValue(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx.current - 1;
      histIdx.current = Math.max(next, -1);
      setValue(next >= 0 ? history[next] : "");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[360] flex items-end justify-center bg-void/60 p-4 backdrop-blur-[2px] sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-label="Console"
        >
          <motion.div
            className="flex max-h-[70vh] w-[min(94vw,720px)] flex-col overflow-hidden rounded-sm border border-ink/15 bg-void/95 shadow-[0_0_80px_rgba(255,92,40,0.07)]"
            initial={{ y: 24, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.3em] text-dim">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                OBSERVATORY CONSOLE
              </span>
              <span>ESC to close</span>
            </div>

            <div
              ref={scrollRef}
              data-lenis-prevent
              className="min-h-48 flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
            >
              {log.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.kind === "ember"
                      ? "text-ember"
                      : l.kind === "dim"
                        ? "text-ink/40"
                        : l.kind === "in"
                          ? "text-ink"
                          : "text-ink/75"
                  }
                >
                  {l.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-xs">
              <span className="text-ember">&gt;</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 bg-transparent text-ink caret-ember outline-none placeholder:text-ink/25"
                placeholder="help"
                spellCheck={false}
                autoComplete="off"
                aria-label="Console input"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
