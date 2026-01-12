// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY!;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Require presence of access token
  const token = req.cookies.get("accessToken")?.value;

  // Truly logged out (no token at all)
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    jwt.verify(token, SECRET_KEY);
  } catch {
    // intentionally ignore
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/resource-manager/:path*", "/resource/:path*"],
};
