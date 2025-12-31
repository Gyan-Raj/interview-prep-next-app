import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import { prisma } from "@/app/db/prisma";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      roles: {
        include: { role: true },
      },
      activeRole: true,
    },
  });

  if (!user || !user.activeRole) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    activeRole: user.activeRole,
    roles: user.roles.map((ur) => ur.role),
  });
}
