"use client";

import { useEffect, useState } from "react";
import { Rise } from "@/components/ui/Split";

const USER = "Sirmira1";
const CACHE_KEY = "gh-live-v1";
const CACHE_TTL = 60 * 60 * 1000; // 1h

type GhData = {
  repos: number;
  lastRepo: string | null;
  lastPush: string | null; // ISO
};

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "within the hour";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/**
 * Live proof of shipping, straight from the GitHub API.
 * Renders nothing until data arrives; disappears silently on failure.
 */
export default function GitHubLive() {
  const [data, setData] = useState<GhData | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { at, data } = JSON.parse(cached);
        if (Date.now() - at < CACHE_TTL) {
          setData(data);
          return;
        }
      } catch {
        /* refetch */
      }
    }

    const ctrl = new AbortController();
    (async () => {
      try {
        const [userRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${USER}`, { signal: ctrl.signal }),
          fetch(`https://api.github.com/users/${USER}/events/public?per_page=30`, {
            signal: ctrl.signal,
          }),
        ]);
        if (!userRes.ok) return;
        const user = await userRes.json();
        let lastRepo: string | null = null;
        let lastPush: string | null = null;
        if (eventsRes.ok) {
          const events: { type: string; repo?: { name: string }; created_at: string }[] =
            await eventsRes.json();
          const push = events.find((e) => e.type === "PushEvent");
          if (push?.repo) {
            lastRepo = push.repo.name.split("/")[1] ?? push.repo.name;
            lastPush = push.created_at;
          }
        }
        const d: GhData = { repos: user.public_repos ?? 0, lastRepo, lastPush };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: d }));
        setData(d);
      } catch {
        /* stay silent — the strip simply doesn't render */
      }
    })();
    return () => ctrl.abort();
  }, []);

  if (!data) return null;

  return (
    <Rise className="mt-16">
      <a
        href={`https://github.com/${USER}`}
        target="_blank"
        rel="noreferrer"
        data-cursor="GITHUB"
        className="group flex flex-wrap items-center justify-between gap-4 border-y border-line py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-dim transition-colors hover:text-ink"
      >
        <span className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
          </span>
          LIVE FROM GITHUB
        </span>
        <span>{data.repos} PUBLIC REPOS</span>
        {data.lastRepo && data.lastPush && (
          <span>
            LAST PUSH: <span className="text-ink/80">{data.lastRepo}</span> —{" "}
            {relative(data.lastPush)}
          </span>
        )}
        <span className="text-ember opacity-0 transition-opacity group-hover:opacity-100">
          github.com/{USER} ↗
        </span>
      </a>
    </Rise>
  );
}
