import type { Tone } from "@/lib/recommendation";

const toneClasses: Record<Tone, string> = {
  yes: "bg-yes-bg text-yes",
  no: "bg-no-bg text-no",
  neutral: "bg-neutral-bg text-neutral",
  muted: "bg-muted-bg text-muted",
};

export function RecommendationBadge({
  label,
  tone,
  sr,
  size = "md",
  className = "",
}: {
  label: string;
  tone: Tone;
  sr?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-[0.72rem] px-2 py-0.5",
    md: "text-[0.8rem] px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  }[size];
  return (
    <span
      className={`font-display inline-flex max-w-full items-center gap-1.5 rounded-full font-semibold uppercase tracking-[0.04em] whitespace-nowrap ${toneClasses[tone]} ${sizes} ${className}`}
    >
      <span aria-hidden className="block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span className="truncate">
        {sr ? <span className="sr-only">{sr} </span> : null}
        <span aria-hidden={Boolean(sr)}>{label}</span>
      </span>
    </span>
  );
}
