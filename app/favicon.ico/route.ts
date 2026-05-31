import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    if (settings.faviconUrl) {
      return NextResponse.redirect(settings.faviconUrl, {
        status: 302,
        headers: { "Cache-Control": "no-store" },
      });
    }
  } catch {}
  return new NextResponse(null, { status: 204 });
}
