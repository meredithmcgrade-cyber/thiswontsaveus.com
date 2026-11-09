import { BallotItemCard } from "./BallotItemCard";
import { RichText } from "./RichText";
import type { Category, CategoryGroup, SectionWithItems } from "@/lib/types";

const DESCRIPTION_LABEL: Partial<Record<Category, string>> = {
  judges: "About this court",
  ballot: "About these questions",
};

export function CategoryBlock({ group, electionSlug }: { group: CategoryGroup; electionSlug: string }) {
  return (
    <section
      id={`cat-${group.category}`}
      data-category={group.category}
      aria-labelledby={`cat-${group.category}-title`}
      className="scroll-mt-[calc(var(--header-h)+64px)]"
    >
      <h2
        id={`cat-${group.category}-title`}
        className="font-display mb-6 text-[clamp(1.8rem,4vw,2.4rem)] leading-none font-bold tracking-tight text-ink"
      >
        {group.label}
      </h2>
      <div className="flex flex-col gap-10">
        {group.sections.map((s) => (
          <BallotSection key={s._id} section={s} electionSlug={electionSlug} showTitle={group.sections.length > 1 || s.title !== group.label} />
        ))}
      </div>
    </section>
  );
}

export function BallotSection({
  section,
  electionSlug,
  showTitle = true,
}: {
  section: SectionWithItems;
  electionSlug: string;
  showTitle?: boolean;
}) {
  return (
    <div id={`sec-${section.slug}`} className="scroll-mt-[calc(var(--header-h)+64px)]">
      {showTitle && (
        <h3 className="font-display mb-3 text-[1.15rem] font-bold text-ink">
          {section.title}
          <span className="ml-2 align-middle text-[0.75rem] font-semibold tracking-wide text-ink-3 uppercase">
            {section.items.length} {section.items.length === 1 ? "item" : "items"}
          </span>
        </h3>
      )}
      {section.description?.length ? (
        <details className="quick-hide group mb-4">
          <summary className="font-display inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-ink-2 hover:text-ink">
            <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90">
              <path d="M9 6l6 6-6 6" />
            </svg>
            {DESCRIPTION_LABEL[section.category] ?? "What does this job do?"}
          </summary>
          <div className="reveal mt-2 rounded-[var(--radius-sm)] bg-surface-2 p-4">
            <RichText value={section.description} className="prose--small prose--quiet" />
          </div>
        </details>
      ) : null}
      <div className="flex flex-col gap-3">
        {section.items.map((item) => (
          <BallotItemCard key={item._id} item={item} electionSlug={electionSlug} />
        ))}
      </div>
    </div>
  );
}
