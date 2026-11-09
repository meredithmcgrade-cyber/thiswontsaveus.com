import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const sanityProject = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/**
 * Content Security Policy for the public site. Nothing third party is allowed:
 * no analytics, no external fonts, no embeds. Next.js needs 'unsafe-inline' for
 * its own hydration scripts on statically generated pages.
 */
const siteCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** The Studio (editors only) needs to talk to Sanity's API. */
const studioCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity-cdn.com https://*.sanity.io",
  "style-src 'self' 'unsafe-inline' https://*.sanity.io",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
  "font-src 'self' data: https://*.sanity.io https://*.sanity-cdn.com",
  `connect-src 'self' https://*.api.sanity.io wss://*.api.sanity.io https://api.sanity.io https://*.sanity.io wss://*.sanity.io https://*.sanity-cdn.com${
    sanityProject ? ` https://${sanityProject}.api.sanity.io wss://${sanityProject}.api.sanity.io` : ""
  }`,
  "frame-src https://*.sanity.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.sanity.io",
  "object-src 'none'",
].join("; ");

const commonHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [...commonHeaders.filter((h) => h.key !== "Referrer-Policy"), { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Content-Security-Policy", value: studioCsp }, { key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/((?!studio).*)",
        headers: [...commonHeaders, { key: "Content-Security-Policy", value: siteCsp }],
      },
    ];
  },
};

export default nextConfig;
