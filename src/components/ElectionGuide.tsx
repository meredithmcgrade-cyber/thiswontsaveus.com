import { CategoryBlock } from "./BallotSection";
import { CategoryNav, type NavEntry } from "./CategoryNav";
import { ElectionHero } from "./ElectionHero";
import { HelpNow } from "./HelpNow";
import { QuickViewProvider } from "./QuickView";
import { RichText } from "./RichText";
import type { ElectionBundle } from "@/lib/types";

export function ElectionGuide({ bundle }: { bundle: ElectionBundle }) {
  const { election, groups, itemCount } = bundle;
  const nav: NavEntry[] = groups.map((g) => ({
    id: `cat-${g.category}`,
    label: g.label,
    count: g.sections.reduce((n, s) => n + s.items.length, 0),
  }));

  return (
    <>
      <ElectionHero election={election} itemCount={itemCount} />

      {election.intro?.length ? (
        <section aria-labelledby="intro-title" className="mb-10">
          <h2 id="intro-title" className="font-display mb-3 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-brand">
            Don’t skip this
          </h2>
          <RichText value={election.intro} className="text-[1.1rem]" />
        </section>
      ) : null}

      <div className="mb-14">
        <HelpNow election={election} />
      </div>

      <QuickViewProvider>
        <div id="ballot" className="scroll-mt-[var(--header-h)]">
          <CategoryNav entries={nav} />
          <div className="mt-10 flex flex-col gap-16">
            {groups.map((g) => (
              <CategoryBlock key={g.category} group={g} electionSlug={election.slug} />
            ))}
          </div>
        </div>
      </QuickViewProvider>

      {election.methodology?.length ? (
        <section aria-labelledby="method-title" className="mt-20 border-t border-line pt-10">
          <h2 id="method-title" className="font-display mb-4 text-[clamp(1.5rem,3.5vw,2rem)] leading-none font-bold tracking-tight text-ink">
            About this guide
          </h2>
          <RichText value={election.methodology} className="prose--small" />
        </section>
      ) : null}
    </>
  );
}
