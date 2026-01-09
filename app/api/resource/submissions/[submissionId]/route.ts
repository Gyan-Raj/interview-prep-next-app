import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import { prisma } from "@/app/db/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ submissionId: string }> }
) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // ✅ MUST await params
  const { submissionId } = await context.params;

  const latestVersion = await prisma.submissionVersion.findFirst({
    where: {
      submissionId, // ✅ now correctly applied
      submission: {
        interview: {
          resourceId: authUser.id,
        },
      },
    },
    include: {
      questions: true,
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
    orderBy: {
      versionNumber: "desc",
    },
  });

  if (!latestVersion) {
    return NextResponse.json(
      { message: "Submission not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      submissionId: latestVersion.submissionId,
      submissionVersionId: latestVersion.id,
      versionNumber: latestVersion.versionNumber,
      submittedAt: latestVersion.submittedAt,
      status: latestVersion.status,
      interview: {
        id: latestVersion.submission.interview.id,
        companyName: latestVersion.submission.interview.company.name,
        role: latestVersion.submission.interview.role.name,
        round: latestVersion.submission.interview.round.name,
        interviewDate:
          latestVersion.submission.interview.interviewDate.toISOString(),
      },
      questions: latestVersion.questions.map((q) => ({
        id: q.id,
        question: q,
        createdAt: q.createdAt.toISOString(),
      })),
    },
    { status: 200 }
  );
}
