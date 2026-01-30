"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getSubmissions_ResourceManager,
  updateSubmission_ResourceManager,
} from "@/app/actions";

import { statusBadgeClassMap } from "@/app/constants/constants";
import {
  formatDisplayDate,
  getConfirmationButtonText,
  getConfirmationTitle,
  toSentenceCase,
} from "@/app/utils/utils";
import { EditActionTypes, Question, SubmissionStatusKey } from "@/app/types";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

/* -------------------- Types -------------------- */

type Interview = {
  companyName: string;
  role: string;
  round: string;
  interviewDate: string;
};
type Questions = {
  id: string;
  createdAt: string;
  question: Question;
};
type Resource = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type Submission = {
  interview: Interview;
  questions: Questions[];
  status: SubmissionStatusKey;
  submissionId: string;
  submissionVersionId: string;
  submittedAt: string | null;
  versionNumber: number;
  resource: Resource;
  rejectionReason?: string;
};

/* -------------------- Component -------------------- */

export default function ResourceSubmissionDetailPage() {
  const { submissionVersionId } = useParams<{ submissionVersionId: string }>();

  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionAction, setSubmissionAction] =
    useState<EditActionTypes | null>(null);
  const [needAction, setNeedAction] = useState<boolean>(false);
  const [rejectedReason, setRejectedReason] = useState<string>("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [
    showSubmissionConfirmationDialog,
    setShowSubmissionConfirmationDialog,
  ] = useState(false);
  const router = useRouter();

  /* -------------------- Fetch -------------------- */

  async function fetchSubmission() {
    if (!submissionVersionId) return;

    setLoading(true);
    try {
      const res = await getSubmissions_ResourceManager({ submissionVersionId });

      if (res.status === 200) {
        const data = res.data;
        setSubmission(data);
        setNeedAction(() => data.status === "PENDING_REVIEW");
      }
    } catch (error) {
      console.error("Error getting submissions", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmission();
  }, [submissionVersionId]);

  /* -------------------- Actions -------------------- */

  async function handleUpdateSubmission() {
    if (!submissionVersionId || !submissionAction) return;
    if (submissionAction === "rejected" && !rejectedReason) {
      setRejectionError("Enter the reason for rejection");
    } else {
      setRejectionError(null);
    }
    try {
      const res = await updateSubmission_ResourceManager({
        submissionVersionId: submissionVersionId,
        action: submissionAction.toUpperCase(),
        reason: rejectedReason,
      });

      if (res.status === 200) {
        setShowSubmissionConfirmationDialog(false);
        fetchSubmission();
      }
    } catch (e) {
      console.error("Error updating submission status", e);
    }
  }

  /* -------------------- Render -------------------- */

  if (loading || !submission) {
    return <div className="p-6 text-sm opacity-70">Loading…</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ================= HEADER ================= */}

      <div
        style={{
          backgroundColor: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="relative flex items-start justify-between px-4 py-2">
          <div className={`${statusBadgeClassMap[submission.status]}`}>
            {toSentenceCase(submission.status)}
          </div>

          <div className="space-y-1 pr-24">
            <p className="font-medium">
              {[
                submission.interview.companyName,
                submission.interview.role,
                submission.interview.round,
              ].join(" · ")}
              <span className="opacity-70 text-sm">
                {" "}
                · {formatDisplayDate(submission.interview.interviewDate)}
              </span>
            </p>

            <p className="text-xs opacity-70">
              {[
                submission.resource.name,
                submission.resource.email ?? "",
                submission.resource.phone ?? "",
              ].join(" · ")}
            </p>
          </div>
        </div>
      </div>
      {/* ================= REJECTION REASON ================= */}
      {submission.rejectionReason && (
        <div className="px-6 py-4 border-b border-amber-600">
          <div className="text-sm  opacity-70 mb-2">Reason for rejection:</div>

          <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap max-h-24 overflow-y-auto pr-2">
            {submission.rejectionReason}
          </p>
        </div>
      )}

      {/* ================= SCROLLABLE QUESTIONS ================= */}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Empty */}
        {submission.questions.length === 0 && !loading && (
          <div className="text-sm opacity-70">No submitted questions.</div>
        )}

        <>
          <div className="text-sm opacity-70 mb-2">
            {submission?.status === "PENDING_REVIEW"
              ? "Submitted questions"
              : submission?.status === "REJECTED"
                ? "Rejected questions"
                : submission?.status === "APPROVED"
                  ? "Questions:"
                  : ""}
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            {submission.questions.map((q) => (
              <li key={q.question.id} className="whitespace-pre-wrap">
                {q.question.text}
              </li>
            ))}
          </ol>
        </>
      </div>
      {/* ================= FOOTER ACTIONS ================= */}
      {needAction && submissionVersionId && (
        <div className="px-2 py-1 flex justify-end items-center gap-6 w-full text-sm">
          <button
            className="btn-danger px-4 py-2"
            onClick={() => {
              setSubmissionAction("rejected");
              setShowSubmissionConfirmationDialog(true);
            }}
            disabled={submission.questions.length === 0}
          >
            Reject
          </button>{" "}
          <button
            className="btn-primary px-4 py-2"
            onClick={() => {
              setSubmissionAction("approved");
              setShowSubmissionConfirmationDialog(true);
            }}
          >
            Approve
          </button>
        </div>
      )}
      {showSubmissionConfirmationDialog &&
        submissionVersionId &&
        needAction && (
          <ConfirmationDialog
            open={showSubmissionConfirmationDialog}
            action={submissionAction as EditActionTypes}
            entity="submission"
            details={
              <>
                <div className="font-medium">
                  {submission.interview.companyName ?? "—"}
                  {" - "}
                  {submission.interview.round ?? "—"}
                </div>
                <div className="opacity-70 text-sm">
                  {submission.resource?.name} {submission.resource?.email ?? ""}
                  {submission.resource?.phone ?? ""}
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
    </div>
  );
}
