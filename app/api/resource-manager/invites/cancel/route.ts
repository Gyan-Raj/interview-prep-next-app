import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function POST(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse body
  const { id } = (await req.json()) as { id?: string };

  if (!id) {
    return NextResponse.json(
      { message: "Invite id is required" },
      { status: 400 }
    );
  }

  // 3️⃣ Fetch invite WITH user roles
  const invite = await prisma.userInvite.findUnique({
    where: { id: id },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ message: "Invite not found" }, { status: 404 });
  }

  if (invite.usedAt) {
    return NextResponse.json(
      { message: "Invite already used" },
      { status: 409 }
    );
  }

  // 4️⃣ Authorization rule
  // RESOURCE MANAGER cannot cancel invite for another RESOURCE MANAGER
  const invitedUserRoleNames = invite.user.roles.map((ur) => ur.role.name);

  if (
    invitedUserRoleNames.includes("RESOURCE MANAGER") ||
    invitedUserRoleNames.includes("ADMIN")
  ) {
    return NextResponse.json(
      { message: "You are not authorized to revoke this invite" },
      { status: 403 }
    );
  }

  // 5️⃣ Atomic cleanup
  await prisma.$transaction([
    prisma.userInvite.delete({
      where: { id: id },
    }),
    prisma.user.delete({
      where: { id: invite.userId },
    }),
  ]);

  return NextResponse.json(
    { message: "Invite cancelled and user removed" },
    { status: 200 }
  );
}
