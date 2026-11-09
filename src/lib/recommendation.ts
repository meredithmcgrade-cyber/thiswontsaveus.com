import type { BallotItem, Recommendation } from "./types";

export type Tone = "yes" | "no" | "neutral" | "muted";

export interface RecommendationDisplay {
  /** Short label for badges, e.g. "Vote Jordan Herrera", "Retain", "HELL NO" */
  label: string;
  /** Even shorter form for compact quick view */
  short: string;
  tone: Tone;
  /** Screen reader friendly sentence */
  sr: string;
}

export function describeRecommendation(item: BallotItem): RecommendationDisplay {
  const r: Recommendation = item.recommendation ?? { kind: "none" };
  switch (r.kind) {
    case "candidate": {
      const name = r.candidateName ?? r.label ?? "";
      return {
        label: name,
        short: name,
        tone: "yes",
        sr: `Recommendation: vote for ${name}`,
      };
    }
    case "abstain":
      return {
        label: r.label ?? "Abstain",
        short: r.label ?? "Abstain",
        tone: "neutral",
        sr: `Recommendation: ${r.label ?? "abstain"}`,
      };
    case "uncontested": {
      const only = item.kind === "race" ? item.candidates?.[0]?.name : undefined;
      return {
        label: only ?? "Uncontested",
        short: "Uncontested",
        tone: "muted",
        sr: only ? `Uncontested race. ${only} is the only candidate.` : "Uncontested race.",
      };
    }
    case "retain":
      return { label: r.label ?? "Retain", short: "Retain", tone: "yes", sr: "Recommendation: retain" };
    case "doNotRetain":
      return {
        label: r.label ?? "Do not retain",
        short: "Do not retain",
        tone: "no",
        sr: "Recommendation: do not retain",
      };
    case "yes":
      return { label: r.label ?? "Yes", short: r.label ?? "Yes", tone: "yes", sr: "Recommendation: vote yes" };
    case "strongYes":
      return {
        label: r.label ?? "Hell yes",
        short: r.label ?? "Hell yes",
        tone: "yes",
        sr: "Recommendation: strong yes",
      };
    case "no":
      return { label: r.label ?? "No", short: r.label ?? "No", tone: "no", sr: "Recommendation: vote no" };
    case "strongNo":
      return {
        label: r.label ?? "Hell no",
        short: r.label ?? "Hell no",
        tone: "no",
        sr: "Recommendation: strong no",
      };
    default:
      return {
        label: r.label ?? "No recommendation",
        short: r.label ?? "No rec",
        tone: "muted",
        sr: "No recommendation",
      };
  }
}
