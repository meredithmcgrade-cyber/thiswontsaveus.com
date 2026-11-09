import { RichText } from "./RichText";
import type { Election } from "@/lib/types";

export function HelpNow({ election }: { election: Election }) {
  const items = election.helpItems ?? [];
  if (!items.length) return null;
  return (
    <section id="help" aria-labelledby="help-title" className="scroll-mt-[calc(var(--header-h)+24px)]">
      <div className="rounded-[var(--radius-card)] bg-brand-soft p-5 sm:p-7">
        <h2 id="help-title" className="font-display text-[clamp(1.5rem,3.5vw,2rem)] leading-none font-bold tracking-tight text-ink">
          Where to help right now
        </h2>
        {election.helpIntro?.length ? <RichText value={election.helpIntro} className="mt-3 prose--small" /> : null}
        <ul className="mt-5 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((h) => (
            <li key={h._key} className="flex flex-col rounded-[var(--radius-sm)] bg-surface p-4 shadow-[var(--shadow-card)]">
              <h3 className="font-display text-[1.05rem] leading-snug font-bold text-ink">{h.title}</h3>
              {h.body?.length ? <RichText value={h.body} className="mt-2 prose--small" /> : null}
              {h.links?.length ? (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {h.links.map((l) => (
                    <li key={l._key}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display group flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-brand-soft px-3 py-2 text-[0.85rem] leading-snug font-semibold text-brand transition hover:bg-brand hover:text-brand-ink"
                      >
                        <span>{l.label.replace(/\s+-\s+/g, " · ")}</span>
                        <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform group-hover:translate-x-0.5">
                          <path d="M7 17L17 7M8 7h9v9" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
