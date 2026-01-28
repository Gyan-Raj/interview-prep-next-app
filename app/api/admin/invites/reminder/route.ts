import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { sendInviteReminderMail } from "@/app/lib/mail/templates";

export async function POST(req: Request) {
  // 1️⃣ Auth check (ADMIN only)
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  // 2️⃣ Parse body
  const { id } = (await req.json()) as { id?: string };

  if (!id) {
    return NextResponse.json(
      { message: "Invite id is required" },
      { status: 400 }
    );
  }

  // 3️⃣ Fetch invite + user
  const invite = await prisma.userInvite.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          sessions: true,
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ message: "Invite not found" }, { status: 404 });
  }

  // 4️⃣ Prevent resend if user already onboarded
  if (invite.user.password || invite.user.sessions.length > 0) {
    return NextResponse.json(
      { message: "User already onboarded" },
      { status: 409 }
    );
  }

  // 5️⃣ Generate new invite
  const newToken = crypto.randomBytes(32).toString("hex");
  const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 72); // 72 hours

  // 6️⃣ Atomic replace invite
  await prisma.$transaction([
    prisma.userInvite.delete({
      where: { id },
    }),
    prisma.userInvite.create({
      data: {
        userId: invite.userId,
        token: newToken,
        expiresAt: newExpiry,
        createdById: authUser.id,
      },
    }),
  ]);

  // 7️⃣ Send invite email (best-effort)
  const inviteLink = `${process.env.APP_URL}/accept-invite?token=${newToken}`;

  const mailSent = await sendInviteReminderMail({
    toEmail: invite.user.email,
    toName: invite.user.name ?? "",
    inviteLink,
  });

  return NextResponse.json(
    {
      message: mailSent
        ? "Invite sent again successfully"
        : "Invite regenerated, but mail could not be sent",
    },
    { status: 200 }
  );
}
