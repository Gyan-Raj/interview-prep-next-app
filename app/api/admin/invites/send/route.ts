import { getAuthUser } from "@/app/lib/auth";
import { sendInviteMail } from "@/app/lib/mail";
import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  // 1️⃣ Auth check (ADMIN only)
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse body
  const body = await req.json();

  const { name, email, phone, roleIds } = body as {
    name?: string;
    email?: string;
    phone?: string;
    roleIds?: string[];
  };

  if (!email || !Array.isArray(roleIds) || roleIds.length === 0) {
    return NextResponse.json(
      { message: "Email and at least one role are required" },
      { status: 400 }
    );
  }

  // 3️⃣ Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "User with this email already exists" },
      { status: 409 }
    );
  }

  // 4️⃣ Create user (NO PASSWORD)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,

      createdById: authUser.id,

      activeRoleId: roleIds[0],

      roles: {
        create: roleIds.map((roleId) => ({
          role: {
            connect: { id: roleId },
          },
        })),
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      activeRole: true,
    },
  });

  // 5️⃣ Create invite
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 72); // 72 hours

  await prisma.userInvite.create({
    data: {
      userId: user.id,
      token: inviteToken,
      expiresAt,
      createdById: authUser.id,
    },
  });

  // 6️⃣ Send invite email (best-effort)
  const inviteLink = `${process.env.APP_URL}/accept-invite?token=${inviteToken}`;

  const mailSent = await sendInviteMail({
    toEmail: user.email,
    toName: user.name ?? "",
    inviteLink,
  });

  // 7️⃣ Admin-safe response
  return NextResponse.json(
    {
      message: mailSent
        ? "Invite link created and sent on mail successfully"
        : "Invite link created but mail could not be sent",
    },
    { status: 201 }
  );
}
