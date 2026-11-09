import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";
import type { PortableTextBlock } from "@portabletext/react";
import { client } from "@/sanity/client";
import { sanityConfigured } from "@/sanity/env";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type BallotItem,
  type Candidate,
  type Category,
  type CategoryGroup,
  type Election,
  type ElectionBundle,
  type HelpItem,
  type Recommendation,
  type Section,
  type SectionWithItems,
  type SiteSettings,
} from "./types";

export const CONTENT_TAG = "content";

/* -------------------------------------------------------------------------- */
/* Raw document loading                                                        */
/* -------------------------------------------------------------------------- */

// Loose shape shared by Sanity documents and the local seed JSON.
type RawDoc = {
  _id: string;
  _type: string;
  [key: string]: unknown;
};

const DOC_TYPES = ["siteSettings", "election", "section", "race", "judge", "measure"];

async function loadFromSeed(): Promise<RawDoc[]> {
  const dir = path.join(process.cwd(), "src", "content", "seed");
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const docs: RawDoc[] = [];
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(dir, f), "utf8"));
    const arr: RawDoc[] = Array.isArray(raw) ? raw : raw.documents ?? [];
    docs.push(...arr);
  }
  return docs;
}

async function loadFromSanity(): Promise<RawDoc[]> {
  const query = `*[_type in $types && !(_id in path("drafts.**"))]`;
  return client.fetch<RawDoc[]>(query, { types: DOC_TYPES });
}

async function loadAllDocs(): Promise<RawDoc[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return sanityConfigured ? loadFromSanity() : loadFromSeed();
}

/* -------------------------------------------------------------------------- */
/* Normalisation                                                               */
/* -------------------------------------------------------------------------- */

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
const num = (v: unknown, d = 100): number => (typeof v === "number" ? v : d);
const slugOf = (v: unknown): string =>
  typeof v === "string" ? v : ((v as { current?: string } | undefined)?.current ?? "");
const refOf = (v: unknown): string => (v as { _ref?: string } | undefined)?._ref ?? "";
const blocksOf = (v: unknown): PortableTextBlock[] | undefined =>
  Array.isArray(v) && v.length ? (v as PortableTextBlock[]) : undefined;

function normRecommendation(v: unknown): Recommendation {
  const r = (v ?? {}) as Record<string, unknown>;
  return {
    kind: (str(r.kind) as Recommendation["kind"]) ?? "none",
    label: str(r.label),
    candidateKey: str(r.candidateKey),
    candidateName: str(r.candidateName),
  };
}

function normElection(d: RawDoc): Election {
  return {
    _id: d._id,
    title: str(d.title) ?? "Election guide",
    subtitle: str(d.subtitle),
    slug: slugOf(d.slug),
    date: str(d.date) ?? "",
    status: (str(d.status) as Election["status"]) ?? "draft",
    shareUrl: str(d.shareUrl),
    intro: blocksOf(d.intro),
    helpIntro: blocksOf(d.helpIntro),
    helpItems: Array.isArray(d.helpItems) ? (d.helpItems as HelpItem[]) : undefined,
    methodology: blocksOf(d.methodology),
  };
}

function normSection(d: RawDoc): Section {
  return {
    _id: d._id,
    title: str(d.title) ?? "",
    slug: slugOf(d.slug),
    category: (str(d.category) as Category) ?? "other",
    order: num(d.order),
    electionId: refOf(d.election),
    description: blocksOf(d.description),
  };
}

function normItem(d: RawDoc): BallotItem | null {
  const base = {
    _id: d._id,
    slug: slugOf(d.slug),
    order: num(d.order),
    electionId: refOf(d.election),
    sectionId: refOf(d.section),
    summary: str(d.summary),
    recommendation: normRecommendation(d.recommendation),
    deepDive: blocksOf(d.deepDive),
  };
  if (d._type === "race") {
    const candidates = (Array.isArray(d.candidates) ? d.candidates : []) as Candidate[];
    const rec = base.recommendation;
    // Resolve candidate name against the list when only a key or partial name was given
    if (rec.kind === "candidate" && !rec.candidateName && rec.candidateKey) {
      rec.candidateName = candidates.find((c) => c._key === rec.candidateKey)?.name;
    }
    return {
      ...base,
      kind: "race",
      title: str(d.title) ?? "",
      district: str(d.district),
      jobDescription: blocksOf(d.jobDescription),
      candidates,
    };
  }
  if (d._type === "judge") {
    return { ...base, kind: "judge", name: str(d.name) ?? "", reviewUrl: str(d.reviewUrl) };
  }
  if (d._type === "measure") {
    return {
      ...base,
      kind: "measure",
      title: str(d.title) ?? "",
      shortTitle: str(d.shortTitle),
      ballotLanguage: blocksOf(d.ballotLanguage),
      whosBehindIt: blocksOf(d.whosBehindIt),
    };
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  const docs = await loadAllDocs();
  const d = docs.find((x) => x._type === "siteSettings");
  return {
    siteTitle: str(d?.siteTitle) ?? "This Won’t Save Us",
    tagline: str(d?.tagline),
    authorName: str(d?.authorName),
    instagram: str(d?.instagram),
    contactEmail: str(d?.contactEmail),
    jurisdiction: str(d?.jurisdiction),
    about: blocksOf(d?.about),
  };
}

/** All non-draft elections, newest first. */
export async function getElections(): Promise<Election[]> {
  const docs = await loadAllDocs();
  return docs
    .filter((d) => d._type === "election")
    .map(normElection)
    .filter((e) => e.status !== "draft" && e.slug)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** The guide to show on the home page: the newest "live" election, else the newest one. */
export async function getCurrentElection(): Promise<Election | null> {
  const all = await getElections();
  return all.find((e) => e.status === "live") ?? all[0] ?? null;
}

export async function getElectionBySlug(slug: string): Promise<Election | null> {
  const all = await getElections();
  return all.find((e) => e.slug === slug) ?? null;
}

export async function getElectionBundle(slug: string): Promise<ElectionBundle | null> {
  const docs = await loadAllDocs();
  const election = (await getElectionBySlug(slug)) ?? null;
  if (!election) return null;

  const sections = docs
    .filter((d) => d._type === "section")
    .map(normSection)
    .filter((s) => s.electionId === election._id)
    .sort((a, b) => a.order - b.order);

  const items = docs
    .filter((d) => d._type === "race" || d._type === "judge" || d._type === "measure")
    .map(normItem)
    .filter((i): i is BallotItem => Boolean(i) && i!.electionId === election._id)
    .sort((a, b) => a.order - b.order);

  const withItems: SectionWithItems[] = sections
    .map((s) => ({ ...s, items: items.filter((i) => i.sectionId === s._id) }))
    .filter((s) => s.items.length > 0);

  const groups: CategoryGroup[] = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    sections: withItems.filter((s) => s.category === category),
  })).filter((g) => g.sections.length > 0);

  return { election, groups, itemCount: items.length };
}

export async function getItem(electionSlug: string, itemSlug: string) {
  const bundle = await getElectionBundle(electionSlug);
  if (!bundle) return null;
  for (const g of bundle.groups) {
    for (const s of g.sections) {
      const item = s.items.find((i) => i.slug === itemSlug);
      if (item) return { bundle, group: g, section: s, item };
    }
  }
  return null;
}
