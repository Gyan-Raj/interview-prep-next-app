import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { getAuthUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  // 1️⃣ Auth check
  const authUser = await getAuthUser();

  if (!authUser || authUser.activeRole?.name !== "RESOURCE MANAGER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  // 2️⃣ Parse query params
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("searchText")?.trim() || undefined;

  // 3️⃣ Base where clause: must be RESOURCE
  const where: any = {
    AND: [
      {
        roles: {
          some: {
            role: { name: "RESOURCE" },
          },
        },
      },
      {
        invites: {
          none: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
        },
      },
    ],
  };

  // 4️⃣ Optional search
  if (query) {
    where.AND!.push({
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  // 5️⃣ Fetch users (bounded)
  const users = await prisma.user.findMany({
    where,
    take: query ? 10 : 5,
    orderBy: { name: "asc" },
  });

  // 6️⃣ Shape response
  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    }))
  );
}
