import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { SubmissionVersionStatus } from "@prisma/client";

/**
 * GET /resource/submissions
 * List submission versions for RM review
 */

export async function GET(req: Request) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const searchText = searchParams.get("searchText")?.trim();
  const statusParam = searchParams.get("submissionStatuses");

  const statuses = statusParam
    ? statusParam
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is SubmissionVersionStatus =>
          Object.values(SubmissionVersionStatus).includes(
            s as SubmissionVersionStatus
          )
        )
    : undefined;

  const where: any = {
    interview: {
      resourceId: authUser.id,
    },
  };

  if (searchText) {
    where.OR = [
      {
        interview: {
          company: { name: { contains: searchText, mode: "insensitive" } },
        },
      },
      {
        interview: {
          role: { name: { contains: searchText, mode: "insensitive" } },
        },
      },
      {
        interview: {
          round: { name: { contains: searchText, mode: "insensitive" } },
        },
      },
    ];
  }

  const submissions = await prisma.submission.findMany({
    where,
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
        take: 1, // ALWAYS latest
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const response = submissions
    .filter((s) => s.versions.length === 1)
    .filter((s) => (statuses ? statuses.includes(s.versions[0].status) : true))
    .map((s) => {
      const latest = s.versions[0];

      return {
        submissionId: s.id,
        submissionVersionId: latest.id,
        versionNumber: latest.versionNumber,
        submittedAt: latest.submittedAt,
        status: latest.status,
        interview: {
          id: s.interview.id,
          companyName: s.interview.company.name,
          role: s.interview.role.name,
          round: s.interview.round.name,
          interviewDate: s.interview.interviewDate.toISOString(),
        },
      };
    });

  return NextResponse.json(response, { status: 200 });
}

export async function PATCH(req: Request) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { submissionId, action, questions } = (await req.json()) as {
    submissionId: string;
    action: "save" | "submit";
    questions: { text: string; mediaUrl?: string | null }[];
  };

  if (!submissionId || !action || !questions || questions.length === 0) {
    return NextResponse.json(
      { message: "submissionId, action and questions are required" },
      { status: 400 }
    );
  }

  // 1️⃣ Fetch submission with latest version
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      interview: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!submission) {
    return NextResponse.json(
      { message: "Submission not found" },
      { status: 404 }
    );
  }

  // 2️⃣ Security: ensure this submission belongs to resource
  if (submission.interview.resourceId !== authUser.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const latestVersion = submission.versions[0];

  if (!latestVersion) {
    return NextResponse.json(
      { message: "Submission version not found" },
      { status: 404 }
    );
  }

  // 3️⃣ SAVE → update same DRAFT version
  if (action === "save") {
    if (latestVersion.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Only DRAFT submissions can be saved" },
        { status: 400 }
      );
    }

    await prisma.question.deleteMany({
      where: { submissionVersionId: latestVersion.id },
    });

    await prisma.question.createMany({
      data: questions.map((q) => ({
        submissionVersionId: latestVersion.id,
        text: q.text,
        mediaUrl: q.mediaUrl ?? null,
      })),
    });

    return NextResponse.json({ status: "saved" }, { status: 200 });
  }

  // 4️⃣ SUBMIT → create NEW version
  if (action === "submit") {
    if (latestVersion.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Only DRAFT submissions can be submitted" },
        { status: 400 }
      );
    }

    const newVersion = await prisma.submissionVersion.create({
      data: {
        submissionId,
        versionNumber: latestVersion.versionNumber + 1,
        status: "PENDING_REVIEW",
        submittedAt: new Date(),
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            mediaUrl: q.mediaUrl ?? null,
          })),
        },
      },
    });

    return NextResponse.json(
      { submissionVersionId: newVersion.id },
      { status: 200 }
    );
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
