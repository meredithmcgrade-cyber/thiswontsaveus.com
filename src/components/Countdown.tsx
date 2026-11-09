"use client";

import { useClientValue } from "@/lib/use-client-store";
import { daysUntil, formatElectionDate } from "@/lib/dates";

/** Renders on the client so the static page never bakes in a stale day count. */
export function Countdown({ date }: { date: string }) {
  const days = useClientValue<number | null>(() => daysUntil(date), null);

  const pretty = formatElectionDate(date, { weekday: "long", month: "long", day: "numeric" });
  let text: string;
  if (days === null) text = `Election day is ${pretty}`;
  else if (days > 1) text = `${days} days until election day, ${pretty}`;
  else if (days === 1) text = `Election day is tomorrow, ${pretty}`;
  else if (days === 0) text = `Election day is today. Polls are open 6 a.m. to 7 p.m.`;
  else text = `This election was held on ${formatElectionDate(date)}`;

  return (
    <p className="font-display inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.85rem] font-semibold text-ink-2">
      <span aria-hidden className={`block h-2 w-2 rounded-full ${days !== null && days < 0 ? "bg-line-strong" : "bg-brand"}`} />
      {text}
    </p>
  );
}
