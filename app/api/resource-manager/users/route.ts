import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

const ROLE_RANK: Record<string, number> = {
  RESOURCE: 1,
  "RESOURCE MANAGER": 2,
  ADMIN: 3,
};

export async function GET(req: Request) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const query = searchParams.get("searchText")?.trim() || undefined;
  const roleIdsParam = searchParams.get("roleIds");
  const roleIds = roleIdsParam
    ? roleIdsParam.split(",").filter(Boolean)
    : undefined;

  const where: any = {
    id: { not: authUser.id },

    invites: {
      none: {
        usedAt: null,
      },
    },

    AND: [
      {
        roles: {
          none: {
            role: { name: "ADMIN" },
          },
        },
      },
    ],
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
    ];
  }

  if (roleIds?.length) {
    where.AND.push({
      roles: {
        some: {
          roleId: { in: roleIds },
        },
      },
    });
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      roles: {
        include: { role: true },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const response = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
    })),
  }));

  return NextResponse.json(response);
}

export async function DELETE(req: Request) {
  // 1️⃣ Auth check (RESOURCE MANAGER only)
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse query param
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "userId is required" },
      { status: 400 }
    );
  }

  // 3️⃣ Prevent self-deletion
  if (userId === authUser.id) {
    return NextResponse.json(
      { message: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  // 4️⃣ Fetch target user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 🔒 NEW RULE: same-role deletion not allowed
  const authUserRoleRank = ROLE_RANK[authUser.activeRole.name];

  const targetMaxRank = Math.max(
    ...user.roles.map((ur) => ROLE_RANK[ur.role.name])
  );

  if (targetMaxRank >= authUserRoleRank) {
    return NextResponse.json(
      { message: "You cannot delete users with the same or higher role" },
      { status: 403 }
    );
  }

  // 5️⃣ Prevent deleting last RESOURCE MANAGER
  const isResourceManager = user.roles.some(
    (ur) => ur.role.name === "RESOURCE MANAGER"
  );

  if (isResourceManager) {
    const resourceManagerCount = await prisma.userRole.count({
      where: {
        role: { name: "RESOURCE MANAGER" },
      },
    });

    if (resourceManagerCount <= 1) {
      return NextResponse.json(
        { message: "Cannot delete the last resource manager user" },
        { status: 400 }
      );
    }
  }

  // 6️⃣ Delete user (cascades everything)
  await prisma.user.delete({
    where: { id: userId },
  });

  // 7️⃣ Resource Manager-safe response
  return NextResponse.json(
    { message: "User deleted successfully" },
    { status: 200 }
  );
}
