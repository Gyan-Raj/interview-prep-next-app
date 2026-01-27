import { getAuthUser } from "@/app/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/db/prisma";
import ResourceDashboardClient from "./ResourceDashboardClient";
import { SubmissionVersionStatus } from "@prisma/client";
import { SubmissionRow } from "@/app/types";

export default async function ResourceDashboard() {
  const user = await getAuthUser();

  if (!user || !user.activeRole) {
    redirect("/");
  }

  if (user.activeRole?.name !== "RESOURCE") {
    notFound();
  }

  const [totalQuestions, myQuestionsCount, myInterviewsCount, submissions] =
    await Promise.all([
      // 1️⃣ Total questions (global)
      prisma.question.count(),

      // 2️⃣ Questions submitted by this resource
      prisma.question.count({
        where: {
          submissionVersion: {
            submission: {
              interview: {
                resourceId: user.id,
              },
            },
          },
        },
      }),

      // 3️⃣ Total interviews for this resource
      prisma.interview.count({
        where: {
          resourceId: user.id,
        },
      }),

      // 4️⃣ Submissions with ONLY latest version (same as API)
      prisma.submission.findMany({
        where: {
          interview: {
            resourceId: user.id,
          },
        },
        include: {
          interview: {
            include: {
              company: true,
              role: true,
              round: true,
            },
          },
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1, // ✅ MUST be present (same as API)
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  /**
   * Keep only submissions whose LATEST version is NOT approved
   */
  const requestedSubmissions: SubmissionRow[] = submissions
    .map((s) => {
      const latest = s.versions[0];
      if (!latest || latest.status === SubmissionVersionStatus.APPROVED) {
        return null;
      }

      return {
        submissionId: s.id,
        submissionVersionId: latest.id,
        versionNumber: latest.versionNumber,
        status: latest.status,
        submittedAt: latest.submittedAt
          ? latest.submittedAt.toISOString()
          : null,

        interview: {
          id: s.interview.id,
          companyName: s.interview.company.name,
          role: s.interview.role.name,
          round: s.interview.round.name,
          interviewDate: s.interview.interviewDate.toISOString(),
        },
      };
    })
    .filter(Boolean) as SubmissionRow[];

  return (
    <ResourceDashboardClient
      user={user}
      stats={{
        totalQuestions,
        myQuestionsCount,
        myInterviewsCount,
      }}
      requestedSubmissions={requestedSubmissions}
    />
  );
}
