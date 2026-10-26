import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isOAuthConfigured(): boolean {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(id && id.trim().length > 0 && secret && secret.trim().length > 0);
}

export function middleware(req: NextRequest) {
  if (!isOAuthConfigured()) {
    return NextResponse.next();
  }
  const session = req.cookies.get("farmyza_session")?.value;
  if (!session) {
    const url = new URL("/?signin=1", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/projects", "/projects/:path*", "/new"],
};