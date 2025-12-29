import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/db/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // 1️⃣ Invalidate session (best effort)
  if (refreshToken) {
    const sessions = await prisma.session.findMany();

    for (const session of sessions) {
      const match = await bcrypt.compare(refreshToken, session.refreshToken);

      if (match) {
        await prisma.session.delete({
          where: { id: session.id },
        });
        break;
      }
    }
  }

  // 2️⃣ Clear cookies
  const response = NextResponse.json({ success: true });

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/api/refresh",
    maxAge: 0,
  });

  return response;
}
