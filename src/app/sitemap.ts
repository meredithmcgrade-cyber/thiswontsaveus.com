import type { MetadataRoute } from "next";
import { getElectionBundle, getElections } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://thiswontsaveus.com";
  const elections = await getElections();
  const out: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/elections`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.3 },
  ];
  for (const e of elections) {
    out.push({ url: `${base}/${e.slug}`, changeFrequency: "weekly", priority: 0.9 });
    const bundle = await getElectionBundle(e.slug);
    for (const g of bundle?.groups ?? [])
      for (const s of g.sections)
        for (const i of s.items) out.push({ url: `${base}/${e.slug}/${i.slug}`, changeFrequency: "weekly", priority: 0.7 });
  }
  return out;
}
