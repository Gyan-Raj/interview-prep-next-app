import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function POST(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json(null, { status: 401 });
  }

  const { oldPassword, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || !user.password) {
    return NextResponse.json(null, { status: 401 });
  }

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    return NextResponse.json(
      { message: "Incorrect current password" },
      { status: 403 }
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return NextResponse.json(
      { message: "New password must be different from the current password" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordMustChange: false,
        passwordExpiresAt: null,
      },
    }),
    prisma.session.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  const response = NextResponse.json({
    success: true,
    message: "Password changed successfully. Please log in again.",
  });

  response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });

  return response;
}
