"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getMySubmissions_Resource,
  updateSubmissionDetail_Resource,
} from "@/app/actions";

import { statusBadgeClassMap } from "@/app/constants/constants";
import { formatDisplayDate, toSentenceCase } from "@/app/utils/utils";
import { Question, SubmissionStatusKey } from "@/app/types";

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

type Submission = {
  interview: Interview;
  questions: Questions[];
  status: SubmissionStatusKey;
  submissionId: string;
  submissionVersionId: string;
  submittedAt: string | null;
  versionNumber: number;
};

/* -------------------- Helpers -------------------- */

function insertNextQuestionMarker(text: string) {
  const matches = text.match(/⟦Q\d+⟧/g);
  const nextNumber = matches ? matches.length + 1 : 1;
  return `${text}\n⟦Q${nextNumber}⟧ `;
}

function questionsToDocument(questions: { text: string }[]) {
  return questions.map((q, i) => `⟦Q${i + 1}⟧ ${q.text}`).join("\n");
}

function documentToQuestions(text: string) {
  return text
    .split(/⟦Q\d+⟧/)
    .map((q) => q.trim())
    .filter(Boolean)
    .map((t) => ({ text: t }));
}

/* -------------------- Component -------------------- */

export default function ResourceSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();

  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [documentText, setDocumentText] = useState("");

  const isEditable =
    submission?.status === "DRAFT" || submission?.status === "REJECTED";

  /* -------------------- Fetch -------------------- */

  async function fetchSubmission() {
    if (!submissionId) return;

    setLoading(true);
    try {
      const res = await getMySubmissions_Resource({ submissionId });

      if (res.status === 200) {
        const data = res.data;
        setSubmission(data);
        const questionsArr = data.questions?.map(
          (ele: Questions) => ele.question
        );
        setDocumentText(questionsToDocument(questionsArr));
        setMode("view");
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

  async function handleSave(action: "save" | "submit") {
    if (!submissionId) return;

    const questions = documentToQuestions(documentText);

    if (action === "submit" && questions.length === 0) return;

    await updateSubmissionDetail_Resource({
      submissionId,
      action,
      questions,
    });

    fetchSubmission();
  }

  function restoreDocumentFromSubmission() {
    if (!submission) return;
    setDocumentText(
      questionsToDocument(submission.questions.map((q: any) => q.question ?? q))
    );
    setMode("view");
  }

  function handleEditorKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setDocumentText((prev) => insertNextQuestionMarker(prev));
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
        className="border-b px-6 py-3 flex items-center justify-between text-sm"
        style={{
          backgroundColor: "var(--color-panel)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="font-medium">
          {[
            submission.interview.companyName,
            submission.interview.role,
            submission.interview.round,
          ].join(" · ")}
          <span className="opacity-70">
            {" "}
            – {formatDisplayDate(submission.interview.interviewDate)}
          </span>
        </div>

        <div className={statusBadgeClassMap[submission.status]}>
          {toSentenceCase(submission.status)}
        </div>
      </div>

      {/* ================= SCROLLABLE QUESTIONS ================= */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Empty */}
        {submission.questions.length === 0 && mode === "view" && (
          <div className="text-sm opacity-70">No submitted questions.</div>
        )}

        {/* View mode */}
        {mode === "view" && (
          <>
            <div className="text-sm opacity-70 mb-2">
              {submission?.status === "PENDING_REVIEW"
                ? "Submitted questions"
                : submission?.status === "REJECTED"
                ? "Rejected questions"
                : submission?.status === "APPROVED"
                ? "Questions"
                : ""}
            </div>
            {/* <pre className="whitespace-pre-wrap text-sm rounded p-4">
              {documentText || "—"}
            </pre> */}
            {mode === "view" && (
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                {submission.questions.map((q) => (
                  <li key={q.question.id} className="whitespace-pre-wrap">
                    {q.question.text}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        {/* Edit mode */}
        {mode === "edit" && (
          <div className="h-full flex flex-col">
            {documentText.trim().length > 0 && (
              <div className="text-xs opacity-60 mb-2">
                Press <kbd>Shift</kbd> + <kbd>Enter</kbd> to add next question
              </div>
            )}

            <textarea
              value={documentText}
              onChange={(e) => {
                const value = e.target.value;

                if (
                  documentText.trim().length === 0 &&
                  value.trim().length > 0 &&
                  !value.includes("⟦Q1⟧")
                ) {
                  setDocumentText(`⟦Q1⟧ ${value.trim()}`);
                } else {
                  setDocumentText(value);
                }
              }}
              onKeyDown={handleEditorKeyDown}
              className="flex-1 border rounded p-4 resize-none overflow-y-auto focus:outline-none text-sm"
              placeholder="Type your first question…"
            />
          </div>
        )}
      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      {isEditable && (
        <div
          className="border-t px-6 py-3 flex justify-end gap-3"
          style={{
            backgroundColor: "var(--color-panel)",
            borderColor: "var(--color-border)",
          }}
        >
          {mode === "view" ? (
            <>
              <button
                className="btn-secondary px-4 py-2"
                onClick={() => setMode("edit")}
              >
                Edit
              </button>
              <button
                className="btn-primary px-4 py-2"
                onClick={() => handleSave("submit")}
                disabled={submission.questions.length === 0}
              >
                Submit
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary px-4 py-2"
                onClick={restoreDocumentFromSubmission}
              >
                Cancel
              </button>
              <button
                className="btn-secondary px-4 py-2"
                onClick={() => handleSave("save")}
              >
                Save
              </button>
              <button
                className="btn-primary px-4 py-2"
                onClick={() => handleSave("submit")}
              >
                Submit
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
