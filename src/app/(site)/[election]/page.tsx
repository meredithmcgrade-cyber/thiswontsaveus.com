import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ElectionGuide } from "@/components/ElectionGuide";
import { GuideSkeleton } from "@/components/GuideSkeleton";
import { getElectionBundle, getElections } from "@/lib/content";
import { excerpt } from "@/lib/portable-text";

export async function generateStaticParams() {
  const elections = await getElections();
  return elections.map((e) => ({ election: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ election: string }> }): Promise<Metadata> {
  const { election: slug } = await params;
  const bundle = await getElectionBundle(slug);
  if (!bundle) return {};
  const { election } = bundle;
  return {
    title: { absolute: election.title },
    description: election.subtitle ?? excerpt(election.intro),
    openGraph: { title: election.title, description: election.subtitle },
  };
}

async function Guide({ params }: { params: Promise<{ election: string }> }) {
  const { election: slug } = await params;
  const bundle = await getElectionBundle(slug);
  if (!bundle) notFound();
  return <ElectionGuide bundle={bundle} />;
}

export default function ElectionPage({ params }: { params: Promise<{ election: string }> }) {
  return (
    <Suspense fallback={<GuideSkeleton />}>
      <Guide params={params} />
    </Suspense>
  );
}
