// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY!;

const ROLE_ROUTE_MAP = {
  ADMIN: "/admin",
  "RESOURCE MANAGER": "/resource-manager",
  RESOURCE: "/resource",
} as const;

type JwtPayload = {
  activeRole?: {
    name: keyof typeof ROLE_ROUTE_MAP;
  };
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Public paths
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;
  if (!token) {
    return redirectToLogin(req);
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, SECRET_KEY) as JwtPayload;
  } catch {
    return redirectToLogin(req);
  }

  const roleName = payload.activeRole?.name;
  if (!roleName) {
    return redirectToLogin(req);
  }

  const allowedPath = ROLE_ROUTE_MAP[roleName];
  if (!pathname.startsWith(allowedPath)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/resource-manager/:path*", "/resource/:path*"],
};
