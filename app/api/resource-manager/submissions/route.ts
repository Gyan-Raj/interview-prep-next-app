import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";
import { SubmissionVersionStatus } from "@prisma/client";

/**
 * GET /resource-manager/submissions
 * List submission versions for RM review
 */
export async function GET(req: Request) {
  // 1️⃣ Auth
  const authUser = await getAuthUser();
  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Query params
  const { searchParams } = new URL(req.url);
  const searchText = searchParams.get("searchText")?.trim();
  const statusParam = searchParams.get("submissionStatuses");

  const statuses: SubmissionVersionStatus[] | undefined = statusParam
    ? statusParam
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is SubmissionVersionStatus =>
          Object.values(SubmissionVersionStatus).includes(
            s as SubmissionVersionStatus
          )
        )
    : undefined;

  /**
   * 3️⃣ STEP 1:
   * Find the latest versionNumber per submissionId
   */
  const latestPerSubmission = await prisma.submissionVersion.groupBy({
    by: ["submissionId"],
    _max: {
      versionNumber: true,
    },
  });

  /**
   * 4️⃣ STEP 2:
   * Fetch ONLY those latest versions
   * (filtering happens AFTER latest is resolved)
   */
  const latestVersions = await prisma.submissionVersion.findMany({
    where: {
      OR: latestPerSubmission.map((l) => ({
        submissionId: l.submissionId,
        versionNumber: l._max.versionNumber!,
      })),
      ...(statuses && { status: { in: statuses } }),
      ...(searchText && {
        submission: {
          interview: {
            OR: [
              {
                company: {
                  name: { contains: searchText, mode: "insensitive" },
                },
              },
              { role: { name: { contains: searchText, mode: "insensitive" } } },
              {
                round: { name: { contains: searchText, mode: "insensitive" } },
              },
              {
                resource: {
                  name: { contains: searchText, mode: "insensitive" },
                },
              },
              {
                resource: {
                  email: { contains: searchText, mode: "insensitive" },
                },
              },
            ],
          },
        },
      }),
    },
    include: {
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
    orderBy: { createdAt: "desc" },
  });

  // 5️⃣ Shape response
  const response = latestVersions.map((v) => ({
    submissionId: v.submissionId,
    submissionVersionId: v.id,
    versionNumber: v.versionNumber,
    status: v.status,
    submittedAt: v.submittedAt,

    interview: {
      id: v.submission.interview.id,
      companyName: v.submission.interview.company.name,
      role: v.submission.interview.role.name,
      round: v.submission.interview.round.name,
      interviewDate: v.submission.interview.interviewDate.toISOString(),
    },

    resource: {
      id: v.submission.interview.resource.id,
      name: v.submission.interview.resource.name,
      email: v.submission.interview.resource.email,
      phone: v.submission.interview.resource.phone,
    },
  }));

  return NextResponse.json(response, { status: 200 });
}

/**
 * POST /resource-manager/submissions
 * RM requests a submission for a resource.
 * Missing Company / Role / Round are created atomically.
 */
