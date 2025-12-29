import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function GET() {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole.name !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Fetch users with roles
  const users = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // 3️⃣ Shape response for UI
  const response = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles.map((ur) => ur.role),
  }));

  return NextResponse.json(response);
}
