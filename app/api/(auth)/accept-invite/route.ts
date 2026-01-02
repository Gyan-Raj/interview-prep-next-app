import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // 1️⃣ Token presence
  if (!token) {
    return NextResponse.json(
      { message: "Invite token is required" },
      { status: 400 }
    );
  }

  // 2️⃣ Find invite
  const invite = await prisma.userInvite.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          activeRole: true,
        },
      },
    },
  });

  // 3️⃣ Invalid token
  if (!invite) {
    return NextResponse.json(
      { message: "Invalid invite link" },
      { status: 400 }
    );
  }

  // 4️⃣ Already used
  if (invite.usedAt) {
    return NextResponse.json(
      { message: "Invite link has already been used" },
      { status: 409 }
    );
  }

  // 5️⃣ Expired
  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "Invite link has expired" },
      { status: 410 }
    );
  }

  const user = invite.user;

  // 6️⃣ Safety check (should never happen)
  if (!user) {
    return NextResponse.json(
      { message: "Invite user not found" },
      { status: 500 }
    );
  }

  // 7️⃣ Minimal, safe response
  return NextResponse.json(
    {
      message: "Invite is valid",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        activeRole: user.activeRole
          ? {
              id: user.activeRole.id,
              name: user.activeRole.name,
            }
          : null,
        roles: user.roles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
        })),
      },
    },
    { status: 200 }
  );
}
