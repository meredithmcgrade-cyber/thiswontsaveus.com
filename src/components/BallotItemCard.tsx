import Link from "next/link";
import { CandidateList } from "./CandidateList";
import { RecommendationBadge } from "./RecommendationBadge";
import { RichText } from "./RichText";
import { ShareButton } from "./ShareButton";
import { Sources } from "./Sources";
import { describeRecommendation } from "@/lib/recommendation";
import { excerpt, extractSources } from "@/lib/portable-text";
import { itemTitle, type BallotItem } from "@/lib/types";

function headingParts(item: BallotItem): { eyebrow?: string; heading: string } {
  if (item.kind === "race") {
    return item.district ? { eyebrow: item.title, heading: item.district } : { heading: item.title };
  }
  if (item.kind === "judge") return { heading: item.name };
  return { heading: item.title };
}

export function BallotItemCard({
  item,
  electionSlug,
  defaultOpen = false,
}: {
  item: BallotItem;
  electionSlug: string;
  defaultOpen?: boolean;
}) {
  const rec = describeRecommendation(item);
  const { eyebrow, heading } = headingParts(item);
  const href = `/${electionSlug}/${item.slug}`;
  const sources = extractSources(
    item.deepDive,
    item.kind === "measure" ? item.whosBehindIt : undefined,
    item.kind === "race" ? item.jobDescription : undefined,
  );
  const hasBody =
    Boolean(item.deepDive?.length) ||
    (item.kind === "measure" && Boolean(item.whosBehindIt?.length || item.ballotLanguage?.length));

  return (
    <article
      id={item.slug}
      className="item-card scroll-mt-[calc(var(--header-h)+72px)] rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5"
      aria-labelledby={`${item.slug}-title`}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-[12rem] flex-1">
          {(eyebrow || item.recommendation.kind === "uncontested") && (
            <p className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
              {eyebrow}
              {eyebrow && item.recommendation.kind === "uncontested" ? " · " : ""}
              {item.recommendation.kind === "uncontested" ? "Uncontested" : ""}
            </p>
          )}
          <h3 id={`${item.slug}-title`} className="font-display text-[1.2rem] leading-tight font-bold text-ink">
            <Link href={href} className="hover:text-brand">
              {heading}
            </Link>
          </h3>
        </div>
        <RecommendationBadge label={rec.label} tone={rec.tone} sr={rec.sr} className="shrink-0" />
      </header>

      {(() => {
        // A hand-written summary wins. Judges and measures fall back to the
        // opening of the deep dive so quick view still says something.
        const teaser = item.summary ?? (item.kind !== "race" ? excerpt(item.deepDive, 150) : "");
        return teaser ? <p className="mt-2 text-[0.95rem] leading-snug text-ink-2">{teaser}</p> : null;
      })()}

      {item.kind === "race" && item.candidates.length > 0 && (
        <div className="quick-hide mt-3">
          <CandidateList candidates={item.candidates} recommendation={item.recommendation} />
        </div>
      )}

      {item.kind === "judge" && item.reviewUrl && (
        <p className="quick-hide mt-2 text-[0.85rem]">
          <a href={item.reviewUrl} target="_blank" rel="noopener noreferrer" className="text-ink-2 underline decoration-line-strong underline-offset-[3px] hover:text-brand">
            Judicial performance review
          </a>
        </p>
      )}

      {item.kind === "measure" && item.ballotLanguage?.length ? (
        <details className="quick-hide mt-3 group">
          <summary className="font-display inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-ink-2 hover:text-ink">
            <Chevron />
            Ballot language
          </summary>
          <div className="reveal ballot-language mt-2">
            <RichText value={item.ballotLanguage} className="prose--small" />
          </div>
        </details>
      ) : null}

      {hasBody && (
        <details className="quick-hide mt-3 group" open={defaultOpen}>
          <summary className="font-display inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[0.85rem] font-semibold text-brand hover:bg-[color-mix(in_srgb,var(--brand-soft),var(--brand)_10%)]">
            <Chevron />
            {item.kind === "measure" ? "The deep dive" : "Why"}
          </summary>
          <div className="reveal mt-4">
            {item.kind === "race" && item.jobDescription?.length ? (
              <RichText value={item.jobDescription} className="prose--small prose--quiet mb-4" />
            ) : null}
            <RichText value={item.deepDive} />
            {item.kind === "measure" && item.whosBehindIt?.length ? (
              <div className="mt-5">
                <h4 className="font-display mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                  Who’s behind it?
                </h4>
                <RichText value={item.whosBehindIt} className="prose--small" />
              </div>
            ) : null}
            <Sources sources={sources} />
            <footer className="mt-4 flex flex-wrap items-center gap-2">
              <ShareButton path={href} title={itemTitle(item)} />
              <Link
                href={href}
                className="font-display inline-flex items-center rounded-full border border-line bg-surface px-3 py-1.5 text-[0.8rem] font-semibold text-ink-2 hover:border-line-strong hover:text-ink"
              >
                Open page
              </Link>
            </footer>
          </div>
        </details>
      )}
    </article>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform group-open:rotate-90"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
