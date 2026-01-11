import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/app/db/prisma";

const SECRET_KEY = process.env.SECRET_KEY!;

export async function POST() {
  const refreshToken = (await cookies()).get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json(null, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: { expiresAt: { gt: new Date() } },
  });

  let matchedSession = null;
  for (const session of sessions) {
    if (await bcrypt.compare(refreshToken, session.refreshToken)) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: matchedSession.userId },
    include: {
      roles: { include: { role: true } },
      activeRole: true,
    },
  });

  if (!user || !user.activeRole) {
    return NextResponse.json(null, { status: 401 });
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      activeRole: user.activeRole,
    },
    SECRET_KEY,
    { expiresIn: "15m" }
  );

  const response = NextResponse.json({ success: true });
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });

  return response;
}
