import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/app/db/prisma";
import { RoleOps, AuthUser } from "@/app/types";

const secretKey = process.env.SECRET_KEY!;

type JwtPayload = {
  sub: string;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, secretKey) as JwtPayload;
    console.log(payload, "payload");
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub }, // ✅ FIXED
    include: {
      roles: { include: { role: true } },
      activeRole: true,
    },
  });

  if (!user || !user.activeRole) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    activeRole: {
      id: user.activeRole.id,
      name: user.activeRole.name as RoleOps,
    },
    roles: user.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name as RoleOps,
    })),
  };
}
