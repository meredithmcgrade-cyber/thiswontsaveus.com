import type { PortableTextBlock } from "@portabletext/react";

export interface Source {
  url: string;
  label: string;
  host: string;
}

type Span = { _type: string; text?: string; marks?: string[] };
type MarkDef = { _key: string; _type: string; href?: string };

/** Plain text of a Portable Text array, for excerpts and descriptions. */
export function toPlainText(blocks?: PortableTextBlock[]): string {
  if (!blocks) return "";
  return blocks
    .map((b) => ((b as { children?: Span[] }).children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n")
    .trim();
}

export function excerpt(blocks: PortableTextBlock[] | undefined, max = 160): string {
  const t = toPlainText(blocks).replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 40)).trimEnd() + "…";
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Every link in the given blocks, deduplicated, in reading order. */
export function extractSources(...groups: (PortableTextBlock[] | undefined)[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const blocks of groups) {
    for (const b of blocks ?? []) {
      const block = b as { markDefs?: MarkDef[]; children?: Span[] };
      const defs = new Map((block.markDefs ?? []).filter((d) => d._type === "link" && d.href).map((d) => [d._key, d.href!]));
      if (!defs.size) continue;
      for (const child of block.children ?? []) {
        for (const m of child.marks ?? []) {
          const href = defs.get(m);
          if (!href || seen.has(href)) continue;
          if (href.startsWith("mailto:")) continue;
          seen.add(href);
          const label = (child.text ?? "").trim();
          out.push({ url: href, label: label.length > 2 ? label : hostOf(href), host: hostOf(href) });
        }
      }
    }
  }
  return out;
}
