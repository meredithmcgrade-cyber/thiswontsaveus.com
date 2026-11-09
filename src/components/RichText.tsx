import { PortableText, type PortableTextBlock, type PortableTextComponents } from "@portabletext/react";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    // Headings pasted from older content get demoted to a sub-heading
    h2: ({ children }) => <h4>{children}</h4>,
    h3: ({ children }) => <h4>{children}</h4>,
  },
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href ?? "#";
      const external = /^https?:\/\//i.test(href);
      return (
        <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
};

export function RichText({
  value,
  className = "",
}: {
  value?: PortableTextBlock[];
  className?: string;
}) {
  if (!value?.length) return null;
  return (
    <div className={`prose ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
