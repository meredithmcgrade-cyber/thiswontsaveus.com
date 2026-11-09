import { PARTY_LABELS, type Candidate, type Party, type Recommendation } from "@/lib/types";

const partyVar: Record<Party, string> = {
  D: "var(--party-d)",
  R: "var(--party-r)",
  L: "var(--party-l)",
  G: "var(--party-g)",
  I: "var(--party-i)",
  NP: "var(--party-i)",
};

function isPick(c: Candidate, rec: Recommendation) {
  if (rec.kind !== "candidate") return false;
  if (rec.candidateKey && rec.candidateKey === c._key) return true;
  if (!rec.candidateName) return false;
  const a = rec.candidateName.toLowerCase().trim();
  const b = c.name.toLowerCase();
  return b === a || b.includes(a) || a.includes(b.split(" ").slice(-1)[0]);
}

export function CandidateList({
  candidates,
  recommendation,
  compact = false,
}: {
  candidates: Candidate[];
  recommendation: Recommendation;
  compact?: boolean;
}) {
  if (!candidates?.length) return null;
  return (
    <ul className={`flex flex-col ${compact ? "gap-1" : "gap-1.5"}`} aria-label="Candidates">
      {candidates.map((c) => {
        const pick = isPick(c, recommendation);
        return (
          <li key={c._key} className="flex items-baseline gap-2 text-[0.95rem] leading-snug">
            <span
              aria-hidden
              className="relative top-[1px] inline-flex h-4 w-4 shrink-0 items-center justify-center"
            >
              {pick ? (
                <svg viewBox="0 0 16 16" width="16" height="16" className="text-yes" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5l3 3 7-7" />
                </svg>
              ) : (
                <span className="block h-1 w-1 rounded-full bg-line-strong" />
              )}
            </span>
            <span className={pick ? "font-display font-semibold text-ink" : "text-ink-2"}>
              {c.website ? (
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-[3px] hover:decoration-current">
                  {c.name}
                </a>
              ) : (
                c.name
              )}
              {pick && <span className="sr-only"> (recommended)</span>}
            </span>
            {c.party && (
              <span
                className="font-display inline-flex items-center gap-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-3"
                title={PARTY_LABELS[c.party]}
              >
                <span aria-hidden className="block h-1.5 w-1.5 rounded-full" style={{ background: partyVar[c.party] }} />
                <span className="sr-only">{PARTY_LABELS[c.party]}</span>
                <span aria-hidden>{c.party}</span>
              </span>
            )}
            {c.incumbent && <span className="font-display text-[0.7rem] uppercase tracking-wide text-ink-3">Incumbent</span>}
            {c.writeIn && <span className="font-display text-[0.7rem] uppercase tracking-wide text-ink-3">Write-in</span>}
            {c.note && !compact && <span className="text-sm text-ink-3">{c.note}</span>}
          </li>
        );
      })}
    </ul>
  );
}
