import { Countdown } from "./Countdown";
import type { Election } from "@/lib/types";

export function ElectionHero({ election, itemCount }: { election: Election; itemCount: number }) {
  return (
    <header className="pt-10 pb-8 sm:pt-16 sm:pb-12">
      <Countdown date={election.date} />
      <h1 className="font-display mt-5 text-[clamp(2.6rem,9vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-ink">
        {election.title}
      </h1>
      {election.subtitle && (
        <p className="mt-5 max-w-[34ch] text-[clamp(1.1rem,2.4vw,1.4rem)] leading-snug text-ink-2">{election.subtitle}</p>
      )}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href="#ballot"
          className="font-display inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[0.95rem] font-semibold text-brand-ink shadow-[var(--shadow-card)] transition hover:bg-brand-strong"
        >
          See the ballot
          <span className="rounded-full bg-brand-ink/15 px-2 py-0.5 text-[0.8rem] tabular-nums">{itemCount}</span>
        </a>
        {election.helpItems?.length ? (
          <a
            href="#help"
            className="font-display inline-flex items-center rounded-full border border-line bg-surface px-5 py-3 text-[0.95rem] font-semibold text-ink hover:border-line-strong"
          >
            Where to help
          </a>
        ) : null}
      </div>
    </header>
  );
}
