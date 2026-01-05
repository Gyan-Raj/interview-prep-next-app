import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

type Payload = {
  userId: string;
  roleIds: string[];
};

export async function POST(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId, roleIds } = (await req.json()) as Payload;

  if (!userId || !Array.isArray(roleIds)) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (roleIds.length === 0) {
    return NextResponse.json(
      { message: "User must have at least one role" },
      { status: 400 }
    );
  }

  // 2️⃣ Validate user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 3️⃣ Validate roles
  const roles = await prisma.role.findMany({
    where: { id: { in: roleIds } },
    select: { id: true, name: true },
  });

  if (roles.length !== roleIds.length) {
    return NextResponse.json(
      { message: "One or more roles are invalid" },
      { status: 400 }
    );
  }

  const currentRoleIds = user.roles.map((ur) => ur.roleId);
  console.log(currentRoleIds, "currentRoleIds");

  const rolesToAdd = roleIds.filter((id) => !currentRoleIds.includes(id));
  console.log(rolesToAdd, "rolesToAdd");
  const rolesToRemove = currentRoleIds.filter((id) => !roleIds.includes(id));
  console.log(rolesToRemove, "rolesToRemove");

  // 4️⃣ Prevent removing last ADMIN
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (adminRole && rolesToRemove.includes(adminRole.id)) {
    const adminCount = await prisma.userRole.count({
      where: { roleId: adminRole.id },
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { message: "Cannot remove last admin" },
        { status: 400 }
      );
    }
  }

  // 5️⃣ Prevent admin removing own active role
  if (
    authUser.id === userId &&
    user.activeRoleId &&
    rolesToRemove.includes(user.activeRoleId)
  ) {
    return NextResponse.json(
      { message: "Cannot remove your active role" },
      { status: 400 }
    );
  }

  // 6️⃣ Apply changes atomically
  await prisma.$transaction([
    ...rolesToAdd.map((roleId) =>
      prisma.userRole.create({
        data: { userId, roleId },
      })
    ),
    ...rolesToRemove.map((roleId) =>
      prisma.userRole.delete({
        where: {
          userId_roleId: { userId, roleId },
        },
      })
    ),
  ]);

  // 7️⃣ Active role fallback
  if (user.activeRoleId && rolesToRemove.includes(user.activeRoleId)) {
    const remaining = await prisma.userRole.findFirst({
      where: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { activeRoleId: remaining?.roleId ?? null },
    });
  }

  // 8️⃣ Return fresh user
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      activeRole: true,
    },
  });
  console.log(updatedUser, "updatedUser");

  return NextResponse.json({
    updatedUser: {
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      phone: updatedUser!.phone,
      activeRole: updatedUser!.activeRole,
      roles: updatedUser!.roles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
    },
  });
}

export async function GET() {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const roles = await prisma.role.findMany({
    select: { id: true, name: true },
  });
  let validRoles = roles.filter((r) => r.id !== authUser.activeRole.id);

  return NextResponse.json(validRoles);
}
