import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/db/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  const refreshToken = (await cookies()).get("refreshToken")?.value;

  if (refreshToken) {
    const sessions = await prisma.session.findMany();
    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshToken)) {
        await prisma.session.delete({ where: { id: session.id } });
        break;
      }
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  return res;
}
