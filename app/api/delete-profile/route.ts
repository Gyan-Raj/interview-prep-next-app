import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function POST() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 🔐 Prevent deleting last ADMIN
  if (authUser.activeRole.name === "ADMIN") {
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

  // 🗑️ Delete user (cascades: UserRole, Session)
  await prisma.user.delete({
    where: { id: authUser.id },
  });

  // 🚪 Clear auth cookies = logout
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
