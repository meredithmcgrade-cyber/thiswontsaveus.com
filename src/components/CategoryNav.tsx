"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { QuickViewToggle } from "./QuickView";

export interface NavEntry {
  id: string;
  label: string;
  count: number;
}

export function CategoryNav({ entries }: { entries: NavEntry[] }) {
  const [active, setActive] = useState<string>(entries[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // Scroll spy: the section whose top is nearest below the sticky bar wins.
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      // Look the sections up every time: the nodes can be swapped during
      // streaming/hydration, so a cached list could point at detached elements.
      const offset = 140;
      let current = entries[0]?.id ?? "";
      for (const e of entries) {
        const el = document.getElementById(e.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = e.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    onScroll();
    const settle = setTimeout(compute, 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [entries]);

  // Keep the active chip visible inside the horizontal scroller.
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !chip) return;
    const target = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  function go(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.replaceState(null, "", `#${id}`);
    if (lenis) lenis.scrollTo(el, { offset: -120 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="sticky top-[var(--header-h)] z-30 -mx-4 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70 sm:mx-0 sm:rounded-full sm:border">
      <div className="flex items-center gap-2 px-4 py-2 sm:px-2">
        <nav aria-label="Ballot sections" className="min-w-0 flex-1">
          <div ref={listRef} className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {entries.map((e) => {
              const isActive = e.id === active;
              return (
                <a
                  key={e.id}
                  data-id={e.id}
                  href={`#${e.id}`}
                  onClick={(ev) => go(ev, e.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`font-display inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.82rem] font-semibold whitespace-nowrap transition ${
                    isActive ? "bg-ink text-bg" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  {e.label}
                  <span className={`tabular-nums ${isActive ? "opacity-70" : "text-ink-3"}`}>{e.count}</span>
                </a>
              );
            })}
          </div>
        </nav>
        <div className="shrink-0">
          <QuickViewToggle />
        </div>
      </div>
    </div>
  );
}
