import { defineField, defineType } from "sanity";

export const CATEGORY_OPTIONS = [
  { title: "Federal", value: "federal" },
  { title: "State", value: "state" },
  { title: "County", value: "county" },
  { title: "City", value: "city" },
  { title: "Schools", value: "schools" },
  { title: "Judges", value: "judges" },
  { title: "Ballot Questions", value: "ballot" },
  { title: "Other", value: "other" },
];

const electionRef = defineField({
  name: "election",
  type: "reference",
  to: [{ type: "election" }],
  validation: (r) => r.required(),
});

const sectionRef = defineField({
  name: "section",
  title: "Section",
  description: "The group this appears under, e.g. “State Representatives” or “16th Judicial Circuit”.",
  type: "reference",
  to: [{ type: "section" }],
  options: {
    filter: ({ document }) => {
      const ref = (document?.election as { _ref?: string } | undefined)?._ref;
      return ref
        ? { filter: "election._ref == $ref", params: { ref } }
        : { filter: "" };
    },
  },
  validation: (r) => r.required(),
});

const orderField = defineField({
  name: "order",
  type: "number",
  description: "Lower numbers appear first. Items are also sortable by drag in the section view.",
  initialValue: 100,
});

const summaryField = defineField({
  name: "summary",
  title: "One-line summary",
  type: "string",
  description: "Optional. A single sentence shown in quick view, e.g. “Incumbent with a strong record. Easy yes.”",
  validation: (r) => r.max(160),
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", type: "string" }),
    defineField({ name: "jurisdiction", type: "string", description: "e.g. Kansas City, Missouri" }),
    defineField({ name: "authorName", type: "string" }),
    defineField({ name: "instagram", type: "string", description: "Handle without the @" }),
    defineField({ name: "contactEmail", type: "string" }),
    defineField({
      name: "about",
      title: "About the author",
      type: "blockContent",
      description: "Shown on the About page under the election-specific methodology.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const election = defineType({
  name: "election",
  title: "Election",
  type: "document",
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "intro", title: "Intro" },
    { name: "help", title: "Where to help" },
    { name: "method", title: "Methodology" },
  ],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "basics" }),
    defineField({
      name: "subtitle",
      type: "string",
      description: "e.g. “A Progressive’s Guide to the November 3, 2026 Midterm Election in Kansas City, Missouri”",
      group: "basics",
    }),
    defineField({
      name: "date",
      title: "Election day",
      type: "date",
      validation: (r) => r.required(),
      group: "basics",
    }),
    defineField({
      name: "slug",
      type: "slug",
      description: "Used in the web address. Use the election date, e.g. 2026-11-03.",
      options: { source: "date" },
      validation: (r) => r.required(),
      group: "basics",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Draft (hidden)", value: "draft" },
          { title: "Live (current guide)", value: "live" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      group: "basics",
    }),
    defineField({
      name: "shareUrl",
      title: "Short share link",
      type: "url",
      description: "The bit.ly link you post, if any.",
      group: "basics",
    }),
    defineField({
      name: "intro",
      title: "Don’t skip this",
      type: "blockContent",
      description: "The opening note at the top of the guide.",
      group: "intro",
    }),
    defineField({ name: "helpIntro", title: "Where to help: intro", type: "blockContent", group: "help" }),
    defineField({
      name: "helpItems",
      title: "Where to help right now",
      type: "array",
      of: [{ type: "helpItem" }],
      group: "help",
    }),
    defineField({
      name: "methodology",
      title: "About this guide",
      type: "blockContent",
      description: "How you researched this election.",
      group: "method",
    }),
  ],
  preview: {
    select: { title: "title", date: "date", status: "status" },
    prepare({ title, date, status }) {
      return { title: `${date ?? ""}  ${title ?? ""}`.trim(), subtitle: status };
    },
  },
  orderings: [{ title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
});

export const section = defineType({
  name: "section",
  title: "Section",
  type: "document",
  description: "A group of races, judges or measures, e.g. “State Representatives”.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    electionRef,
    defineField({
      name: "category",
      type: "string",
      options: { list: CATEGORY_OPTIONS, layout: "radio", direction: "horizontal" },
      validation: (r) => r.required(),
    }),
    orderField,
    defineField({
      name: "description",
      title: "The job description",
      type: "blockContent",
      description: "What this office does and why it matters. Shown once at the top of the section.",
    }),
  ],
  preview: {
    select: { title: "title", category: "category", election: "election.date" },
    prepare({ title, category, election }) {
      return { title, subtitle: [election, category].filter(Boolean).join(" · ") };
    },
  },
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
});

export const race = defineType({
  name: "race",
  title: "Race",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Office", type: "string", description: "e.g. US Representative", validation: (r) => r.required() }),
    defineField({ name: "district", type: "string", description: "e.g. District 5, or Jackson County. Leave blank for statewide." }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: (doc) => [doc.title, doc.district].filter(Boolean).join(" ") },
      validation: (r) => r.required(),
    }),
    electionRef,
    sectionRef,
    orderField,
    defineField({
      name: "jobDescription",
      type: "blockContent",
      description: "Only if this race needs its own job description beyond the section’s.",
    }),
    defineField({
      name: "candidates",
      type: "array",
      of: [{ type: "candidate" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "recommendation", type: "raceRecommendation", validation: (r) => r.required() }),
    summaryField,
    defineField({ name: "deepDive", type: "blockContent" }),
  ],
  preview: {
    select: { title: "title", district: "district", rec: "recommendation.kind", name: "recommendation.candidateName", label: "recommendation.label" },
    prepare({ title, district, rec, name, label }) {
      const recText = rec === "candidate" ? name : label ?? rec;
      return { title: [title, district].filter(Boolean).join(" · "), subtitle: recText };
    },
  },
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
});

export const judge = defineType({
  name: "judge",
  title: "Judge",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    electionRef,
    sectionRef,
    orderField,
    defineField({ name: "recommendation", type: "judgeRecommendation", validation: (r) => r.required() }),
    defineField({ name: "reviewUrl", title: "Performance review link", type: "url", description: "Usually a yourmissourijudges.org page." }),
    summaryField,
    defineField({ name: "deepDive", type: "blockContent" }),
  ],
  preview: {
    select: { title: "name", rec: "recommendation.kind" },
    prepare({ title, rec }) {
      return { title, subtitle: rec === "doNotRetain" ? "Do NOT retain" : rec };
    },
  },
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
});

export const measure = defineType({
  name: "measure",
  title: "Ballot measure",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", description: "e.g. Constitutional Amendment No. 3", validation: (r) => r.required() }),
    defineField({ name: "shortTitle", type: "string", description: "e.g. Amendment 3. Used in navigation and quick view." }),
    defineField({ name: "slug", type: "slug", options: { source: (doc) => (doc.shortTitle as string) || (doc.title as string) }, validation: (r) => r.required() }),
    electionRef,
    sectionRef,
    orderField,
    defineField({ name: "ballotLanguage", type: "blockContent", description: "The official wording as it appears on the ballot." }),
    defineField({ name: "recommendation", type: "measureRecommendation", validation: (r) => r.required() }),
    summaryField,
    defineField({ name: "deepDive", type: "blockContent" }),
    defineField({ name: "whosBehindIt", title: "Who’s behind it?", type: "blockContent" }),
  ],
  preview: {
    select: { title: "title", short: "shortTitle", rec: "recommendation.kind", label: "recommendation.label" },
    prepare({ title, short, rec, label }) {
      return { title: short ?? title, subtitle: label ?? rec };
    },
  },
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
});
