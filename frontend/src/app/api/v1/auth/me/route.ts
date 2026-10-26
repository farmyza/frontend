import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isOAuthConfigured, DEFAULT_USER } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isOAuthConfigured()) {
    return NextResponse.json({ user: DEFAULT_USER, demo: true });
  }
  const user = getSessionUser(req.cookies.get("farmyza_session")?.value);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}