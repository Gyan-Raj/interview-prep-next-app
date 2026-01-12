import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function POST() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = authUser.roles.some((r) => r.name === "ADMIN");

  if (isAdmin) {
    const adminCount = await prisma.userRole.count({
      where: { role: { name: "ADMIN" } },
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { message: "Cannot delete last admin account" },
        { status: 400 }
      );
    }
  }

  await prisma.$transaction([
    prisma.session.deleteMany({
      where: { userId: authUser.id },
    }),
    prisma.user.delete({
      where: { id: authUser.id },
    }),
  ]);

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
