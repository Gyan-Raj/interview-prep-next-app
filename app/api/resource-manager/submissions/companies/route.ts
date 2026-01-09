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
  const query = searchParams.get("searchText")?.trim() || undefined;

  // 3️⃣ Fetch companies (bounded + active only)
  const companies = await prisma.company.findMany({
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
    companies.map((company) => ({
      id: company.id,
      name: company.name,
    }))
  );
}
