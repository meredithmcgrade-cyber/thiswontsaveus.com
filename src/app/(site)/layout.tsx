import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <SmoothScroll>
      <SiteHeader title={settings.siteTitle} />
      <main id="main" className="mx-auto w-full max-w-5xl px-4">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </SmoothScroll>
  );
}
