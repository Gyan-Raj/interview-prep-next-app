"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getSubmissions_Resource } from "@/app/actions";

import { statusBadgeClassMap } from "@/app/constants/constants";
import { formatDisplayDate, toSentenceCase } from "@/app/utils/utils";
import { EditActionTypes, Question, SubmissionStatusKey } from "@/app/types";
import ListCard from "@/app/components/list/ListCard";
import { SubmissionRow } from "@/app/types";
import DownloadButton from "@/app/components/DownloadButton";

/* -------------------- Types -------------------- */

type Interview = {
  id?: string;
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

export function toSubmissionRow(submission: Submission): SubmissionRow {
  if (!submission.interview.id) {
    throw new Error("Interview id is required for SubmissionRow");
  }

  return {
    submissionId: submission.submissionId,
    submissionVersionId: submission.submissionVersionId,
    status: submission.status,
    submittedAt: submission.submittedAt,
    versionNumber: submission.versionNumber,

    interview: {
      id: submission.interview.id,
      companyName: submission.interview.companyName,
      role: submission.interview.role,
      round: submission.interview.round,
      interviewDate: submission.interview.interviewDate,
    },

    resource: submission.resource
      ? {
          id: submission.resource.id,
          name: submission.resource.name,
          email: submission.resource.email,
        }
      : undefined,
  };
}

/* -------------------- Component -------------------- */

export default function ResourceSubmissionDetailPage() {
  console.log("ResourceSubmissionDetailPage");

  const { submissionId } = useParams<{ submissionId: string }>();
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const router = useRouter();

  /* -------------------- Fetch -------------------- */

  async function fetchSubmission() {
    if (!submissionId) return;

    setLoading(true);
    try {
      const res = await getSubmissions_Resource({
        submissionId,
        isSelf: false,
      });
      console.log(res, "res");

      if (res.status === 200) {
        const data = res.data;
        setSubmission(data);
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

  /* -------------------- Render -------------------- */

  if (loading || !submission) {
    return <div className="p-6 text-sm opacity-70">Loading…</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ================= HEADER ================= */}

      <ListCard
        key={submission.submissionVersionId}
        item={{
          kind: "submission",
          data: toSubmissionRow(submission),
        }}
        title={`${submission.interview.companyName} · ${submission.interview.role} · ${submission.interview.round}`}
        subtitle={formatDisplayDate(submission.interview.interviewDate)}
        metaData={`${submission.resource?.name} · ${submission.resource?.email}`}
        badge={null}
        styles={{ cursor: "auto" }}
        actions={<DownloadButton />}
      />
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
    </div>
  );
}
