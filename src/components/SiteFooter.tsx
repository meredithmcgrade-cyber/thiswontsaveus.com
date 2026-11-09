import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-[0.9rem] text-ink-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[46ch]">
          <p className="font-display font-bold text-ink">{settings.siteTitle}</p>
          {settings.tagline && <p className="mt-1">{settings.tagline}</p>}
          {settings.authorName && (
            <p className="mt-3">
              Researched and written by {settings.authorName}
              {settings.instagram && (
                <>
                  {" "}
                  (
                  <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-[3px] hover:text-brand">
                    @{settings.instagram}
                  </a>
                  )
                </>
              )}
              .{" "}
              {settings.contactEmail && (
                <>
                  Think something’s wrong or missing?{" "}
                  <a href={`mailto:${settings.contactEmail}`} className="underline underline-offset-[3px] hover:text-brand">
                    Email me
                  </a>
                  .
                </>
              )}
            </p>
          )}
        </div>
        <div className="font-display flex flex-col gap-2 text-[0.85rem] font-semibold">
          <Link href="/elections" className="hover:text-brand">Past elections</Link>
          <Link href="/about" className="hover:text-brand">About and methodology</Link>
          <p className="mt-2 max-w-[34ch] font-body text-[0.8rem] font-normal text-ink-3">
            This site sets no cookies, runs no trackers and never asks who you are. What you read here stays with you.
          </p>
        </div>
      </div>
    </footer>
  );
}
