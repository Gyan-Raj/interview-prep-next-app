"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getSubmissions_ResourceManager,
  updateSubmission_ResourceManager,
} from "@/app/actions";

import { statusBadgeClassMap } from "@/app/constants/constants";
import { formatDisplayDate, toSentenceCase } from "@/app/utils/utils";
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
};

/* -------------------- Component -------------------- */

export default function ResourceSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionAction, setSubmissionAction] =
    useState<EditActionTypes | null>(null);
  const [needAction, setNeedAction] = useState<boolean>(false);
  const [
    showSubmissionConfirmationDialog,
    setShowSubmissionConfirmationDialog,
  ] = useState(false);
  const router = useRouter();

  /* -------------------- Fetch -------------------- */

  async function fetchSubmission() {
    if (!submissionId) return;

    setLoading(true);
    try {
      const res = await getSubmissions_ResourceManager({ submissionId });

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
  }, [submissionId]);

  /* -------------------- Actions -------------------- */

  async function handleUpdateSubmission() {
    if (!submissionId || !submissionAction) return;
    try {
      const res = await updateSubmission_ResourceManager({
        submissionVersionId: submissionId,
        action: submissionAction.toUpperCase(),
      });

      if (res.status === 200) {
        setShowSubmissionConfirmationDialog(false);
        router.refresh();
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
      {/* ================= SCROLLABLE QUESTIONS ================= */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Empty */}
        {submission.questions.length === 0 && (
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
      {needAction && submissionId && (
        <div className="px-2 py-1 flex justify-end items-center gap-6 w-full text-sm">
          <button
            className="btn-secondary px-4 py-2"
            onClick={() => {
              setSubmissionAction("approved");
              setShowSubmissionConfirmationDialog(true);
            }}
          >
            Approve
          </button>
          <button
            className="btn-primary px-4 py-2"
            onClick={() => {
              setSubmissionAction("rejected");
              setShowSubmissionConfirmationDialog(true);
            }}
            disabled={submission.questions.length === 0}
          >
            Reject
          </button>
        </div>
      )}
      {showSubmissionConfirmationDialog && submissionId && needAction && (
        <ConfirmationDialog
          open={showSubmissionConfirmationDialog}
          action={submissionAction as EditActionTypes}
          entity="invite"
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
            </>
          }
          confirmLabel={`Yes ${submissionAction}`}
          cancelLabel="No"
          onCancel={() => setShowSubmissionConfirmationDialog(false)}
          onConfirm={handleUpdateSubmission}
        />
      )}
    </div>
  );
}
