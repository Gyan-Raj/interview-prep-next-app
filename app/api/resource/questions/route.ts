// app/api/resource/questions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const searchText = searchParams.get("searchText")?.trim() || "";
  const roleIds = searchParams.get("roleIds")?.split(",").filter(Boolean) || [];
  const companyIds =
    searchParams.get("companyIds")?.split(",").filter(Boolean) || [];
  const roundIds =
    searchParams.get("roundIds")?.split(",").filter(Boolean) || [];
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  // pagination params
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);
  const limit = Math.max(Number(searchParams.get("limit") || "20"), 1);
  const offset = (page - 1) * limit;

  // If `approvedOnly` param exists and is "true", keep the current behavior.
  const approvedOnly = searchParams.get("approvedOnly") === "true" || false;

  /**
   * 1️⃣ Get LATEST APPROVED submissionVersion per submission (if approvedOnly)
   *    If there's no approvedOnly requirement, we still want latest versions per submission,
   *    but to keep the behavior consistent we'll keep the approved-only path.
   */
  if (approvedOnly) {
    const latestApprovedVersions = await prisma.submissionVersion.findMany({
      where: {
        status: "APPROVED",
        submission: {
          interview: {
            ...(companyIds.length && { companyId: { in: companyIds } }),
            ...(roleIds.length && { roleId: { in: roleIds } }),
            ...(roundIds.length && { roundId: { in: roundIds } }),
          },
        },
      },
      orderBy: [{ submissionId: "asc" }, { versionNumber: "desc" }],
      distinct: ["submissionId"],
      select: { id: true },
    });

    const versionIds = latestApprovedVersions.map((v) => v.id);

    if (versionIds.length === 0) {
      return NextResponse.json(
        { questions: [], hasMore: false, page, limit },
        { status: 200 }
      );
    }

    // Fetch limit+1 to determine hasMore
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
      skip: offset,
      take: limit + 1,
    });

    const hasMore = questions.length > limit;
    const trimmed = hasMore ? questions.slice(0, limit) : questions;

    const response = trimmed.map((q) => ({
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

    return NextResponse.json(
      { questions: response, hasMore, page, limit },
      { status: 200 }
    );
  } else {
    /**
     * Optionally handle non-approved path. For now, we'll return the latest versions
     * irrespective of status similar to approved-only approach but without status filter.
     */
    const latestVersions = await prisma.submissionVersion.findMany({
      where: {
        submission: {
          interview: {
            ...(companyIds.length && { companyId: { in: companyIds } }),
            ...(roleIds.length && { roleId: { in: roleIds } }),
            ...(roundIds.length && { roundId: { in: roundIds } }),
          },
        },
      },
      orderBy: [{ submissionId: "asc" }, { versionNumber: "desc" }],
      distinct: ["submissionId"],
      select: { id: true },
    });

    const versionIds = latestVersions.map((v) => v.id);
    if (versionIds.length === 0) {
      return NextResponse.json(
        { questions: [], hasMore: false, page, limit },
        { status: 200 }
      );
    }

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
      skip: offset,
      take: limit + 1,
    });

    const hasMore = questions.length > limit;
    const trimmed = hasMore ? questions.slice(0, limit) : questions;

    const response = trimmed.map((q) => ({
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

    return NextResponse.json(
      { questions: response, hasMore, page, limit },
      { status: 200 }
    );
  }
}
