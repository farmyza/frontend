import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { normalizeReturnTo, buildAuthUrl, isOAuthConfigured } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isOAuthConfigured()) {
    return NextResponse.json({ error: "oauth_not_configured" }, { status: 503 });
  }
  let returnTo: string | null;
  try {
    returnTo = normalizeReturnTo(req.nextUrl.searchParams.get("returnTo"));
  } catch (e) {
    console.error("OAuth start invalid returnTo:", e);
    return NextResponse.json({ error: "Invalid returnTo" }, { status: 400 });
  }
  try {
    const authUrl = buildAuthUrl(returnTo);
    return NextResponse.json({ authUrl });
  } catch (e) {
    console.error("OAuth start failed:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}