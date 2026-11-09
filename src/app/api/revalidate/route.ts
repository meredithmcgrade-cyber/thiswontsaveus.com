import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CONTENT_TAG } from "@/lib/content";

/**
 * Sanity calls this when Brynne publishes. It clears the content cache so the
 * next visitor gets fresh pages. Configure in sanity.io/manage -> API -> Webhooks:
 *   URL:     https://<site>/api/revalidate
 *   Trigger: create, update, delete
 *   Secret:  the value of SANITY_REVALIDATE_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, process.env.SANITY_REVALIDATE_SECRET);
    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    revalidateTag(CONTENT_TAG, "max");
    return NextResponse.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
