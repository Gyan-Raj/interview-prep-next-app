import { Suspense } from "react";
import AcceptInviteClient from "@/app/accept-invite/AcceptInviteClient";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-sm opacity-70">
          Validating invitation…
        </div>
      }
    >
      <AcceptInviteClient />
    </Suspense>
  );
}
