"use client";

import { createContext, useContext } from "react";
import { notifyClientStore, useClientValue } from "@/lib/use-client-store";

function readQuick(): boolean {
  try {
    return localStorage.getItem("quickView") === "1";
  } catch {
    return false;
  }
}

const QuickViewContext = createContext<{ quick: boolean; setQuick: (v: boolean) => void }>({
  quick: false,
  setQuick: () => {},
});

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const quick = useClientValue(readQuick, false);

  function setQuick(v: boolean) {
    try {
      localStorage.setItem("quickView", v ? "1" : "0");
    } catch {}
    notifyClientStore();
  }

  return (
    <QuickViewContext.Provider value={{ quick, setQuick }}>
      <div data-quick={quick ? "true" : "false"}>{children}</div>
    </QuickViewContext.Provider>
  );
}

export const useQuickView = () => useContext(QuickViewContext);

export function QuickViewToggle() {
  const { quick, setQuick } = useQuickView();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={quick}
      onClick={() => setQuick(!quick)}
      className="font-display group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-1 pl-3 text-[0.8rem] font-semibold text-ink-2 transition hover:border-line-strong"
      title="Quick view shows only the recommendations"
    >
      <span>Quick view</span>
      <span
        aria-hidden
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition ${quick ? "bg-brand" : "bg-line"}`}
      >
        <span
          className={`absolute h-5 w-5 rounded-full bg-surface shadow transition-transform ${quick ? "translate-x-[18px]" : "translate-x-[2px]"}`}
        />
      </span>
    </button>
  );
}
