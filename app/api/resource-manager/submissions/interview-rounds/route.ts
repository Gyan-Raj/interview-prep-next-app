import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse query params
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || undefined;

  // 3️⃣ Fetch interview rounds (bounded + active only)
  const interviewRounds = await prisma.interviewRound.findMany({
    where: {
      isActive: true,
      ...(query && {
        name: { contains: query, mode: "insensitive" },
      }),
    },
    take: query ? 10 : 5,
    orderBy: { name: "asc" },
  });

  // 4️⃣ Shape response
  return NextResponse.json(
    interviewRounds.map((interviewRound) => ({
      id: interviewRound.id,
      name: interviewRound.name,
    }))
  );
}
