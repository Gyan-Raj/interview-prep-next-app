import { prisma } from "@/app/db/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";

const SESSION_TTL_DAYS = 90;

export async function createSession(userId: string) {
  const rawRefreshToken = crypto.randomBytes(48).toString("hex");
  const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, 10);

  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const userAgent = (await headers()).get("user-agent") || undefined;
  const ipAddress =
    (await headers()).get("x-forwarded-for")?.split(",")[0] ||
    (await headers()).get("x-real-ip") ||
    undefined;

  const session = await prisma.session.create({
    data: {
      userId,
      refreshToken: hashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  (
    await // Set cookie with RAW token
    cookies()
  ).set("refresh_token", rawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return {
    sessionId: session.id,
    expiresAt,
  };
}
