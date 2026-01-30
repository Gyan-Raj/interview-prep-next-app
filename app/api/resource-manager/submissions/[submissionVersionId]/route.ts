import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import { prisma } from "@/app/db/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ submissionVersionId: string }> },
) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const { submissionVersionId } = await context.params;

  const submissionVersion = await prisma.submissionVersion.findUnique({
    where: { id: submissionVersionId },
    include: {
      questions: true,
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 1, // ✅ latest review only
        select: {
          decision: true,
          reason: true,
          reviewedAt: true,
          reviewedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
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
  });

  if (!submissionVersion) {
    return NextResponse.json(
      { message: "Submission not found" },
      { status: 404 },
    );
  }

  let lastRejectedReason: string | null = null;
  if (submissionVersion.status !== "APPROVED") {
    const lastRejectedReview = await prisma.review.findFirst({
      where: {
        decision: "REJECTED",
        submissionVersion: {
          submissionId: submissionVersion.submissionId,
        },
      },
      orderBy: {
        reviewedAt: "desc",
      },
      select: {
        reason: true,
      },
    });

    lastRejectedReason = lastRejectedReview?.reason ?? null;
  }

  return NextResponse.json(
    {
      submissionId: submissionVersion.submissionId,
      submissionVersionId: submissionVersion.id,
      versionNumber: submissionVersion.versionNumber,
      submittedAt: submissionVersion.submittedAt,
      status: submissionVersion.status,
      rejectionReason:
        submissionVersion.status === "APPROVED" ? null : lastRejectedReason,
      interview: {
        id: submissionVersion.submission.interview.id,
        companyName: submissionVersion.submission.interview.company.name,
        role: submissionVersion.submission.interview.role.name,
        round: submissionVersion.submission.interview.round.name,
        interviewDate:
          submissionVersion.submission.interview.interviewDate.toISOString(),
      },
      questions: submissionVersion.questions.map((q) => ({
        id: q.id,
        question: q,
        createdAt: q.createdAt.toISOString(),
      })),
      resource: {
        id: submissionVersion.submission.interview.resource.id,
        name: submissionVersion.submission.interview.resource.name,
        email: submissionVersion.submission.interview.resource.email,
        phone: submissionVersion.submission.interview.resource.phone,
      },
    },
    { status: 200 },
  );
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ submissionVersionId: string }> },
) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const { submissionVersionId } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const version = await tx.submissionVersion.findUnique({
        where: { id: submissionVersionId },
        include: {
          submission: {
            include: {
              interview: true,
              versions: true,
            },
          },
        },
      });

      if (!version) {
        throw new Error("Submission version not found");
      }

      // Guardrails (your logic is solid)
      if (version.versionNumber !== 1) {
        throw new Error("Only initial submission version can be deleted");
      }

      if (version.status !== "DRAFT" || version.submittedAt) {
        throw new Error("Submission already acted upon by resource");
      }

      if (version.submission.versions.length > 1) {
        throw new Error("Cannot delete submission with multiple versions");
      }

      if (version.submission.interview.createdVia !== "RM_REQUEST") {
        throw new Error("Only RM-created submissions can be deleted");
      }

      await tx.submissionVersion.delete({
        where: { id: version.id },
      });

      await tx.submission.delete({
        where: { id: version.submissionId },
      });

      await tx.interview.delete({
        where: { id: version.submission.interviewId },
      });

      return { submissionVersionId };
    });

    return NextResponse.json(
      { deletedSubmissionVersionId: result.submissionVersionId },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete submission" },
      { status: 400 },
    );
  }
}
