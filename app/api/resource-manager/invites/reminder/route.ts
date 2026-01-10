import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { sendInviteReminderMail } from "@/app/lib/mail/templates";

export async function POST(req: Request) {
  // 1️⃣ Auth check (RESOURCE MANAGER only)
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

  // 3️⃣ Fetch invite + user
  const invite = await prisma.userInvite.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          roles: {
            include: { role: true },
          },
          sessions: true,
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ message: "Invite not found" }, { status: 404 });
  }

  // 4️⃣ Guard rails
  if (invite.usedAt) {
    return NextResponse.json(
      { message: "Invite already used" },
      { status: 409 }
    );
  }

  if (invite.user.password || invite.user.sessions.length > 0) {
    return NextResponse.json(
      { message: "User already onboarded" },
      { status: 409 }
    );
  }

  // 5️⃣ Authorization rule
  const invitedUserRoleNames = invite.user.roles.map((ur) => ur.role.name);

  if (
    invitedUserRoleNames.includes("RESOURCE MANAGER") ||
    invitedUserRoleNames.includes("ADMIN")
  ) {
    return NextResponse.json(
      { message: "You are not authorized to remind this invite" },
      { status: 403 }
    );
  }

  // 6️⃣ Send reminder mail (NO expiry reset)
  const inviteLink = `${process.env.APP_URL}/accept-invite?token=${invite.token}`;

  const mailSent = await sendInviteReminderMail({
    toEmail: invite.user.email,
    toName: invite.user.name ?? "",
    inviteLink,
  });

  return NextResponse.json(
    {
      message: mailSent
        ? "Invite reminder sent successfully"
        : "Reminder could not be sent",
    },
    { status: 200 }
  );
}
