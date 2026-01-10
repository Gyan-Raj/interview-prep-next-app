"use client";

import { useState } from "react";
import { ConfirmAction, InviteRow } from "@/app/types";
import { canAdminCancelInvite, toSentenceCase } from "@/app/utils/utils";
import { inviteAction_Admin } from "@/app/actions";
import { useRouter } from "next/navigation";
import UserInvitesList from "@/app/components/user-invites/UserInvitesList";
import UserInviteActionsMenu from "@/app/components/user-invites/UserInviteActionsMenu";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

export default function AdminDashboardClient({
  user,
  roles,
  roleCounts,
  pendingInvites,
  expiredInvites,
}: {
  user: any;
  roles: any[];
  roleCounts: { roleId: string; _count: { roleId: number } }[];
  pendingInvites: InviteRow[];
  expiredInvites: InviteRow[];
}) {
  const [showConfirmationDialogOfInvite, setShowConfirmationDialogOfInvite] =
    useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteRow | null>(null);
  const router = useRouter();
  const [inviteAction, setInviteAction] = useState<ConfirmAction | null>(null);

  const roleCountMap = new Map(
    roleCounts.map((rc) => [rc.roleId, rc._count.roleId])
  );

  async function handleInviteAction() {
    if (!selectedInvite || !inviteAction) return;
    try {
      const res = await inviteAction_Admin(selectedInvite.id, inviteAction);

      if (res && res.status === 200) {
        setSelectedInvite(null);
        setShowConfirmationDialogOfInvite(false);
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
                actions={[
                  { key: "cancel", label: "Cancel invite link" },
                  { key: "reminder", label: "Send reminder" },
                ]}
                onAction={(action) => {
                  setSelectedInvite(invite);
                  setShowConfirmationDialogOfInvite(true);
                  setInviteAction(action);
                }}
                invite={invite}
                canCancel={canAdminCancelInvite(invite)}
                isExpired={false}
              />
            )}
          />
        </div>
      )}

      {expiredInvites.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Expired invites</h2>
          <UserInvitesList
            invites={expiredInvites}
            renderActions={(invite) => (
              <UserInviteActionsMenu
                actions={[
                  { key: "delete", label: "Delete invite link" },
                  { key: "send-again", label: "Send again" },
                ]}
                onAction={(action) => {
                  setSelectedInvite(invite);
                  setShowConfirmationDialogOfInvite(true);
                  setInviteAction(action);
                }}
                invite={invite}
                canCancel={canAdminCancelInvite(invite)}
                isExpired={true}
              />
            )}
          />
        </div>
      )}

      {showConfirmationDialogOfInvite && selectedInvite && inviteAction && (
        <ConfirmationDialog
          open={showConfirmationDialogOfInvite}
          action={inviteAction}
          entity="invite"
          details={
            <>
              <div className="font-medium">{selectedInvite.name ?? "—"}</div>
              <div className="opacity-70 text-sm">
                {selectedInvite.email}
                {selectedInvite.phone ? ` · ${selectedInvite.phone}` : ""}
              </div>
            </>
          }
          confirmLabel="Yes"
          cancelLabel="No"
          onCancel={() => setShowConfirmationDialogOfInvite(false)}
          onConfirm={handleInviteAction}
        />
      )}
    </div>
  );
}
