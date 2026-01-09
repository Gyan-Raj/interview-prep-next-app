import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import { prisma } from "@/app/db/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ submissionVersionId: string }> }
) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // ✅ FIX: await params
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

      return { submissionVersionId };
    });

    return NextResponse.json(
      { deletedSubmissionVersionId: result.submissionVersionId },
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
