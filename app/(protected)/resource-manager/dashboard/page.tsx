import { getAuthUser } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/app/db/prisma";
import ResourceManagerDashboardClient from "./ResourceManagerDashboardClient";

export default async function ResourceManagerDashboard() {
  const user = await getAuthUser();

  if (!user || user?.activeRole?.name !== "RESOURCE MANAGER") {
    notFound();
  }

  const roles = await prisma.role.findMany({
    where: {
      name: {
        not: "ADMIN",
      },
    },
  });

  const roleCounts = await prisma.userRole.groupBy({
    by: ["roleId"],
    where: {
      role: {
        name: {
          not: "ADMIN",
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

  return (
    <ResourceManagerDashboardClient
      user={user}
      roles={roles}
      roleCounts={roleCounts}
      pendingInvites={pendingInvites.map((i) => ({
        inviteId: i.id,
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
