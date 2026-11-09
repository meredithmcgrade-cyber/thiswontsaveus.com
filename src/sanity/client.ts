import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  // Content is fetched on the server at build/revalidate time only, so the
  // reader's browser never talks to Sanity. The CDN is fine for public reads.
  useCdn: true,
  perspective: "published",
});
