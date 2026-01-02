import { Suspense } from "react";
import ChangePasswordClient from "@/app/change-password/ChangePasswordClient";

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-sm opacity-70">
          Loading…
        </div>
      }
    >
      <ChangePasswordClient />
    </Suspense>
  );
}
