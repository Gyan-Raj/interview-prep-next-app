"use client";

import { ConfirmAction, SubmissionRow } from "@/app/types";
import SubmissionsList from "@/app/components/submissions/SubmissionsList";
import SubmissionActionsMenu from "@/app/components/submissions/SubmissionActionsMenu";
import { useRouter } from "next/navigation";

export default function ResourceDashboardClient({
  user,
  stats,
  requestedSubmissions,
}: {
  user: any;
  stats: {
    totalQuestions: number;
    myQuestionsCount: number;
    myInterviewsCount: number;
  };
  requestedSubmissions: SubmissionRow[];
}) {
  const router = useRouter();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Hi, {user.name}</h1>
        <p className="text-sm opacity-70">Resource Dashboard</p>
      </div>
      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm opacity-60">Total Questions</div>
          <div className="text-xl font-semibold">{stats.totalQuestions}</div>
        </div>

        <div className="rounded border p-4">
          <div className="text-sm opacity-60">My Questions</div>
          <div className="text-xl font-semibold">{stats.myQuestionsCount}</div>
        </div>

        <div className="rounded border p-4">
          <div className="text-sm opacity-60">My Interviews</div>
          <div className="text-xl font-semibold">{stats.myInterviewsCount}</div>
        </div>
      </section>
      {/* Requested Submissions */}
      {requestedSubmissions.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Requested Submissions</h2>

          <SubmissionsList
            submissions={requestedSubmissions}
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
                        `/resource/my-submissions/${submission.submissionId}`
                      );
                    }

                    if (action === "submit") {
                      router.push(
                        `/resource/my-submissions/${submission.submissionId}`
                      );
                    }
                  }}
                />
              );
            }}
            onItemClick={(submission) =>
              router.push(`/resource/my-submissions/${submission.submissionId}`)
            }
          />
        </div>
      )}
    </div>
  );
}
