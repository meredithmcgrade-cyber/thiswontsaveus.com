"use client";

import { useEffect, useState } from "react";

export function ShareButton({ path, title, className = "" }: { path: string; title: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(t);
  }, [state]);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setState("shared");
        return;
      }
    } catch {
      /* user cancelled */
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`font-display inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.8rem] font-semibold text-ink-2 transition hover:border-line-strong hover:text-ink ${className}`}
      aria-live="polite"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M16 6l-4-4-4 4M12 2v13" />
      </svg>
      {state === "copied" ? "Link copied" : state === "shared" ? "Shared" : "Share"}
    </button>
  );
}
