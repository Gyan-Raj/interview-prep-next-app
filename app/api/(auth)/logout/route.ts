import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/db/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY!;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      // 1️⃣ Verify refresh token to get userId
      const payload = jwt.verify(refreshToken, secretKey) as { id: string };

      // 2️⃣ Fetch only this user's sessions
      const sessions = await prisma.session.findMany({
        where: { userId: payload.id },
      });

      // 3️⃣ Match and delete current session
      for (const session of sessions) {
        const match = await bcrypt.compare(refreshToken, session.refreshToken);

        if (match) {
          await prisma.session.delete({
            where: { id: session.id },
          });
          break;
        }
      }
    } catch {
      // Invalid token → best-effort logout
    }
  }

  // 4️⃣ Clear cookies
  const response = NextResponse.json({ success: true });

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
