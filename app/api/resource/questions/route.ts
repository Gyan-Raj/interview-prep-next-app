import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const searchText = searchParams.get("searchText")?.trim();
  const roleIds = searchParams.get("roleIds")?.split(",").filter(Boolean);
  const companyIds = searchParams.get("companyIds")?.split(",").filter(Boolean);
  const roundIds = searchParams.get("roundIds")?.split(",").filter(Boolean);
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  /**
   * 1️⃣ Get LATEST APPROVED submissionVersion per submission
   */
  const latestApprovedVersions = await prisma.submissionVersion.findMany({
    where: {
      status: "APPROVED",
      submission: {
        interview: {
          ...(companyIds?.length && { companyId: { in: companyIds } }),
          ...(roleIds?.length && { roleId: { in: roleIds } }),
          ...(roundIds?.length && { roundId: { in: roundIds } }),
        },
      },
    },
    orderBy: [{ submissionId: "asc" }, { versionNumber: "desc" }],
    distinct: ["submissionId"], // 🔥 ensures latest per submission
    select: {
      id: true,
    },
  });

  const versionIds = latestApprovedVersions.map((v) => v.id);

  if (versionIds.length === 0) {
    return NextResponse.json({ questions: [] }, { status: 200 });
  }

  /**
   * 2️⃣ Fetch questions from those versions
   */
  const questions = await prisma.question.findMany({
    where: {
      submissionVersionId: { in: versionIds },
      ...(searchText && {
        text: { contains: searchText, mode: "insensitive" },
      }),
    },
    include: {
      submissionVersion: {
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
      },
    },
    orderBy: { createdAt: sort },
  });

  /**
   * 3️⃣ Shape response
   */
  const response = questions.map((q) => ({
    id: q.id,
    text: q.text,
    tags: q.tags,
    mediaUrl: q.mediaUrl,
    createdAt: q.createdAt.toISOString(),

    submissionVersionId: q.submissionVersionId,

    interview: {
      companyName: q.submissionVersion.submission.interview.company.name,
      role: q.submissionVersion.submission.interview.role.name,
      round: q.submissionVersion.submission.interview.round.name,
      interviewDate:
        q.submissionVersion.submission.interview.interviewDate.toISOString(),
    },
  }));

  return NextResponse.json({ questions: response }, { status: 200 });
}
