import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink-3">404</p>
      <h1 className="font-display mt-2 text-3xl font-bold">That page isn’t on the ballot</h1>
      <p className="mt-3 text-ink-2">It may have moved, or the link was mistyped.</p>
      <Link href="/" className="font-display mt-6 inline-flex rounded-full bg-brand px-5 py-3 font-semibold text-brand-ink hover:bg-brand-strong">
        Back to the guide
      </Link>
    </div>
  );
}
