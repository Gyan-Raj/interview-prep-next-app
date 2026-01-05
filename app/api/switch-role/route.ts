import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { createSession } from "@/app/lib/session";

const secretKey = process.env.SECRET_KEY!;

export async function POST(req: Request) {
  const authUser = await getAuthUser();

  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { roleId } = await req.json();

  // 1️⃣ Validate role
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  // 2️⃣ Validate assignment
  const userRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId: authUser.id,
        roleId: role.id,
      },
    },
  });

  if (!userRole) {
    return NextResponse.json(
      { message: "Role not assigned to user" },
      { status: 403 }
    );
  }

  // 3️⃣ Update active role
  await prisma.user.update({
    where: { id: authUser.id },
    data: { activeRoleId: role.id },
  });

  // 4️⃣ Re-fetch fresh user state (IMPORTANT)
  const updatedUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      roles: { include: { role: true } },
      activeRole: true,
    },
  });

  if (!updatedUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 5️⃣ Build payload from DB (NOT JWT)
  const payload = {
    id: updatedUser.id,
    email: updatedUser.email,
    phone: updatedUser.phone,
    name: updatedUser.name,
    activeRole: updatedUser.activeRole,
    roles: updatedUser.roles.map((ur) => ur.role),
  };

  const accessToken = jwt.sign(payload, secretKey, {
    expiresIn: "15m",
  });

  // const refreshToken = jwt.sign(payload, secretKey, {
  //   expiresIn: "90d",
  // });

  // await createSession(updatedUser.id);

  // 6️⃣ Return updated user for Redux
  const response = NextResponse.json(
    {
      message: "Role switched successfully",
      data: payload,
    },
    { status: 200 }
  );

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });

  // response.cookies.set("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   path: "/",
  //   maxAge: 90 * 24 * 60 * 60,
  // });

  return response;
}
