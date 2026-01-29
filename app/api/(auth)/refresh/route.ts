import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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
    return NextResponse.json(null, { status: 404 });
  }

  // 🔁 ROTATE REFRESH TOKEN
  const newRawRefreshToken = crypto.randomBytes(48).toString("hex");
  const newHashedRefreshToken = await bcrypt.hash(newRawRefreshToken, 10);

  await prisma.session.update({
    where: { id: matchedSession.id },
    data: {
      refreshToken: newHashedRefreshToken,
      updatedAt: new Date(),
    },
  });

  // Issue new access token
  const accessToken = jwt.sign({ sub: matchedSession.userId }, SECRET_KEY, {
    expiresIn: "7d",
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  response.cookies.set("refreshToken", newRawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: matchedSession.expiresAt,
    path: "/",
  });

  return response;
}
