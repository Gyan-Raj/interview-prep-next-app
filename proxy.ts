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

  const token = req.cookies.get("accessToken")?.value;
  if (!token) return redirectToLogin(req);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, secretKey) as JwtPayload;
  } catch {
    return redirectToLogin(req);
  }

  /**
   * Fetch live auth context from DB
   * (DO NOT trust JWT for roles)
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

  // Landing page
  if (pathname === "/") {
    return NextResponse.redirect(new URL(allowedBasePath, req.url));
  }

  // Role guard
  if (!pathname.startsWith(allowedBasePath)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/resource-manager/:path*",
    "/resource/:path*",
  ],
};
