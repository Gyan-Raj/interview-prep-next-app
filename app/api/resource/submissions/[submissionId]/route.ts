import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import { prisma } from "@/app/db/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ submissionId: string; isSelf?: boolean }> },
) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // ✅ MUST await params
  const { submissionId } = await context.params;

  const { searchParams } = new URL(req.url);
  const isSelf = searchParams.get("isSelf") === "true";

  const latestVersion = await prisma.submissionVersion.findFirst({
    where: {
      submissionId, // ✅ now correctly applied
      submission: {
        interview: {
          resourceId: isSelf ? authUser.id : undefined,
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
              resource: true,
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
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      submissionId: latestVersion.submissionId,
      submissionVersionId: latestVersion.id,
      versionNumber: latestVersion.versionNumber,
      submittedAt: latestVersion.submittedAt,
      status: isSelf ? latestVersion.status : null,
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
      resource: isSelf
        ? null
        : {
            id: latestVersion.submission.interview.resource.id,
            name: latestVersion.submission.interview.resource.name,
            email: latestVersion.submission.interview.resource.email,
            phone: latestVersion.submission.interview.resource.phone,
          },
    },
    { status: 200 },
  );
}
