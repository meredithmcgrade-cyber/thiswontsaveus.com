import type { PortableTextBlock } from "@portabletext/react";

export type Category =
  | "federal"
  | "state"
  | "county"
  | "city"
  | "schools"
  | "judges"
  | "ballot"
  | "other";

export const CATEGORY_ORDER: Category[] = [
  "federal",
  "state",
  "county",
  "city",
  "schools",
  "judges",
  "ballot",
  "other",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  federal: "Federal",
  state: "State",
  county: "County",
  city: "City",
  schools: "Schools",
  judges: "Judges",
  ballot: "Ballot Questions",
  other: "Other",
};

export type Party = "R" | "D" | "L" | "G" | "I" | "NP";

export const PARTY_LABELS: Record<Party, string> = {
  R: "Republican",
  D: "Democrat",
  L: "Libertarian",
  G: "Green",
  I: "Independent",
  NP: "No party",
};

export type RecommendationKind =
  | "candidate"
  | "abstain"
  | "uncontested"
  | "retain"
  | "doNotRetain"
  | "yes"
  | "strongYes"
  | "no"
  | "strongNo"
  | "none";

export interface Recommendation {
  kind: RecommendationKind;
  /** Custom label, e.g. "HELL NO" or "Cleaver or abstain" */
  label?: string;
  candidateKey?: string;
  candidateName?: string;
}

export interface Candidate {
  _key: string;
  name: string;
  party?: Party;
  incumbent?: boolean;
  writeIn?: boolean;
  website?: string;
  note?: string;
}

export interface LinkItem {
  _key: string;
  label: string;
  url: string;
}

export interface HelpItem {
  _key: string;
  title: string;
  body?: PortableTextBlock[];
  links?: LinkItem[];
}

export interface SiteSettings {
  siteTitle: string;
  tagline?: string;
  authorName?: string;
  instagram?: string;
  contactEmail?: string;
  jurisdiction?: string;
  about?: PortableTextBlock[];
}

export type ElectionStatus = "draft" | "live" | "archived";

export interface Election {
  _id: string;
  title: string;
  subtitle?: string;
  slug: string;
  date: string; // YYYY-MM-DD
  status: ElectionStatus;
  shareUrl?: string;
  intro?: PortableTextBlock[];
  helpIntro?: PortableTextBlock[];
  helpItems?: HelpItem[];
  methodology?: PortableTextBlock[];
}

export interface Section {
  _id: string;
  title: string;
  slug: string;
  category: Category;
  order: number;
  electionId: string;
  description?: PortableTextBlock[];
}

interface ItemBase {
  _id: string;
  slug: string;
  order: number;
  electionId: string;
  sectionId: string;
  summary?: string;
  recommendation: Recommendation;
  deepDive?: PortableTextBlock[];
}

export interface Race extends ItemBase {
  kind: "race";
  title: string; // office
  district?: string;
  jobDescription?: PortableTextBlock[];
  candidates: Candidate[];
}

export interface Judge extends ItemBase {
  kind: "judge";
  name: string;
  reviewUrl?: string;
}

export interface Measure extends ItemBase {
  kind: "measure";
  title: string;
  shortTitle?: string;
  ballotLanguage?: PortableTextBlock[];
  whosBehindIt?: PortableTextBlock[];
}

export type BallotItem = Race | Judge | Measure;

export interface SectionWithItems extends Section {
  items: BallotItem[];
}

export interface CategoryGroup {
  category: Category;
  label: string;
  sections: SectionWithItems[];
}

export interface ElectionBundle {
  election: Election;
  groups: CategoryGroup[];
  itemCount: number;
}

export function itemTitle(item: BallotItem): string {
  if (item.kind === "race") {
    return item.district ? `${item.title}, ${item.district}` : item.title;
  }
  if (item.kind === "judge") return item.name;
  return item.title;
}

export function itemShortTitle(item: BallotItem): string {
  if (item.kind === "race") return item.district ?? item.title;
  if (item.kind === "judge") return item.name;
  return item.shortTitle ?? item.title;
}
