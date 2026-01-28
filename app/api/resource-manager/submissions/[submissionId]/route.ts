import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import { prisma } from "@/app/db/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ submissionId: string }> }
) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
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
      resource: {
        id: latestVersion.submission.interview.resource.id,
        name: latestVersion.submission.interview.resource.name,
        email: latestVersion.submission.interview.resource.email,
        phone: latestVersion.submission.interview.resource.phone,
      },
    },
    { status: 200 }
  );
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ submissionId: string }> }
) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  // ✅ FIX: await params
  const { submissionId } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const version = await tx.submissionVersion.findUnique({
        where: { id: submissionId },
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

      // Guardrails
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

      // Delete in correct order
      await tx.submissionVersion.delete({
        where: { id: version.id },
      });

      await tx.submission.delete({
        where: { id: version.submissionId },
      });

      await tx.interview.delete({
        where: { id: version.submission.interviewId },
      });

      return { submissionId };
    });

    return NextResponse.json(
      { deletedSubmissionVersionId: result.submissionId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting submission:", error);

    return NextResponse.json(
      { message: error.message || "Failed to delete submission" },
      { status: 400 }
    );
  }
}
