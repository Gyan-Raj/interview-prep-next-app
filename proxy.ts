import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY!;

const ROLE_ROUTE_MAP = {
  ADMIN: "/admin",
  "RESOURCE MANAGER": "/resource-manager",
  RESOURCE: "/resource",
} as const;

type RoleOps = keyof typeof ROLE_ROUTE_MAP;

type JwtPayload = {
  id: string;
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * 1. Allow public routes
   */
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  /**
   * 2. Read token
   */
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return redirectToLogin(req);
  }

  /**
   * 3. Verify token
   */
  let payload: JwtPayload;
  try {
    payload = jwt.verify(accessToken, secretKey) as JwtPayload;
  } catch {
    return redirectToLogin(req);
  }

  /**
   * 4. Fetch live auth context
   */
  const authContextRes = await fetch(new URL("/api/context", req.url), {
    headers: { cookie: req.headers.get("cookie") || "" },
  });

  if (!authContextRes.ok) {
    return redirectToLogin(req);
  }

  const { activeRole } = await authContextRes.json();

  if (!activeRole) {
    return redirectToLogin(req);
  }

  const allowedBasePath = ROLE_ROUTE_MAP[activeRole.name as RoleOps];

  /**
   * 5. Role guard
   */
  if (!pathname.startsWith(allowedBasePath)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/resource-manager/:path*", "/resource/:path*"],
};
