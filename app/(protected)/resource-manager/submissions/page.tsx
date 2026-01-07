"use client";

import {
  getAllSubmissionStatus_ResourceManager,
  getSubmissions_ResourceManager,
  updateSubmission_ResourceManager,
} from "@/app/actions";
import { SubmissionRow } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/app/hooks/hooks";
import { toSentenceCase } from "@/app/utils/utils";
import SubmissionList from "@/app/(protected)/resource-manager/submissions/SubmissionsList/SubmissionList";
import { Filter } from "lucide-react";
import RequestSubmissionModal from "@/app/(protected)/resource-manager/submissions/RequestSubmissionModal";
import ConfirmSubmissionDialog from "@/app/(protected)/resource-manager/submissions/ConfirmSubmissionDialog";

type SubmissionStatusOption = {
  id: string;
  name: string;
};
type EditActionTypes = "approve" | "reject";

export default function ResourceManagerSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedSubmissionStatusIds, setSelectedSubmissionStatusIds] =
    useState<string[]>([]);
  const [submissionStatusesOpen, setSubmissionStatusesOpen] = useState(false);

  const [selectedSubmissionVersion, setSelectedSubmissionVersion] =
    useState<SubmissionRow | null>(null);
  const [showEditSubmissionStatus, setShowEditSubmissionStatus] =
    useState(false);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [editAction, setEditAction] = useState<EditActionTypes>("approve");

  const [allSubmissionStatus, setAllSubmissionStatus] = useState<
    SubmissionStatusOption[]
  >([]);

  const debouncedQuery = useDebounce(query, 400);

  async function fetchPendingSubmissions(isInitial = false) {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setListLoading(true);
    }

    try {
      const res = await getSubmissions_ResourceManager({
        searchText: debouncedQuery,
        submissionStatusIds:
          selectedSubmissionStatusIds.length === allSubmissionStatus.length
            ? undefined
            : selectedSubmissionStatusIds,
      });

      if (res.status === 200) {
        setSubmissions(res.data);
      }
    } catch (e) {
      console.error("Error fetching submissions", e);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setListLoading(false);
      }
    }
  }

  const debouncedSubmissionStatusIds = useDebounce(
    selectedSubmissionStatusIds,
    400
  );

  useEffect(() => {
    if (allSubmissionStatus.length > 0) {
      fetchPendingSubmissions(true); // 👈 initial page load
    }
  }, [allSubmissionStatus]);

  useEffect(() => {
    if (allSubmissionStatus.length > 0) {
      fetchPendingSubmissions(false); // 👈 list refresh only
    }
  }, [debouncedQuery, debouncedSubmissionStatusIds]);

  async function updateSubmissionStatus() {
    try {
      if (!selectedSubmissionVersion) return;
      const res = await updateSubmission_ResourceManager({
        submissionVersionId: selectedSubmissionVersion.submissionVersionId,
        action: editAction.toUpperCase(), // "APPROVED" | "REJECTED"
      });
      if (res.status === 200) {
        const { updatedSubmission } = res.data;

        setSubmissions((prev) =>
          prev.map((u) =>
            u.submissionVersionId === updatedSubmission.submissionVersionId
              ? updatedSubmission
              : u
          )
        );
      }
      setShowEditSubmissionStatus(false);
    } catch (error) {
      console.error(
        "Error updating submission status(api/resource-manager/submission)",
        error
      );
    }
  }

  useEffect(() => {
    async function fetchSubmissionStatus() {
      const res = await getAllSubmissionStatus_ResourceManager();
      if (res.status === 200) {
        setAllSubmissionStatus(res.data);
        setSelectedSubmissionStatusIds(
          res.data.map((r: SubmissionStatusOption) => r.id)
        ); // all selected
      }
    }
    fetchSubmissionStatus();
  }, []);

  const isAllSelected =
    allSubmissionStatus.length > 0 &&
    selectedSubmissionStatusIds.length === allSubmissionStatus.length;

  const filterLabel = isAllSelected ? (
    <div className="flex items-center gap-0.5">
      {" "}
      <Filter size={14} style={{ color: "var(--color-text)", opacity: 0.7 }} />
      <span>All</span>
    </div>
  ) : (
    <div className="flex items-center gap-0.5">
      {" "}
      <Filter size={14} style={{ color: "var(--color-text)", opacity: 0.7 }} />
      <span>
        {selectedSubmissionStatusIds
          .map((id) => allSubmissionStatus.find((r) => r.id === id)?.name)
          .filter(Boolean)
          .map((el) => toSentenceCase(el ?? ""))
          .join(", ")}
      </span>
    </div>
  );

  function toggleAll() {
    if (isAllSelected) return; // disabled when checked

    setSelectedSubmissionStatusIds(allSubmissionStatus.map((r) => r.id));
  }

  function toggleStatus(statusId: string) {
    setSelectedSubmissionStatusIds((prev) =>
      prev.includes(statusId)
        ? prev.filter((id) => id !== statusId)
        : [...prev, statusId]
    );
  }

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSubmissionStatusesOpen(false);
      }
    }

    if (submissionStatusesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [submissionStatusesOpen]);

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

        <div className="flex items-center gap-3 flex-nowrap">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setSubmissionStatusesOpen((v) => !v)}
              className="px-3 py-2 text-sm whitespace-nowrap"
              style={{
                backgroundColor: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
              }}
            >
              {filterLabel || "Select statuses"}
            </button>
            {submissionStatusesOpen && (
              <div
                className="absolute mt-2 w-56 p-3 space-y-2 z-20 right-0"
                style={{
                  backgroundColor: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* All */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    disabled={isAllSelected}
                    onChange={toggleAll}
                  />

                  <span>All</span>
                </label>

                <hr style={{ borderColor: "var(--color-border)" }} />

                {/* Submissions Statuses */}
                {allSubmissionStatus.map((status) => (
                  <label
                    key={status.id}
                    className="flex items-center gap-2 text-sm"
                    style={{ opacity: isAllSelected ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubmissionStatusIds.includes(status.id)}
                      disabled={
                        selectedSubmissionStatusIds.length === 1 &&
                        selectedSubmissionStatusIds[0] === status.id
                      }
                      onChange={() => toggleStatus(status.id)}
                    />
                    {toSentenceCase(status.name)}
                  </label>
                ))}
              </div>
            )}
          </div>
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
          <SubmissionList
            submissions={submissions}
            onEdit={(submission, action) => {
              setSelectedSubmissionVersion(submission);
              setShowEditSubmissionStatus(true);
              setEditAction(action);
            }}
          />
        )}
      </div>

      {showEditSubmissionStatus && selectedSubmissionVersion && (
        <ConfirmSubmissionDialog
          selectedSubmissionVersion={selectedSubmissionVersion}
          onClose={() => setShowEditSubmissionStatus(false)}
          onConfirm={updateSubmissionStatus}
          editAction={editAction}
        />
      )}

      {showAddSubmission && (
        <RequestSubmissionModal
          onClose={() => setShowAddSubmission(false)}
          onAddSubmissionRequest={() => {
            setShowAddSubmission(false);
            fetchPendingSubmissions(false);
          }}
        />
      )}
    </div>
  );
}
