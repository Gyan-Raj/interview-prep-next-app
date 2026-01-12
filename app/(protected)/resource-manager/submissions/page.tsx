"use client";

import {
  getSubmissions_ResourceManager,
  updateSubmission_ResourceManager,
  deleteSubmission_ResourceManager,
} from "@/app/actions";
import {
  EditActionTypes,
  FilterConfig,
  SubmissionRow,
  SubmissionStatusKey,
} from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/app/hooks/hooks";
import { toSentenceCase } from "@/app/utils/utils";
import { Filter } from "lucide-react";
import RequestSubmissionModal from "@/app/(protected)/resource-manager/submissions/RequestSubmissionModal";
import { SUBMISSION_STATUS_CONFIG } from "@/app/constants/constants";
import { useRouter } from "next/navigation";
import SubmissionsList from "@/app/components/submissions/SubmissionsList";
import SubmissionActionsMenu from "@/app/components/submissions/SubmissionActionsMenu";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import FiltersMenu from "@/app/components/filters/FiltersMenu";

const submissionStatusOptions = SUBMISSION_STATUS_CONFIG.map((s) => ({
  id: s.key,
  name: toSentenceCase(s.label),
}));

export default function ResourceManagerSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [query, setQuery] = useState("");

  const [selectedSubmissionVersion, setSelectedSubmissionVersion] =
    useState<SubmissionRow | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [editAction, setEditAction] = useState<EditActionTypes>("approved");

  const allSubmissionStatus = SUBMISSION_STATUS_CONFIG;
  const [selectedSubmissionStatus, setSelectedSubmissionStatus] = useState<
    SubmissionStatusKey[]
  >(SUBMISSION_STATUS_CONFIG.map((s) => s.key));

  const router = useRouter();

  const debouncedQuery = useDebounce(query, 400);

  async function fetchPendingSubmissions() {
    setListLoading(true);

    try {
      const res = await getSubmissions_ResourceManager({
        searchText: debouncedQuery,
        submissionStatuses:
          selectedSubmissionStatus.length === allSubmissionStatus.length
            ? undefined
            : selectedSubmissionStatus,
      });

      if (res.status === 200) {
        setSubmissions(res.data);
      }
    } catch (e) {
      console.error("Error fetching submissions", e);
    } finally {
      setListLoading(false);
    }
  }

  const debouncedSubmissionStatuses = useDebounce(
    selectedSubmissionStatus,
    400
  );

  useEffect(() => {
    if (allSubmissionStatus.length > 0) {
      fetchPendingSubmissions(); // 👈 list refresh only
    }
  }, [debouncedQuery, debouncedSubmissionStatuses]);

  async function updateSubmissionStatus() {
    try {
      if (!selectedSubmissionVersion) return;
      let res;
      if (editAction === "delete") {
        res = await deleteSubmission_ResourceManager({
          submissionId: selectedSubmissionVersion.submissionVersionId,
        });
      } else {
        res = await updateSubmission_ResourceManager({
          submissionVersionId: selectedSubmissionVersion.submissionVersionId,
          action: editAction.toUpperCase(), // "APPROVED" | "REJECTED" | "DELETE"
        });
      }
      if (res.status === 200) {
        fetchPendingSubmissions();
      }
      setShowConfirmDialog(false);
    } catch (error) {
      console.error(
        "Error updating submission status(api/resource-manager/submission)",
        error
      );
    }
  }
  const isAllSubmissionStatusSelected =
    submissionStatusOptions.length > 0 &&
    selectedSubmissionStatus.length === submissionStatusOptions.length;

  const filtersConfig: FilterConfig[] = [
    {
      key: "submissionStatus",
      label: "Status",
      options: submissionStatusOptions,
      selected: selectedSubmissionStatus,
      isAllSelected: isAllSubmissionStatusSelected,
      onToggle: (id) => {
        setSelectedSubmissionStatus((prev) =>
          prev.includes(id as SubmissionStatusKey)
            ? prev.filter((x) => x !== id)
            : [...prev, id as SubmissionStatusKey]
        );
      },
      onSelectAll: () => {
        if (!isAllSubmissionStatusSelected) {
          setSelectedSubmissionStatus(
            submissionStatusOptions.map((o) => o.id as SubmissionStatusKey)
          );
        }
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <input
          placeholder="Search submissions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-0 max-w-md px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            color: "var(--color-text)",
          }}
        />

        <div className="flex items-center gap-4">
          <FiltersMenu filters={filtersConfig} />

          <button
            onClick={() => setShowAddSubmission(true)}
            className="btn-primary px-4 py-2 text-sm font-medium whitespace-nowrap"
          >
            Request New Submission
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div style={{ position: "relative" }}>
        {!listLoading && (
          <SubmissionsList
            submissions={submissions}
            renderActions={(submission) => {
              const actions: { key: EditActionTypes; label: string }[] = [];

              if (
                submission.status === "PENDING_REVIEW" &&
                submission.versionNumber !== 1
              ) {
                actions.push({ key: "approved", label: "Approve" });
                actions.push({ key: "rejected", label: "Reject" });
              }

              if (
                submission.status === "DRAFT" ||
                (submission.versionNumber === 1 && !submission.submittedAt)
              ) {
                actions.push({ key: "delete", label: "Delete" });
              }

              return (
                <SubmissionActionsMenu
                  actions={actions}
                  onAction={(action) => {
                    setSelectedSubmissionVersion(submission);
                    setEditAction(action as EditActionTypes);
                    setShowConfirmDialog(true);
                  }}
                />
              );
            }}
            onItemClick={(submission) =>
              router.push(
                `/resource-manager/submissions/${submission.submissionId}`
              )
            }
          />
        )}
      </div>

      {showConfirmDialog && selectedSubmissionVersion && (
        <ConfirmationDialog
          open={showConfirmDialog}
          action={editAction}
          entity="submission"
          details={
            <>
              <div>{selectedSubmissionVersion.interview.companyName}</div>
              <div className="opacity-70">
                {selectedSubmissionVersion.interview.role} ·{" "}
                {selectedSubmissionVersion.interview.round}
              </div>
            </>
          }
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={updateSubmissionStatus}
        />
      )}

      {showAddSubmission && (
        <RequestSubmissionModal
          onClose={() => setShowAddSubmission(false)}
          onAddSubmissionRequest={() => {
            setShowAddSubmission(false);
            fetchPendingSubmissions();
          }}
        />
      )}
    </div>
  );
}
