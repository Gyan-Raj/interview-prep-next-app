"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptInvite } from "../actions";

export default function AcceptInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    async function validateInvite() {
      // 1️⃣ No token → invalid entry
      if (!token) {
        router.replace("/");
        return;
      }

      try {
        // const res = await fetch(`/api/accept-invite?token=${token}`);
        const res = await acceptInvite(token);

        // 2️⃣ Invalid / expired / used → redirect home
        if (res.status !== 200) {
          router.replace("/");
          return;
        }

        // 3️⃣ Valid invite → go to change password
        router.replace(`/change-password?token=${token}`);
      } catch (error) {
        console.error("Accept invite failed:", error);
        router.replace("/");
      }
    }

    validateInvite();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center h-screen text-sm opacity-70">
      Validating invitation…
    </div>
  );
}
