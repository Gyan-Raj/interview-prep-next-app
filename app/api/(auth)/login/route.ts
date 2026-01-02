import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/db/prisma";
import { createSession } from "@/app/lib/session";

const secretKey = process.env.SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch user with roles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
        activeRole: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    if (!user.password) {
      return NextResponse.json(
        { message: "Account not activated. Please accept the invite first." },
        { status: 403 }
      );
    }
    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 403 }
      );
    }

    // 3️⃣ Ensure user has at least one role
    if (!user.roles.length) {
      return NextResponse.json(
        { message: "User has no assigned roles" },
        { status: 403 }
      );
    }

    // 4️⃣ Resolve active role
    let activeRole = user.activeRole;

    if (!activeRole) {
      activeRole = user.roles[0].role;

      await prisma.user.update({
        where: { id: user.id },
        data: { activeRoleId: activeRole.id },
      });
    }

    // 5️⃣ JWT payload uses ACTIVE role only
    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      activeRole: activeRole,
      roles: user.roles.map((ur) => ur.role),
    };

    const accessToken = jwt.sign(payload, secretKey, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, secretKey, {
      expiresIn: "90d",
    });

    // 6️⃣ Persist session
    await createSession(user.id);

    // 7️⃣ Response includes available roles
    const response = NextResponse.json(
      {
        message: "Logged in successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          activeRole: activeRole,
          roles: user.roles.map((ur) => ur.role),
        },
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

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 90 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Failed to login, please try again later" },
      { status: 500 }
    );
  }
}
