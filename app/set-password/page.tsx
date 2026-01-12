import { Suspense } from "react";
import ChangePasswordClient from "@/app/set-password/SetPasswordClient";

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
