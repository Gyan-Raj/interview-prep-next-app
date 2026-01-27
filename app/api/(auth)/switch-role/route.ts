import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

const SECRET_KEY = process.env.SECRET_KEY!;

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

  // 4️⃣ Issue a NEW ACCESS TOKEN (identity only)
  const accessToken = jwt.sign({ sub: authUser.id }, SECRET_KEY, {
    expiresIn: "15m",
  });

  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  return response;
}
