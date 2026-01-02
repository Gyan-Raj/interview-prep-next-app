import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/db/prisma";
import { createSession } from "@/app/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, password } = body as {
    token?: string;
    password?: string;
  };

  // 1️⃣ Basic validation
  if (!password || password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // 2️⃣ Invite flow
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized password change" },
      { status: 401 }
    );
  }

  const invite = await prisma.userInvite.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          activeRole: true,
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json(
      { message: "Invalid invite token" },
      { status: 400 }
    );
  }

  if (invite.usedAt) {
    return NextResponse.json(
      { message: "Invite already used" },
      { status: 409 }
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ message: "Invite expired" }, { status: 410 });
  }

  if (!invite.user.activeRole) {
    return NextResponse.json(
      { message: "User has no active role assigned" },
      { status: 500 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 3️⃣ Atomic update
  await prisma.$transaction([
    prisma.user.update({
      where: { id: invite.userId },
      data: {
        password: hashedPassword,
        passwordMustChange: false,
        passwordExpiresAt: null,
      },
    }),
    prisma.userInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({
      where: { userId: invite.userId },
    }),
  ]);

  // 4️⃣ Create session
  await createSession(invite.userId);

  return NextResponse.json(
    {
      message: "Password set successfully",
    },
    { status: 200 }
  );
}
