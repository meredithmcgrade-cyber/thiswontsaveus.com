import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-40 h-[var(--header-h)] border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display flex min-w-0 items-center gap-2 text-[0.95rem] font-bold tracking-tight whitespace-nowrap text-ink sm:text-[1.05rem]">
          <span aria-hidden className="inline-block h-3 w-3 shrink-0 rounded-full bg-brand" />
          {title}
        </Link>
        <nav aria-label="Site" className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className="font-display hidden rounded-full px-3 py-1.5 text-[0.85rem] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink sm:inline-flex">
            Guide
          </Link>
          <Link href="/elections" className="font-display rounded-full px-3 py-1.5 text-[0.85rem] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
            Past
          </Link>
          <Link href="/about" className="font-display rounded-full px-3 py-1.5 text-[0.85rem] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </div>
  );
}
