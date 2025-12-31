import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/app/db/prisma";

const secretKey = process.env.SECRET_KEY!;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // 1️⃣ Refresh token must exist
    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token missing" },
        { status: 401 }
      );
    }

    // 2️⃣ Verify refresh token JWT
    let user: any;
    try {
      user = jwt.verify(refreshToken, secretKey);
    } catch {
      return NextResponse.json(
        { message: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // 3️⃣ Fetch all valid sessions for user
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!sessions.length) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    // 4️⃣ Match refresh token against stored hashed token
    const matchingSession = await Promise.any(
      sessions.map(async (session) => {
        const isMatch = await bcrypt.compare(
          refreshToken,
          session.refreshToken
        );
        return isMatch ? session : Promise.reject();
      })
    ).catch(() => null);

    if (!matchingSession) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    // 5️⃣ Issue new access token (ACTIVE ROLE ONLY)
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        activeRole: user.activeRole,
        roles: user.roles,
      },
      secretKey,
      { expiresIn: "15m" }
    );

    // 6️⃣ Set new access token cookie
    const response = NextResponse.json(
      { message: "Access token refreshed" },
      { status: 200 }
    );

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { message: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
