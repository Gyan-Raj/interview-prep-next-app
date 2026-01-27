// app/api/(auth)/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/db/prisma";
import { createSession } from "@/app/lib/session";

const SECRET_KEY = process.env.SECRET_KEY!;

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Missing credentials" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: { include: { role: true } },
      activeRole: true,
    },
  });

  if (!user || !user.password) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 403 }
    );
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 403 }
    );
  }

  // Ensure active role exists (DB concern only)
  if (!user.activeRole) {
    const role = user.roles[0].role;
    await prisma.user.update({
      where: { id: user.id },
      data: { activeRoleId: role.id },
    });
  }

  // ✅ IDENTITY-ONLY TOKEN
  const accessToken = jwt.sign({ sub: user.id }, SECRET_KEY, {
    expiresIn: "15m",
  });

  await createSession(user.id);

  const response = NextResponse.json({ success: true });

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });

  return response;
}
