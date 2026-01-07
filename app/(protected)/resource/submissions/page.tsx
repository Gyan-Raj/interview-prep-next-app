"use client";

import { getMySubmissions_Resource } from "@/app/actions";
import { ResourceSubmissionRow, SubmissionStatusKey } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/app/hooks/hooks";
import { toSentenceCase } from "@/app/utils/utils";
import { Filter } from "lucide-react";
import { SUBMISSION_STATUS_CONFIG } from "@/app/constants/constants";
import ResourceSubmissionsList from "./SubmissionsList/ResourceSubmissionsList";

export default function ResourceSubmissions() {
  const [submissions, setSubmissions] = useState<ResourceSubmissionRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [submissionStatusesOpen, setSubmissionStatusesOpen] = useState(false);

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
        submissionStatusIds:
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

  const debouncedSubmissionStatusIds = useDebounce(
    selectedSubmissionStatus,
    400
  );

  // useEffect(() => {
  //   if (allSubmissionStatus.length > 0) {
  //     fetchAllMySubmissions(); // 👈 initial page load
  //   }
  // }, [allSubmissionStatus]);

  useEffect(() => {
    if (allSubmissionStatus.length > 0) {
      fetchAllMySubmissions(); // 👈 list refresh only
    }
  }, [debouncedQuery, debouncedSubmissionStatusIds]);

  const isAllSelected =
    allSubmissionStatus.length > 0 &&
    selectedSubmissionStatus.length === allSubmissionStatus.length;

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
        {selectedSubmissionStatus
          .map((id) => allSubmissionStatus.find((r) => r.key === id)?.label)
          .filter(Boolean)
          .map((el) => toSentenceCase(el ?? ""))
          .join(", ")}
      </span>
    </div>
  );

  function toggleAll() {
    if (isAllSelected) return; // disabled when checked

    setSelectedSubmissionStatus(allSubmissionStatus.map((r) => r.key));
  }

  function toggleStatus(statusId: SubmissionStatusKey) {
    setSelectedSubmissionStatus((prev) =>
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
                    key={status.key}
                    className="flex items-center gap-2 text-sm"
                    style={{ opacity: isAllSelected ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubmissionStatus.includes(status.key)}
                      disabled={
                        selectedSubmissionStatus.length === 1 &&
                        selectedSubmissionStatus[0] === status.key
                      }
                      onChange={() => toggleStatus(status.key)}
                    />
                    {toSentenceCase(status.label)}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div style={{ position: "relative" }}>
        {!listLoading && <ResourceSubmissionsList submissions={submissions} />}
      </div>
    </div>
  );
}
