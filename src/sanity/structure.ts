import type { StructureResolver } from "sanity/structure";

/**
 * Studio navigation, organised the way Brynne thinks about the guide:
 *
 *   Elections
 *     └ 2026-11-03 This Won’t Save Us
 *         ├ Election details (intro, where to help, methodology)
 *         ├ Sections
 *         ├ Races
 *         ├ Judges
 *         └ Ballot measures
 *   Site settings
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Election guide")
    .items([
      S.listItem()
        .title("Elections")
        .child(
          S.documentTypeList("election")
            .title("Elections")
            .defaultOrdering([{ field: "date", direction: "desc" }])
            .child((electionId) =>
              S.list()
                .title("Election")
                .items([
                  S.listItem()
                    .title("Election details")
                    .child(S.document().schemaType("election").documentId(electionId)),
                  S.divider(),
                  S.listItem()
                    .title("Sections")
                    .child(
                      S.documentList()
                        .title("Sections")
                        .schemaType("section")
                        .filter('_type == "section" && election._ref == $electionId')
                        .params({ electionId })
                        .defaultOrdering([{ field: "order", direction: "asc" }])
                        .initialValueTemplates([
                          S.initialValueTemplateItem("section-by-election", { electionId }),
                        ]),
                    ),
                  S.listItem()
                    .title("Races")
                    .child(
                      S.documentList()
                        .title("Races")
                        .schemaType("race")
                        .filter('_type == "race" && election._ref == $electionId')
                        .params({ electionId })
                        .defaultOrdering([{ field: "order", direction: "asc" }])
                        .initialValueTemplates([
                          S.initialValueTemplateItem("race-by-election", { electionId }),
                        ]),
                    ),
                  S.listItem()
                    .title("Judges")
                    .child(
                      S.documentList()
                        .title("Judges")
                        .schemaType("judge")
                        .filter('_type == "judge" && election._ref == $electionId')
                        .params({ electionId })
                        .defaultOrdering([{ field: "order", direction: "asc" }])
                        .initialValueTemplates([
                          S.initialValueTemplateItem("judge-by-election", { electionId }),
                        ]),
                    ),
                  S.listItem()
                    .title("Ballot measures")
                    .child(
                      S.documentList()
                        .title("Ballot measures")
                        .schemaType("measure")
                        .filter('_type == "measure" && election._ref == $electionId')
                        .params({ electionId })
                        .defaultOrdering([{ field: "order", direction: "asc" }])
                        .initialValueTemplates([
                          S.initialValueTemplateItem("measure-by-election", { electionId }),
                        ]),
                    ),
                ]),
            ),
        ),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
