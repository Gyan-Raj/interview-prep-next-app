"use client";

import { getMySubmissions_Resource } from "@/app/actions";
import {
  ConfirmAction,
  FilterConfig,
  ResourceSubmissionRow,
  SubmissionStatusKey,
} from "@/app/types";
import { useEffect, useState } from "react";
import { useDebounce } from "@/app/hooks/hooks";
import { toSentenceCase } from "@/app/utils/utils";
import { SUBMISSION_STATUS_CONFIG } from "@/app/constants/constants";
import SubmissionsList from "@/app/components/submissions/SubmissionsList";
import SubmissionActionsMenu from "@/app/components/submissions/SubmissionActionsMenu";
import { useRouter } from "next/navigation";
import FiltersMenu from "@/app/components/filters/FiltersMenu";

const submissionStatusOptions = SUBMISSION_STATUS_CONFIG.map((s) => ({
  id: s.key,
  name: toSentenceCase(s.label),
}));

export default function ResourceSubmissions() {
  const [submissions, setSubmissions] = useState<ResourceSubmissionRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const router = useRouter();

  const [query, setQuery] = useState("");

  const allSubmissionStatus = SUBMISSION_STATUS_CONFIG;
  const [selectedSubmissionStatus, setSelectedSubmissionStatus] = useState<
    SubmissionStatusKey[]
  >(SUBMISSION_STATUS_CONFIG.map((s) => s.key));

  const debouncedQuery = useDebounce(query, 400);

  async function fetchAllMySubmissions() {
    setListLoading(true);
    try {
      const res = await getMySubmissions_Resource({
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

  useEffect(() => {
    if (allSubmissionStatus.length > 0) {
      fetchAllMySubmissions(); // 👈 list refresh only
    }
  }, [debouncedQuery, debouncedSubmissionStatuses]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
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

        <FiltersMenu filters={filtersConfig} />
      </div>

      {/* Submissions List */}
      <div style={{ position: "relative" }}>
        {!listLoading && (
          <SubmissionsList
            submissions={submissions}
            renderActions={(submission) => {
              const actions: { key: ConfirmAction; label: string }[] = [];

              // Resource can edit draft or rejected
              if (
                submission.status === "DRAFT" ||
                submission.status === "REJECTED"
              ) {
                actions.push({ key: "edit", label: "Edit" });
              }

              // Resource can submit draft
              if (submission.status === "DRAFT" && !submission.submittedAt) {
                actions.push({ key: "submit", label: "Submit" });
              }

              if (actions.length === 0) return null;

              return (
                <SubmissionActionsMenu
                  actions={actions}
                  onAction={(action) => {
                    if (action === "edit") {
                      router.push(
                        `/resource/submissions/${submission.submissionId}`
                      );
                    }

                    if (action === "submit") {
                      router.push(
                        `/resource/submissions/${submission.submissionId}`
                      );
                    }
                  }}
                />
              );
            }}
            onItemClick={(submission) =>
              router.push(`/resource/submissions/${submission.submissionId}`)
            }
          />
        )}
      </div>
    </div>
  );
}
