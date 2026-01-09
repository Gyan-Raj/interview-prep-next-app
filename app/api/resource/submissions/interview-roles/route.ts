import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Parse query params
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("searchText")?.trim() || undefined;

  // 3️⃣ Fetch interview roles (bounded + active only)
  const interviewRoles = await prisma.interviewRole.findMany({
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
    interviewRoles.map((interviewRole) => ({
      id: interviewRole.id,
      name: interviewRole.name,
    }))
  );
}
