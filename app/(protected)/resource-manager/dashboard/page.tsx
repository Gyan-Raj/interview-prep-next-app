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
      user: {
        invites: {
          none: {
            usedAt: null,
            expiresAt: {
              gt: new Date(),
            },
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

  const pendingSubmissionsCount = await prisma.submissionVersion.count({
    where: {
      status: "PENDING_REVIEW",
    },
  });

  const pendingSubmissions = await prisma.submissionVersion.findMany({
    where: {
      status: "PENDING_REVIEW", // keep or adjust if needed
    },
    select: {
      id: true,
      submissionId: true,
      versionNumber: true,
      status: true,
      submittedAt: true,
      submission: {
        select: {
          interview: {
            select: {
              id: true,
              interviewDate: true,
              company: {
                select: { name: true },
              },
              role: {
                select: { name: true },
              },
              round: {
                select: { name: true },
              },
              resource: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  return (
    <ResourceManagerDashboardClient
      user={user}
      roles={roles}
      roleCounts={roleCounts}
      pendingSubmissionsCount={pendingSubmissionsCount}
      pendingSubmissions={pendingSubmissions.map((sv) => ({
        submissionId: sv.submissionId,
        submissionVersionId: sv.id,
        versionNumber: sv.versionNumber,
        status: sv.status,
        submittedAt: sv.submittedAt ? sv.submittedAt.toISOString() : null,
        interview: {
          id: sv.submission.interview.id,
          companyName: sv.submission.interview.company.name,
          role: sv.submission.interview.role.name,
          round: sv.submission.interview.round.name,
          interviewDate: sv.submission.interview.interviewDate.toISOString(),
        },
        resource: {
          id: sv.submission.interview.resource.id,
          name: sv.submission.interview.resource.name ?? "—",
          email: sv.submission.interview.resource.email,
          phone: sv.submission.interview.resource.phone ?? undefined,
        },
      }))}
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
    />
  );
}
