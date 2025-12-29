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

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  // Public routes
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const user = jwt.verify(token, secretKey) as AuthUser;

    const allowedBasePath = ROLE_ROUTE_MAP[user.activeRole.name];

    if (!allowedBasePath) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // 🚨 THIS IS THE KEY CHECK
    if (!req.nextUrl.pathname.startsWith(allowedBasePath)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/resource-manager/:path*", "/resource/:path*"],
};
