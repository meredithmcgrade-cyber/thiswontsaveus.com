import type { SchemaTypeDefinition } from "sanity";
import { blockContent } from "./blockContent";
import {
  candidate,
  helpItem,
  judgeRecommendation,
  linkItem,
  measureRecommendation,
  raceRecommendation,
} from "./objects";
import { election, judge, measure, race, section, siteSettings } from "./documents";

export const schemaTypes: SchemaTypeDefinition[] = [
  blockContent,
  candidate,
  linkItem,
  helpItem,
  raceRecommendation,
  judgeRecommendation,
  measureRecommendation,
  siteSettings,
  election,
  section,
  race,
  judge,
  measure,
];
