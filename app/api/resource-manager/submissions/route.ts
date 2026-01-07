import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

/**
 * GET /resource-manager/submissions
 * List submission versions for RM review
 */
export async function GET(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse query params
  const { searchParams } = new URL(req.url);

  const searchText = searchParams.get("searchText")?.trim() || undefined;
  const statusParam = searchParams.get("submissionStatusIds");

  const statuses = statusParam
    ? statusParam.split(",").filter(Boolean)
    : undefined;

  /**
   * 3️⃣ Build where clause
   * We query SubmissionVersion directly (correct abstraction)
   */
  const where: any = {
    ...(statuses && {
      status: {
        in: statuses,
      },
    }),
  };

  // 🔍 Search across interview + resource
  if (searchText) {
    where.OR = [
      {
        submission: {
          interview: {
            company: {
              name: { contains: searchText, mode: "insensitive" },
            },
          },
        },
      },
      {
        submission: {
          interview: {
            role: {
              name: { contains: searchText, mode: "insensitive" },
            },
          },
        },
      },
      {
        submission: {
          interview: {
            round: {
              name: { contains: searchText, mode: "insensitive" },
            },
          },
        },
      },
      {
        submission: {
          interview: {
            resource: {
              name: { contains: searchText, mode: "insensitive" },
            },
          },
        },
      },
      {
        submission: {
          interview: {
            resource: {
              email: { contains: searchText, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  /**
   * 4️⃣ Fetch submission versions
   * Important:
   * - We return ALL versions (latest is what RM acts on)
   * - Sorting ensures newest first
   */
  const submissionVersions = await prisma.submissionVersion.findMany({
    where,
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
    orderBy: [{ createdAt: "desc" }],
  });

  /**
   * 5️⃣ Shape response
   * MUST MATCH PATCH RESPONSE SHAPE
   */
  const response = submissionVersions.map((sv) => ({
    submissionVersionId: sv.id,
    versionNumber: sv.versionNumber,
    submittedAt: sv.submittedAt,

    interview: {
      id: sv.submission.interview.id,
      companyName: sv.submission.interview.company.name,
      role: sv.submission.interview.role.name,
      round: sv.submission.interview.round.name,
      interviewDate: sv.submission.interview.interviewDate.toISOString(),
    },

    resource: {
      id: sv.submission.interview.resource.id,
      name: sv.submission.interview.resource.name,
      email: sv.submission.interview.resource.email,
      phone: sv.submission.interview.resource.phone,
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

      return { interview, submission };
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

  const { submissionVersionId, action } = (await req.json()) as {
    submissionVersionId: string;
    action: "APPROVED" | "REJECTED";
  };

  if (!submissionVersionId || !action) {
    return NextResponse.json(
      { message: "submissionVersionId and action are required" },
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
              resource: true, // ✅ FIXED
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

  const updated = await prisma.submissionVersion.update({
    where: { id: submissionVersionId },
    data: {
      status: action,
      submittedAt: action === "APPROVED" ? new Date() : null,
    },
    include: {
      submission: {
        include: {
          interview: {
            include: {
              company: true,
              role: true,
              round: true,
              resource: true, // ✅ FIXED
            },
          },
        },
      },
    },
  });

  const response = {
    submissionVersionId: updated.id,
    versionNumber: updated.versionNumber,
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
