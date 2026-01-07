import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";

export async function GET() {
  const user = await getAuthUser();

  if (!user || !user.activeRole) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    activeRole: user.activeRole,
  });
}
