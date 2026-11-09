import type { Source } from "@/lib/portable-text";

export function Sources({ sources, compact = false }: { sources: Source[]; compact?: boolean }) {
  if (!sources.length) return null;
  return (
    <div className="mt-5 border-t border-line pt-4">
      <h4 className="font-display mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
        Sources ({sources.length})
      </h4>
      <ol className={`grid gap-x-6 gap-y-1.5 ${compact ? "" : "sm:grid-cols-2"}`}>
        {sources.map((s, i) => (
          <li key={s.url} className="flex gap-2 text-[0.85rem] leading-snug">
            <span className="font-display w-5 shrink-0 text-right tabular-nums text-ink-3">{i + 1}.</span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 text-ink-2 underline decoration-line-strong underline-offset-[3px] hover:text-brand hover:decoration-current"
            >
              <span className="line-clamp-2">{s.label}</span>
              <span className="font-display block text-[0.72rem] text-ink-3 no-underline">{s.host}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
