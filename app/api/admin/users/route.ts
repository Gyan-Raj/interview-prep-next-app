import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse query params
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query")?.trim() || undefined;
  const roleIdsParam = searchParams.get("roleIds");
  const roleIds = roleIdsParam
    ? roleIdsParam.split(",").filter(Boolean)
    : undefined;

  // 3️⃣ Build where clause
  const where: any = {
    id: {
      not: authUser.id,
    },
  };

  // 🔍 Search by name or email
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
    ];
  }

  // 🎭 Role filter (user must have ANY of the roles)
  if (roleIds && roleIds.length > 0) {
    where.roles = {
      some: {
        roleId: {
          in: roleIds,
        },
      },
    };
  }

  // 4️⃣ Fetch users
  const users = await prisma.user.findMany({
    where: {
      ...where,
      invites: {
        none: {
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      },
    },
    include: {
      roles: {
        include: { role: true },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // 5️⃣ Shape response
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
  // 1️⃣ Auth check (ADMIN only)
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "ADMIN") {
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

  // 5️⃣ Prevent deleting last ADMIN
  const isAdmin = user.roles.some((ur) => ur.role.name === "ADMIN");

  if (isAdmin) {
    const adminCount = await prisma.userRole.count({
      where: {
        role: { name: "ADMIN" },
      },
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { message: "Cannot delete the last admin user" },
        { status: 400 }
      );
    }
  }

  // 6️⃣ Delete user (cascades everything)
  await prisma.user.delete({
    where: { id: userId },
  });

  // 7️⃣ Admin-safe response
  return NextResponse.json(
    { message: "User deleted successfully" },
    { status: 200 }
  );
}