export async function POST(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse & validate body
  const body = await req.json();

  const { company, role, round, resourceId, interviewDate } = body as {
    company: { id?: string; name?: string };
    role: { id?: string; name?: string };
    round: { id?: string; name?: string };
    resourceId: string;
    interviewDate: string;
  };

  if (
    !company ||
    !role ||
    !round ||
    !resourceId ||
    !interviewDate ||
    (!company.id && !company.name) ||
    (!role.id && !role.name) ||
    (!round.id && !round.name)
  ) {
    return NextResponse.json(
      { message: "Invalid request payload" },
      { status: 400 }
    );
  }

  try {
    // 3️⃣ Atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // 🔹 Resolve Company
      const resolvedCompany = company.id
        ? await tx.company.findUniqueOrThrow({
            where: { id: company.id },
          })
        : await tx.company.upsert({
            where: { name: company.name!.trim() },
            update: {},
            create: { name: company.name!.trim() },
          });

      // 🔹 Resolve Interview Role
      const resolvedRole = role.id
        ? await tx.interviewRole.findUniqueOrThrow({
            where: { id: role.id },
          })
        : await tx.interviewRole.upsert({
            where: { name: role.name!.trim() },
            update: {},
            create: { name: role.name!.trim() },
          });

      // 🔹 Resolve Interview Round
      const resolvedRound = round.id
        ? await tx.interviewRound.findUniqueOrThrow({
            where: { id: round.id },
          })
        : await tx.interviewRound.upsert({
            where: { name: round.name!.trim() },
            update: {},
            create: { name: round.name!.trim() },
          });

      // 🔹 Validate Resource exists
      const resource = await tx.user.findUnique({
        where: { id: resourceId },
        select: { id: true },
      });

      if (!resource) {
        throw new Error("Resource not found");
      }

      // 🔹 Create Interview
      const interview = await tx.interview.create({
        data: {
          companyId: resolvedCompany.id,
          roleId: resolvedRole.id,
          roundId: resolvedRound.id,
          resourceId,
          interviewDate: new Date(interviewDate),
          createdVia: "RM_REQUEST",
          status: "DRAFT",
        },
      });

      // 🔹 Create Submission shell
      const submission = await tx.submission.create({
        data: {
          interviewId: interview.id,
        },
      });
      // 🔹 Create initial Submission Version (REQUIRED)
      const submissionVersion = await tx.submissionVersion.create({
        data: {
          submissionId: submission.id,
          versionNumber: 1,
          status: "DRAFT",
          submittedAt: null,
        },
      });

      return { interview, submission, submissionVersion };
    });

    // 4️⃣ Response
    return NextResponse.json(
      {
        message: "Submission request created",
        interviewId: result.interview.id,
        submissionId: result.submission.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating submission request:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to create submission request",
      },
      { status: 500 }
    );
  }
}

type Body = {
  submissionVersionId: string;
  action: "APPROVED" | "REJECTED";
};

export async function PATCH(req: Request) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { submissionVersionId, action, reason } = (await req.json()) as {
    submissionVersionId: string;
    action: "APPROVED" | "REJECTED";
    reason?: string;
  };

  if (!submissionVersionId || !action) {
    return NextResponse.json(
      { message: "submissionVersionId and action are required" },
      { status: 400 }
    );
  }

  if (action === "REJECTED" && !reason?.trim()) {
    return NextResponse.json(
      { message: "Rejection reason is required" },
      { status: 400 }
    );
  }

  const submissionVersion = await prisma.submissionVersion.findUnique({
    where: { id: submissionVersionId },
    include: {
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
      { message: "Submission version not found" },
      { status: 404 }
    );
  }

  if (submissionVersion.status !== "PENDING_REVIEW") {
    return NextResponse.json(
      { message: "Only PENDING submissions can be reviewed" },
      { status: 400 }
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.submissionVersion.update({
      where: { id: submissionVersionId },
      data: {
        status: action,
      },
      include: {
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
    }),
    prisma.review.create({
      data: {
        submissionVersionId,
        reviewedById: authUser.id,
        decision: action,
        reason: action === "REJECTED" ? reason : null,
      },
    }),
  ]);

  const response = {
    submissionVersionId: updated.id,
    versionNumber: updated.versionNumber,
    status: updated.status,
    submittedAt: updated.submittedAt,

    interview: {
      id: updated.submission.interview.id,
      companyName: updated.submission.interview.company.name,
      role: updated.submission.interview.role.name,
      round: updated.submission.interview.round.name,
      interviewDate: updated.submission.interview.interviewDate.toISOString(),
    },

    resource: {
      id: updated.submission.interview.resource.id,
      name: updated.submission.interview.resource.name,
      email: updated.submission.interview.resource.email,
      phone: updated.submission.interview.resource.phone,
    },
  };

  return NextResponse.json({ updatedSubmission: response }, { status: 200 });
}
