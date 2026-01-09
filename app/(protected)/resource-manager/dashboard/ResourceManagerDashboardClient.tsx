"use client";

import { useState } from "react";
import { EditActionTypes, PendingInviteRow, SubmissionRow } from "@/app/types";
import { canRMCancelInvite, toSentenceCase } from "@/app/utils/utils";
import {
  cancelInvite_ResourceManager,
  updateSubmission_ResourceManager,
} from "@/app/actions";
import { useRouter } from "next/navigation";
import UserInvitesList from "@/app/components/user-invites/UserInvitesList";
import UserInviteActionsMenu from "@/app/components/user-invites/UserInviteActionsMenu";
import SubmissionsList from "@/app/components/submissions/SubmissionsList";
import SubmissionActionsMenu from "@/app/components/submissions/SubmissionActionsMenu";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

export default function ResourceManagerDashboardClient({
  user,
  roles,
  roleCounts,
  pendingInvites,
  pendingSubmissionsCount,
  pendingSubmissions,
}: {
  user: any;
  roles: any[];
  roleCounts: { roleId: string; _count: { roleId: number } }[];
  pendingInvites: PendingInviteRow[];
  pendingSubmissionsCount: number;
  pendingSubmissions: SubmissionRow[];
}) {
  const [showCancelInvite, setShowCancelInvite] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<PendingInviteRow | null>(
    null
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [
    showSubmissionConfirmationDialog,
    setShowSubmissionConfirmationDialog,
  ] = useState(false);
  const [submissionAction, setSubmissionAction] =
    useState<EditActionTypes | null>(null);

  const router = useRouter();

  const roleCountMap = new Map(
    roleCounts.map((rc) => [rc.roleId, rc._count.roleId])
  );

  async function handleCancelInvite() {
    if (!selectedInvite) return;
    try {
      const res = await cancelInvite_ResourceManager(selectedInvite.id);

      if (res.status === 200) {
        setSelectedInvite(null);
        setShowCancelInvite(false);
        router.refresh();
      }
    } catch (e) {
      console.error("Error fetching users", e);
    }
  }

  async function handleUpdateSubmission() {
    if (!selectedSubmission || !submissionAction) return;
    try {
      const res = await updateSubmission_ResourceManager({
        submissionVersionId: selectedSubmission.submissionVersionId,
        action: submissionAction.toUpperCase(),
      });

      if (res.status === 200) {
        setSelectedSubmission(null);
        setShowSubmissionConfirmationDialog(false);
        router.refresh();
      }
    } catch (e) {
      console.error("Error updating submission status", e);
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
        {pendingSubmissionsCount > 0 && (
          <div className="rounded border p-4">
            <div className="text-sm opacity-60">Submissions under review</div>
            <div className="text-xl font-semibold">
              {pendingSubmissionsCount}
            </div>
          </div>
        )}
      </section>

      {pendingSubmissionsCount > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Submissions under review</h2>
          <SubmissionsList
            submissions={pendingSubmissions}
            renderActions={(submission) => (
              <SubmissionActionsMenu
                actions={[
                  { key: "approved", label: "Approve" },
                  { key: "rejected", label: "Reject" },
                ]}
                onAction={(action) => {
                  setSelectedSubmission(submission);
                  setSubmissionAction(action as EditActionTypes);
                  setShowSubmissionConfirmationDialog(true);
                }}
              />
            )}
            onItemClick={(submission) =>
              router.push(
                `/resource-manager/submissions/${submission.submissionId}`
              )
            }
          />
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Pending invites</h2>
          <UserInvitesList
            invites={pendingInvites}
            renderActions={(invite) => (
              <UserInviteActionsMenu
                invite={invite}
                canCancel={canRMCancelInvite(invite)}
                onCancel={() => {
                  setSelectedInvite(invite);
                  setShowCancelInvite(true);
                }}
              />
            )}
          />
        </div>
      )}

      {showSubmissionConfirmationDialog &&
        selectedSubmission &&
        submissionAction && (
          <ConfirmationDialog
            open={showSubmissionConfirmationDialog}
            action={submissionAction}
            entity="invite"
            details={
              <>
                <div className="font-medium">
                  {selectedSubmission.interview.companyName ?? "—"}
                  {" - "}
                  {selectedSubmission.interview.round ?? "—"}
                </div>
                <div className="opacity-70 text-sm">
                  {selectedSubmission.resource?.name}{" "}
                  {selectedSubmission.resource?.email ?? ""}
                  {selectedSubmission.resource?.phone ?? ""}
                </div>
              </>
            }
            confirmLabel={`Yes ${submissionAction}`}
            cancelLabel="No"
            onCancel={() => setShowSubmissionConfirmationDialog(false)}
            onConfirm={handleUpdateSubmission}
          />
        )}

      {showCancelInvite && selectedInvite && (
        <ConfirmationDialog
          open={showCancelInvite}
          action="cancel"
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
          confirmLabel="Yes, cancel"
          cancelLabel="No"
          onCancel={() => setShowCancelInvite(false)}
          onConfirm={handleCancelInvite}
        />
      )}
    </div>
  );
}
