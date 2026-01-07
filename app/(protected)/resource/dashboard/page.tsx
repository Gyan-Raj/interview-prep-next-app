import { getAuthUser } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/app/db/prisma";
import ResourceDashboardClient from "./ResourceDashboardClient";

export default async function ResourceDashboard() {
  const user = await getAuthUser();

  if (!user || user.activeRole?.name !== "RESOURCE") {
    notFound();
  }

  const [
    totalQuestions,
    myQuestionsCount,
    myInterviewsCount,
    nonApprovedVersions,
  ] = await Promise.all([
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

    // 4️⃣ All NON-approved submission versions for this resource
    prisma.submissionVersion.findMany({
      where: {
        status: {
          in: ["DRAFT", "PENDING_REVIEW", "REJECTED"],
        },
        submission: {
          interview: {
            resourceId: user.id,
          },
        },
      },
      include: {
        submission: {
          include: {
            interview: {
              include: {
                company: true,
                role: true,
                round: true,
              },
            },
          },
        },
      },
      orderBy: [{ submissionId: "asc" }, { versionNumber: "desc" }],
    }),
  ]);

  /**
   * 5️⃣ Reduce to latest version per submission
   */
  const latestBySubmission = new Map<string, (typeof nonApprovedVersions)[0]>();

  for (const v of nonApprovedVersions) {
    if (!latestBySubmission.has(v.submissionId)) {
      latestBySubmission.set(v.submissionId, v);
    }
  }

  const requestedSubmissions = Array.from(latestBySubmission.values());

  return (
    <ResourceDashboardClient
      user={user}
      stats={{
        totalQuestions,
        myQuestionsCount,
        myInterviewsCount,
      }}
      requestedSubmissions={requestedSubmissions.map((v) => {
        if (v.status === "APPROVED") {
          throw new Error("Invariant violation: APPROVED submission leaked");
        }
        return {
          submissionVersionId: v.id,
          submissionId: v.submissionId,
          versionNumber: v.versionNumber,
          status: v.status, // now TS knows this is safe
          submittedAt: v.submittedAt ? v.submittedAt.toISOString() : null,
          interview: {
            company: v.submission.interview.company.name,
            role: v.submission.interview.role.name,
            round: v.submission.interview.round.name,
            interviewDate: v.submission.interview.interviewDate,
          },
        };
      })}
    />
  );
}
