export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** True when a Sanity project is configured. Otherwise the app reads local seed JSON. */
export const sanityConfigured = Boolean(projectId);
