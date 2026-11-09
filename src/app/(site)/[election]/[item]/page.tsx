import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CandidateList } from "@/components/CandidateList";
import { RecommendationBadge } from "@/components/RecommendationBadge";
import { RichText } from "@/components/RichText";
import { ShareButton } from "@/components/ShareButton";
import { Sources } from "@/components/Sources";
import { getElectionBundle, getElections, getItem } from "@/lib/content";
import { formatElectionDate } from "@/lib/dates";
import { excerpt, extractSources } from "@/lib/portable-text";
import { describeRecommendation } from "@/lib/recommendation";
import { itemShortTitle, itemTitle, type BallotItem } from "@/lib/types";

type Params = Promise<{ election: string; item: string }>;

export async function generateStaticParams() {
  const elections = await getElections();
  const out: { election: string; item: string }[] = [];
  for (const e of elections) {
    const bundle = await getElectionBundle(e.slug);
    for (const g of bundle?.groups ?? []) {
      for (const s of g.sections) {
        for (const i of s.items) out.push({ election: e.slug, item: i.slug });
      }
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { election, item: itemSlug } = await params;
  const found = await getItem(election, itemSlug);
  if (!found) return {};
  const rec = describeRecommendation(found.item);
  const title = `${itemTitle(found.item)}: ${rec.label}`;
  return {
    title,
    description: found.item.summary ?? excerpt(found.item.deepDive, 200),
    openGraph: { title, description: found.item.summary ?? excerpt(found.item.deepDive, 200) },
  };
}

function neighbours(items: BallotItem[], slug: string) {
  const i = items.findIndex((x) => x.slug === slug);
  return { prev: i > 0 ? items[i - 1] : null, next: i >= 0 && i < items.length - 1 ? items[i + 1] : null };
}

async function ItemDetail({ params }: { params: Params }) {
  const { election: electionSlug, item: itemSlug } = await params;
  const found = await getItem(electionSlug, itemSlug);
  if (!found) notFound();
  const { bundle, group, section, item } = found;
  const rec = describeRecommendation(item);
  const all = bundle.groups.flatMap((g) => g.sections.flatMap((s) => s.items));
  const { prev, next } = neighbours(all, item.slug);
  const sources = extractSources(
    item.deepDive,
    item.kind === "measure" ? item.whosBehindIt : undefined,
    item.kind === "race" ? item.jobDescription : undefined,
  );
  const href = `/${electionSlug}/${item.slug}`;

  return (
    <article className="pt-8 pb-12 sm:pt-12">
      <nav aria-label="Breadcrumb" className="font-display text-[0.82rem] font-semibold text-ink-3">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={`/${electionSlug}`} className="hover:text-brand">
              {bundle.election.title}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/${electionSlug}#cat-${group.category}`} className="hover:text-brand">
              {group.label}
            </Link>
          </li>
          {section.title !== group.label && (
            <>
              <li aria-hidden>/</li>
              <li className="text-ink-2">{section.title}</li>
            </>
          )}
        </ol>
      </nav>

      <header className="mt-6">
        {item.kind === "race" && item.district && (
          <p className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-ink-3">{item.title}</p>
        )}
        <h1 className="font-display mt-1 text-[clamp(2rem,6vw,3.4rem)] leading-[1] font-bold tracking-tight text-ink">
          {item.kind === "race" ? (item.district ?? item.title) : item.kind === "judge" ? item.name : item.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <RecommendationBadge label={rec.label} tone={rec.tone} sr={rec.sr} size="lg" />
          <ShareButton path={href} title={itemTitle(item)} />
        </div>
        <p className="font-display mt-3 text-[0.82rem] text-ink-3">
          {formatElectionDate(bundle.election.date)} election
        </p>
      </header>

      {item.summary && <p className="mt-6 max-w-[var(--measure)] text-[1.15rem] leading-snug text-ink-2">{item.summary}</p>}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          {item.kind === "measure" && item.ballotLanguage?.length ? (
            <section aria-labelledby="ballot-lang" className="mb-8">
              <h2 id="ballot-lang" className="font-display mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink-3">
                Ballot language
              </h2>
              <div className="ballot-language">
                <RichText value={item.ballotLanguage} className="prose--small" />
              </div>
            </section>
          ) : null}

          {(section.description?.length || (item.kind === "race" && item.jobDescription?.length)) && (
            <details className="group mb-8">
              <summary className="font-display inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-ink-2 hover:text-ink">
                <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90">
                  <path d="M9 6l6 6-6 6" />
                </svg>
                What does this job do?
              </summary>
              <div className="reveal mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-4">
                <RichText value={section.description} className="prose--small prose--quiet" />
                {item.kind === "race" && <RichText value={item.jobDescription} className="prose--small prose--quiet mt-3" />}
              </div>
            </details>
          )}

          <section aria-labelledby="deep-dive">
            <h2 id="deep-dive" className="font-display mb-3 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-brand">
              {item.kind === "measure" ? "The deep dive" : "Why"}
            </h2>
            <RichText value={item.deepDive} className="text-[1.08rem]" />
            {item.kind === "measure" && item.whosBehindIt?.length ? (
              <div className="mt-8">
                <h2 className="font-display mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink-3">Who’s behind it?</h2>
                <RichText value={item.whosBehindIt} />
              </div>
            ) : null}
            <Sources sources={sources} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          {item.kind === "race" && item.candidates.length > 0 && (
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
              <h2 className="font-display mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-3">On the ballot</h2>
              <CandidateList candidates={item.candidates} recommendation={item.recommendation} />
            </div>
          )}
          {item.kind === "judge" && item.reviewUrl && (
            <a
              href={item.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display block rounded-[var(--radius-card)] border border-line bg-surface p-4 text-[0.9rem] font-semibold text-ink hover:border-line-strong"
            >
              Read the judicial performance review
              <span className="mt-1 block text-[0.75rem] font-normal text-ink-3">yourmissourijudges.org</span>
            </a>
          )}
        </aside>
      </div>

      <nav aria-label="Previous and next" className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? (
          <Link href={`/${electionSlug}/${prev.slug}`} className="group rounded-[var(--radius-sm)] border border-line bg-surface p-4 hover:border-line-strong">
            <span className="font-display block text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Previous</span>
            <span className="font-display mt-1 block font-bold text-ink group-hover:text-brand">{itemShortTitle(prev)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/${electionSlug}/${next.slug}`} className="group rounded-[var(--radius-sm)] border border-line bg-surface p-4 text-right hover:border-line-strong">
            <span className="font-display block text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Next</span>
            <span className="font-display mt-1 block font-bold text-ink group-hover:text-brand">{itemShortTitle(next)}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}

export default function ItemPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="animate-pulse pt-12" aria-hidden><div className="h-10 w-2/3 rounded-xl bg-surface-2" /><div className="mt-6 h-40 rounded-2xl bg-surface-2" /></div>}>
      <ItemDetail params={params} />
    </Suspense>
  );
}
