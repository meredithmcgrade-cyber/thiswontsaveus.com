import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { getCurrentElection, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Who writes this guide, how it is researched and how your privacy is handled.",
};

export default async function AboutPage() {
  const [settings, election] = await Promise.all([getSiteSettings(), getCurrentElection()]);
  return (
    <div className="pt-10 pb-12 sm:pt-16">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-none font-bold tracking-tight text-ink">About</h1>

      {settings.about?.length ? <RichText value={settings.about} className="mt-8 text-[1.08rem]" /> : null}

      {election?.methodology?.length ? (
        <section className="mt-10" aria-labelledby="method">
          <h2 id="method" className="font-display mb-3 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-brand">
            How the {election.title} guide was researched
          </h2>
          <RichText value={election.methodology} />
        </section>
      ) : null}

      <section className="mt-12 rounded-[var(--radius-card)] bg-surface-2 p-6" aria-labelledby="privacy">
        <h2 id="privacy" className="font-display text-[1.3rem] font-bold text-ink">
          Privacy
        </h2>
        <div className="prose prose--small mt-3">
          <p>
            Reading a voter guide should not create a record of what you read. This site has no accounts, no sign-ups, no
            cookies and no analytics or advertising scripts. Fonts are served from this site rather than a third party, and
            nothing on these pages reports back to anyone.
          </p>
          <p>
            The two things the site remembers are stored only in your own browser: whether you prefer light or dark mode and
            whether you turned on quick view. Clearing your browser data removes both.
          </p>
          <p>Links to outside sources open on sites with their own privacy practices.</p>
        </div>
      </section>
    </div>
  );
}
