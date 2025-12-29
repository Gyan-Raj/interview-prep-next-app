import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AuthUser } from "../types";

const secretKey = process.env.SECRET_KEY!;

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  // console.log(jwt.verify(token, secretKey), "jwt.verify(token, secretKey)");

  if (!token) return null;

  try {
    // console.log();

    return jwt.verify(token, secretKey) as AuthUser;
  } catch {
    return null;
  }
}
