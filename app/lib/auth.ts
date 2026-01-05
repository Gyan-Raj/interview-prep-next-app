import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AuthUser, RoleOps } from "../types";
import { prisma } from "../db/prisma";

const secretKey = process.env.SECRET_KEY!;
type JwtPayload = {
  id: string;
};

function toRoleOps(name: string): RoleOps {
  switch (name) {
    case "ADMIN":
    case "RESOURCE MANAGER":
    case "RESOURCE":
      return name;
    default:
      throw new Error(`Invalid role name from DB: ${name}`);
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, secretKey) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        roles: { include: { role: true } },
        activeRole: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      activeRole: user.activeRole
        ? {
            id: user.activeRole.id,
            name: toRoleOps(user.activeRole.name),
          }
        : null,

      roles: user.roles.map((ur) => ({
        id: ur.role.id,
        name: toRoleOps(ur.role.name),
      })),
    };
  } catch {
    return null;
  }
}
