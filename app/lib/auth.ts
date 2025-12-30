import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AuthUser } from "../types";

const secretKey = process.env.SECRET_KEY!;

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const user = jwt.verify(token, secretKey) as AuthUser;
    return user;
  } catch {
    return null;
  }
}
