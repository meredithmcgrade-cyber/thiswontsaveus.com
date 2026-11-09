"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";

/** Templates that pre-fill the election reference when creating from inside an election. */
const byElection = (type: string) => ({
  id: `${type}-by-election`,
  title: `New ${type}`,
  schemaType: type,
  parameters: [{ name: "electionId", type: "string" }],
  value: (params: { electionId: string }) => ({
    election: { _type: "reference", _ref: params.electionId },
  }),
});

export default defineConfig({
  basePath: "/studio",
  title: "This Won’t Save Us",
  projectId: projectId || "placeholder",
  dataset,
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => t.schemaType !== "siteSettings"),
      byElection("section"),
      byElection("race"),
      byElection("judge"),
      byElection("measure"),
    ],
  },
  document: {
    // Site settings is a singleton: hide it from the global "create" menu.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((t) => t.templateId !== "siteSettings")
        : prev,
  },
  plugins: [
    structureTool({ structure }),
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
});
