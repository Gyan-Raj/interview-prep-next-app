"use client";

import { useState } from "react";
import PendingInvitesList from "./PendingInvitesList/PendingInvitesList";
import CancelInviteDialog from "./CancelInviteDialog";
import { PendingInviteRow } from "@/app/types";
import { toSentenceCase } from "@/app/utils/utils";
import { cancelInvite_ResourceManager } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ResourceManagerDashboardClient({
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
      const res = await cancelInvite_ResourceManager(selectedInvite.inviteId);

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
        <p className="text-sm opacity-70">Resource Manager Dashboard</p>
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
          <PendingInvitesList
            invites={pendingInvites}
            onConfirm={(invite) => {
              setSelectedInvite(invite);
              setShowCancel(true);
            }}
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
