"use client";

import { useState } from "react";
import {
  ConfirmAction,
  EditActionTypes,
  InviteRow,
  SubmissionRow,
} from "@/app/types";
import {
  canRMCancelInvite,
  getConfirmationButtonText,
  toSentenceCase,
} from "@/app/utils/utils";
import {
  inviteAction_ResourceManager,
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
  expiredInvites,
  pendingSubmissionsCount,
  pendingSubmissions,
}: {
  user: any;
  roles: any[];
  roleCounts: { roleId: string; _count: { roleId: number } }[];
  pendingInvites: InviteRow[];
  expiredInvites: InviteRow[];
  pendingSubmissionsCount: number;
  pendingSubmissions: SubmissionRow[];
}) {
  const [showConfirmationDialogOfInvite, setShowConfirmationDialogOfInvite] =
    useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteRow | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [
    showSubmissionConfirmationDialog,
    setShowSubmissionConfirmationDialog,
  ] = useState(false);
  const [submissionAction, setSubmissionAction] =
    useState<EditActionTypes | null>(null);
  const [inviteAction, setInviteAction] = useState<ConfirmAction | null>(null);
  const [rejectedReason, setRejectedReason] = useState<string>("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const router = useRouter();

  const roleCountMap = new Map(
    roleCounts.map((rc) => [rc.roleId, rc._count.roleId]),
  );

  async function handleInviteAction() {
    if (!selectedInvite || !inviteAction) return;
    try {
      const res = await inviteAction_ResourceManager(
        selectedInvite.id,
        inviteAction,
      );

      if (res && res.status === 200) {
        setSelectedInvite(null);
        setShowConfirmationDialogOfInvite(false);
        router.refresh();
      }
    } catch (e) {
      console.error("Error fetching users", e);
    }
  }

  async function handleUpdateSubmission() {
    if (!selectedSubmission || !submissionAction) return;
    if (submissionAction === "rejected" && !rejectedReason) {
      setRejectionError("Enter the reason for rejection");
    } else {
      setRejectionError(null);
    }
    try {
      const res = await updateSubmission_ResourceManager({
        submissionVersionId: selectedSubmission.submissionVersionId,
        action: submissionAction.toUpperCase(),
        reason: rejectedReason,
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
                `/resource-manager/submissions/${submission.submissionVersionId}`,
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
                actions={[
                  { key: "cancel", label: "Cancel invite link" },
                  { key: "reminder", label: "Send reminder" },
                ]}
                onAction={(action) => {
                  setSelectedInvite(invite);
                  setInviteAction(action);
                  setShowConfirmationDialogOfInvite(true);
                }}
                invite={invite}
                canCancel={canRMCancelInvite(invite)}
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
                  setInviteAction(action);
                  setShowConfirmationDialogOfInvite(true);
                }}
                invite={invite}
                canCancel={canRMCancelInvite(invite)}
                isExpired={true}
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
            entity="submission"
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
                {submissionAction === "rejected" && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium mb-1">
                      Add a comment
                      <sup className="text-red-600">*</sup>{" "}
                    </label>
                    <textarea
                      rows={3}
                      value={rejectedReason}
                      onChange={(e) => setRejectedReason(e.target.value)}
                      placeholder="Add a reason or feedback for rejection"
                      className="w-full resize-none rounded-md px-3 py-2 text-sm bg-transparent border border-black/20 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    />
                    {rejectionError && (
                      <span className="text-red-600 text-xs">
                        {rejectionError}
                      </span>
                    )}
                  </div>
                )}
              </>
            }
            confirmLabel={`${getConfirmationButtonText(submissionAction)}`}
            onCancel={() => setShowSubmissionConfirmationDialog(false)}
            onConfirm={handleUpdateSubmission}
          />
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
          confirmLabel="Yes, cancel"
          cancelLabel="No"
          onCancel={() => setShowConfirmationDialogOfInvite(false)}
          onConfirm={handleInviteAction}
        />
      )}
    </div>
  );
}
