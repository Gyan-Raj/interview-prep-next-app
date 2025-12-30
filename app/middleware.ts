import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { AuthUser } from "@/app/types";

const secretKey = process.env.SECRET_KEY!;

const ROLE_ROUTE_MAP: Record<string, string> = {
  Admin: "/admin",
  "Resource Manager": "/resource-manager",
  Resource: "/resource",
};

function isTokenExpired(token: string): boolean {
  try {
    jwt.verify(token, secretKey);
    return false;
  } catch {
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  // 1️⃣ Allow public entry point
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 2️⃣ No access token → redirect to landing/login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let user: AuthUser | null = null;

  // 3️⃣ Try verifying access token
  if (!isTokenExpired(accessToken)) {
    user = jwt.verify(accessToken, secretKey) as AuthUser;
  } else {
    // 4️⃣ Token expired → attempt refresh
    try {
      const refreshResponse = await fetch(new URL("/api/refresh", req.url), {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });

      if (!refreshResponse.ok) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // 5️⃣ Forward refreshed cookies
      const response = NextResponse.next();

      const setCookie = refreshResponse.headers.get("set-cookie");
      if (setCookie) {
        response.headers.set("set-cookie", setCookie);
      }

      return response;
    } catch {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (!user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 6️⃣ Enforce role-based routing
  const allowedBasePath = ROLE_ROUTE_MAP[user.activeRole.name];

  if (!allowedBasePath) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 🚨 Critical: role route guard
  if (!pathname.startsWith(allowedBasePath)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/resource-manager/:path*", "/resource/:path*"],
};
