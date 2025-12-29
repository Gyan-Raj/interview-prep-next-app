import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { Role } from "@/app/types";

type Payload = {
  userId: string;
  roleId: string;
  action: "add" | "remove";
};

export async function POST(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole.name !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId, roleId, action } = (await req.json()) as Payload;

  // 2️⃣ Validate user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 3️⃣ Validate role
  const roleRecord = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!roleRecord) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  const hasRole = user.roles.some((ur) => ur.roleId === roleRecord.id);

  // ==========================
  // ADD ROLE
  // ==========================
  if (action === "add") {
    if (hasRole) {
      return NextResponse.json(
        { message: "User already has role" },
        { status: 409 }
      );
    }

    await prisma.userRole.create({
      data: {
        userId,
        roleId: roleRecord.id,
      },
    });

    // 🔥 fetch fresh user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        activeRole: true,
      },
    });

    return NextResponse.json({
      updatedUser: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        activeRole: updatedUser!.activeRole?.name,
        roles: updatedUser!.roles.map((ur) => ur),
      },
    });
  }

  // ==========================
  // REMOVE ROLE
  // ==========================
  if (!hasRole) {
    return NextResponse.json(
      { message: "User does not have role" },
      { status: 409 }
    );
  }

  // 4️⃣ Prevent removing last ADMIN
  if (roleId === "ADMIN") {
    const adminCount = await prisma.userRole.count({
      where: {
        role: { name: "ADMIN" },
      },
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { message: "Cannot remove last admin" },
        { status: 400 }
      );
    }
  }

  // 5️⃣ Prevent admin removing own active role
  if (authUser.id === userId && user.activeRoleId === roleRecord.id) {
    return NextResponse.json(
      { message: "Cannot remove your active role" },
      { status: 400 }
    );
  }

  // 6️⃣ Remove role
  await prisma.userRole.delete({
    where: {
      userId_roleId: {
        userId,
        roleId: roleRecord.id,
      },
    },
  });

  // 7️⃣ Handle activeRole fallback
  if (user.activeRoleId === roleRecord.id) {
    const remainingRole = await prisma.userRole.findFirst({
      where: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        activeRoleId: remainingRole?.roleId ?? null,
      },
    });
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      activeRole: true,
    },
  });

  return NextResponse.json({
    updatedUser: {
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      activeRole: updatedUser!.activeRole?.name,
      roles: updatedUser!.roles.map((ur) => ur.role.name),
    },
  });
}
