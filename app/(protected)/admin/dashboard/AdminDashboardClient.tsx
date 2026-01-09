"use client";

import { useState } from "react";
import CancelInviteDialog from "./CancelInviteDialog";
import { PendingInviteRow } from "@/app/types";
import { canAdminCancelInvite, toSentenceCase } from "@/app/utils/utils";
import { cancelInvite_Admin } from "@/app/actions";
import { useRouter } from "next/navigation";
import UserInvitesList from "@/app/components/user-invites/UserInvitesList";
import UserInviteActionsMenu from "@/app/components/user-invites/UserInviteActionsMenu";

export default function AdminDashboardClient({
  user,
  roles,
  roleCounts,
  pendingInvites,
}: {
  user: any;
  roles: any[];
  roleCounts: { roleId: string; _count: { roleId: number } }[];
  pendingInvites: PendingInviteRow[];
}) {
  const [showCancel, setShowCancel] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<PendingInviteRow | null>(
    null
  );
  const router = useRouter();

  const roleCountMap = new Map(
    roleCounts.map((rc) => [rc.roleId, rc._count.roleId])
  );

  async function handleCancelInvite() {
    if (!selectedInvite) return;
    try {
      const res = await cancelInvite_Admin(selectedInvite.id);

      if (res.status === 200) {
        setSelectedInvite(null);
        setShowCancel(false);
        router.refresh();
      }
    } catch (e) {
      console.error("Error fetching users", e);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Hi, {user.name}</h1>
        <p className="text-sm opacity-70">Administrator Dashboard</p>
      </div>

      <section className="grid grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="rounded border p-4">
            <div className="text-sm opacity-60">
              {toSentenceCase(role.name)}
            </div>
            <div className="text-xl font-semibold">
              {roleCountMap.get(role.id) ?? 0}
            </div>
          </div>
        ))}
      </section>

      {pendingInvites.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Pending invites</h2>
          <UserInvitesList
            invites={pendingInvites}
            renderActions={(invite) => (
              <UserInviteActionsMenu
                invite={invite}
                canCancel={canAdminCancelInvite(invite)}
                onCancel={() => {
                  setSelectedInvite(invite);
                  setShowCancel(true);
                }}
              />
            )}
          />
        </div>
      )}

      {showCancel && selectedInvite && (
        <CancelInviteDialog
          invite={selectedInvite}
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancelInvite}
        />
      )}
    </div>
  );
}
