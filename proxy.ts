import { NextResponse, NextRequest } from "next/server";
// import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { AuthUser, RoleOps } from "@/app/types";

const secretKey = process.env.SECRET_KEY!;

const ROLE_ROUTE_MAP: Record<RoleOps, string> = {
  ADMIN: "/admin",
  "RESOURCE MANAGER": "/resource-manager",
  RESOURCE: "/resource",
};

function isTokenExpired(token: string): boolean {
  try {
    jwt.verify(token, secretKey);
    return false;
  } catch {
    return true;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  let user: AuthUser | null = null;

  // 1️⃣ Try access token first
  if (accessToken && !isTokenExpired(accessToken)) {
    try {
      user = jwt.verify(accessToken, secretKey) as AuthUser;
    } catch {
      user = null;
    }
  } else {
    // 2️⃣ Missing OR expired access token → try refresh
    try {
      const refreshResponse = await fetch(new URL("/api/refresh", req.url), {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });

      if (refreshResponse.ok) {
        const response = NextResponse.next();

        const setCookie = refreshResponse.headers.get("set-cookie");
        if (setCookie) {
          response.headers.set("set-cookie", setCookie);
        }

        return response;
      }
    } catch {
      // refresh failed → user stays null
    }
  }
  if (!user || !user.activeRole) return;

  // 3️⃣ Landing page
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(
        new URL(ROLE_ROUTE_MAP[user.activeRole.name], req.url)
      );
    }
    return NextResponse.next();
  }

  // 4️⃣ Protected routes
  if (!user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 5️⃣ Role guard
  const allowedBasePath = ROLE_ROUTE_MAP[user.activeRole.name];

  if (!pathname.startsWith(allowedBasePath)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/resource-manager/:path*",
    "/resource/:path*",
  ],
};
