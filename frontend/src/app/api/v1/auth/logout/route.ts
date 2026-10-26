import { NextRequest, NextResponse } from "next/server";
import { deleteSession, isOAuthConfigured } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isOAuthConfigured()) {
    return new NextResponse(null, { status: 204 });
  }
  deleteSession(req.cookies.get("farmyza_session")?.value);
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set("farmyza_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return res;
}