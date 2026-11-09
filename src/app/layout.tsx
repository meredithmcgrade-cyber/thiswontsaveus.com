import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted variable fonts (OFL licensed, see src/fonts). Nothing is
// requested from Google or any other third party when someone reads the guide.
const display = localFont({
  src: "../fonts/bricolage-grotesque-latin-standard-normal.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "200 800",
});

const body = localFont({
  src: [
    { path: "../fonts/source-serif-4-latin-standard-normal.woff2", style: "normal", weight: "200 900" },
    { path: "../fonts/source-serif-4-latin-standard-italic.woff2", style: "italic", weight: "200 900" },
  ],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thiswontsaveus.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "This Won’t Save Us",
    template: "%s · This Won’t Save Us",
  },
  description: "A progressive’s guide to voting in Kansas City, Missouri.",
  openGraph: {
    type: "website",
    siteName: "This Won’t Save Us",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#120f1a" },
  ],
};

// Applies the saved theme before first paint so there is no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-ink">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
