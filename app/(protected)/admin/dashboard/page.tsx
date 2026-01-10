import { getAuthUser } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/app/db/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const user = await getAuthUser();

  if (!user || user?.activeRole?.name !== "ADMIN") {
    notFound();
  }

  const roles = await prisma.role.findMany();

  const roleCounts = await prisma.userRole.groupBy({
    by: ["roleId"],
    where: {
      user: {
        invites: {
          none: {
            usedAt: null,
          },
        },
      },
    },
    _count: {
      roleId: true,
    },
  });

  const pendingInvites = await prisma.userInvite.findMany({
    where: {
      usedAt: null,
      expiresAt: { gt: new Date() },
      user: {
        password: null,
        sessions: { none: {} },
      },
    },
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

  const expiredInvites = await prisma.userInvite.findMany({
    where: {
      usedAt: null,
      expiresAt: { lt: new Date() },

      user: {
        password: null,
        sessions: { none: {} },
      },
    },
    include: {
      user: {
        include: {
          roles: {
            include: { role: true },
          },
        },
      },
    },
  });

  return (
    <AdminDashboardClient
      user={user}
      roles={roles}
      roleCounts={roleCounts}
      pendingInvites={pendingInvites.map((i) => ({
        id: i.id,
        userId: i.user.id,
        name: i.user.name ?? undefined,
        email: i.user.email,
        phone: i.user.phone ?? undefined,
        roles: i.user.roles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
        })),
      }))}
      expiredInvites={expiredInvites.map((i) => ({
        id: i.id,
        userId: i.user.id,
        name: i.user.name ?? undefined,
        email: i.user.email,
        phone: i.user.phone ?? undefined,
        roles: i.user.roles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
        })),
      }))}
    />
  );
}
