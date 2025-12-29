import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function POST() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 🔐 Wrap everything in a transaction
  try {
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Re-fetch user (authoritative check)
      const user = await tx.user.findUnique({
        where: { id: authUser.id },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      // 2️⃣ Prevent deleting last ADMIN
      if (authUser.activeRole.name === "ADMIN") {
        const adminCount = await tx.userRole.count({
          where: {
            role: { name: "ADMIN" },
          },
        });

        if (adminCount <= 1) {
          throw new Error("LAST_ADMIN");
        }
      }

      // 3️⃣ Delete user (cascades handle sessions, roles)
      await tx.user.delete({
        where: { id: authUser.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "LAST_ADMIN") {
      return NextResponse.json(
        { message: "Cannot delete the last admin account" },
        { status: 400 }
      );
    }

    if (err.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { message: "User already deleted" },
        { status: 404 }
      );
    }

    console.error("Delete profile failed:", err);
    return NextResponse.json(
      { message: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
