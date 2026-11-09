import { defineField, defineType } from "sanity";

export const PARTY_OPTIONS = [
  { title: "Democrat", value: "D" },
  { title: "Republican", value: "R" },
  { title: "Libertarian", value: "L" },
  { title: "Green", value: "G" },
  { title: "Independent", value: "I" },
  { title: "No party / nonpartisan", value: "NP" },
];

export const candidate = defineType({
  name: "candidate",
  title: "Candidate",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "party",
      type: "string",
      options: { list: PARTY_OPTIONS, layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "incumbent", type: "boolean", initialValue: false }),
    defineField({ name: "writeIn", title: "Write-in candidate", type: "boolean", initialValue: false }),
    defineField({ name: "website", type: "url" }),
    defineField({
      name: "note",
      type: "string",
      description: "Optional one-liner shown next to the name, e.g. “current state senator”.",
    }),
  ],
  preview: {
    select: { title: "name", party: "party", incumbent: "incumbent" },
    prepare({ title, party, incumbent }) {
      return {
        title,
        subtitle: [party, incumbent ? "incumbent" : null].filter(Boolean).join(" · "),
      };
    },
  },
});

export const RECOMMENDATION_KINDS = {
  race: [
    { title: "Vote for a candidate", value: "candidate" },
    { title: "Abstain / leave blank", value: "abstain" },
    { title: "Uncontested", value: "uncontested" },
    { title: "No recommendation", value: "none" },
  ],
  judge: [
    { title: "Retain", value: "retain" },
    { title: "Do NOT retain", value: "doNotRetain" },
    { title: "No recommendation", value: "none" },
  ],
  measure: [
    { title: "Yes", value: "yes" },
    { title: "HELL YES", value: "strongYes" },
    { title: "No", value: "no" },
    { title: "HELL NO", value: "strongNo" },
    { title: "No recommendation", value: "none" },
  ],
};

function recommendationType(name: string, kinds: { title: string; value: string }[], withCandidate: boolean) {
  return defineType({
    name,
    title: "Recommendation",
    type: "object",
    fields: [
      defineField({
        name: "kind",
        title: "How should people vote?",
        type: "string",
        options: { list: kinds, layout: "radio" },
        validation: (r) => r.required(),
      }),
      ...(withCandidate
        ? [
            defineField({
              name: "candidateName",
              title: "Candidate name",
              type: "string",
              description: "Type the name exactly as it appears in the candidate list above.",
              hidden: ({ parent }) => parent?.kind !== "candidate",
            }),
          ]
        : []),
      defineField({
        name: "label",
        title: "Custom label (optional)",
        type: "string",
        description: "Overrides the badge text, e.g. “Cleaver or abstain”. Leave blank to use the default.",
      }),
    ],
  });
}

export const raceRecommendation = recommendationType("raceRecommendation", RECOMMENDATION_KINDS.race, true);
export const judgeRecommendation = recommendationType("judgeRecommendation", RECOMMENDATION_KINDS.judge, false);
export const measureRecommendation = recommendationType("measureRecommendation", RECOMMENDATION_KINDS.measure, false);

export const linkItem = defineType({
  name: "linkItem",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "url", type: "url", validation: (r) => r.required() }),
  ],
});

export const helpItem = defineType({
  name: "helpItem",
  title: "Where to help",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "blockContent", description: "Why this matters and how to pitch in. Include links in the text." }),
    defineField({
      name: "links",
      title: "Action links",
      type: "array",
      of: [{ type: "linkItem" }],
      description: "Shown as buttons under the text, e.g. “Sign up to canvass”.",
    }),
  ],
  preview: { select: { title: "title" } },
});
