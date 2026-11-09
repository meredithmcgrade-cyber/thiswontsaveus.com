import type { Metadata } from "next";
import Link from "next/link";
import { getElectionBundle, getElections } from "@/lib/content";
import { formatElectionDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Past elections",
  description: "Every guide, by election.",
};

export default async function ElectionsPage() {
  const elections = await getElections();
  const bundles = await Promise.all(elections.map((e) => getElectionBundle(e.slug)));

  return (
    <div className="pt-10 pb-12 sm:pt-16">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-none font-bold tracking-tight text-ink">Elections</h1>
      <p className="mt-4 max-w-[46ch] text-ink-2">Every guide stays up after election day so you can see how the picks held up.</p>
      <ul className="mt-10 flex flex-col gap-3">
        {elections.map((e, i) => {
          const count = bundles[i]?.itemCount ?? 0;
          return (
            <li key={e._id}>
              <Link
                href={`/${e.slug}`}
                className="group flex flex-col gap-1 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition hover:border-line-strong sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                    {formatElectionDate(e.date)}
                    {e.status === "live" && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-brand">Current</span>}
                  </p>
                  <p className="font-display mt-1 text-[1.25rem] font-bold text-ink group-hover:text-brand">{e.title}</p>
                  {e.subtitle && <p className="mt-1 text-[0.95rem] text-ink-2">{e.subtitle}</p>}
                </div>
                <span className="font-display shrink-0 text-[0.85rem] font-semibold text-ink-3">{count} items</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
