import { NextRequest, NextResponse } from "next/server";
import { tryConsumeState, exchangeGoogleCode, upsertGoogleUser, createSession, isOAuthConfigured } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isOAuthConfigured()) {
    return NextResponse.json({ error: "oauth_not_configured" }, { status: 503 });
  }
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(new URL("/?authError=missing", req.url));
  }
  const consumed = tryConsumeState(state);
  if (!consumed.ok) {
    return NextResponse.redirect(new URL("/?authError=state", req.url));
  }
  try {
    const profile = await exchangeGoogleCode(code);
    const user = upsertGoogleUser(profile);
    const sessionId = createSession(user.id);
    const redirectPath = consumed.returnTo || "/projects";
    const res = NextResponse.redirect(new URL(redirectPath, req.url));
    res.cookies.set("farmyza_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (e) {
    console.error("OAuth callback failed:", e);
    return NextResponse.redirect(new URL("/?authError=exchange", req.url));
  }
}