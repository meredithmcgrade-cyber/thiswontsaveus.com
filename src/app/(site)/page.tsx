import type { Metadata } from "next";
import { Suspense } from "react";
import { ElectionGuide } from "@/components/ElectionGuide";
import { GuideSkeleton } from "@/components/GuideSkeleton";
import { getCurrentElection, getElectionBundle } from "@/lib/content";
import { excerpt } from "@/lib/portable-text";

export async function generateMetadata(): Promise<Metadata> {
  const election = await getCurrentElection();
  if (!election) return {};
  return {
    title: { absolute: election.title },
    description: election.subtitle ?? excerpt(election.intro),
    alternates: { canonical: `/${election.slug}` },
    openGraph: { title: election.title, description: election.subtitle },
  };
}

async function CurrentGuide() {
  const election = await getCurrentElection();
  if (!election) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-3xl font-bold">No guide published yet</h1>
        <p className="mt-3 text-ink-2">Check back closer to the next election.</p>
      </div>
    );
  }
  const bundle = await getElectionBundle(election.slug);
  if (!bundle) return null;
  return <ElectionGuide bundle={bundle} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<GuideSkeleton />}>
      <CurrentGuide />
    </Suspense>
  );
}
