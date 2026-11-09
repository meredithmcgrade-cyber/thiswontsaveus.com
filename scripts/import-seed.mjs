#!/usr/bin/env node
/**
 * Imports seed JSON (src/content/seed/*.json) into the configured Sanity dataset.
 *
 *   SANITY_API_WRITE_TOKEN=... npm run seed:import            # all seed files
 *   SANITY_API_WRITE_TOKEN=... npm run seed:import -- 2026-11-03.json
 *
 * Existing documents with the same _id are replaced (createOrReplace), so it is
 * safe to re-run. Recommendation objects get the per-type object name Sanity expects.
 */
import { createClient } from "@sanity/client";
import fs from "node:fs/promises";
import path from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (see .env.example).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-11-01", useCdn: false });
const dir = path.join(process.cwd(), "src", "content", "seed");
const only = process.argv.slice(2);
const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && (!only.length || only.includes(f)));

const recType = { race: "raceRecommendation", judge: "judgeRecommendation", measure: "measureRecommendation" };

let total = 0;
for (const f of files) {
  const docs = JSON.parse(await fs.readFile(path.join(dir, f), "utf8"));
  const tx = client.transaction();
  for (const d of docs) {
    if (d.recommendation && recType[d._type]) {
      d.recommendation = { ...d.recommendation, _type: recType[d._type] };
      delete d.recommendation.candidateKey;
    }
    for (const h of d.helpItems ?? []) for (const l of h.links ?? []) l._type = "linkItem";
    tx.createOrReplace(d);
  }
  const res = await tx.commit();
  total += res.results.length;
  console.log(`${f}: ${res.results.length} documents`);
}
console.log(`Done. ${total} documents in ${dataset}.`);
