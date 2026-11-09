import { defineArrayMember, defineType } from "sanity";

/**
 * Rich text used across the guide. Kept intentionally small so the editor
 * stays simple: paragraphs, a sub-heading, bullets, bold, italic and links.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Sub-heading", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullets", value: "bullet" },
        { title: "Numbers", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) =>
                  rule.uri({ scheme: ["http", "https", "mailto"] }),
              },
            ],
          },
        ],
      },
    }),
  ],
});
