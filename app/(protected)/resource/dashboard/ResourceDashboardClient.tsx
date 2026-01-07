"use client";

import { useRouter } from "next/navigation";
import { toSentenceCase } from "@/app/utils/utils";

type RequestedSubmission = {
  submissionVersionId: string;
  submissionId: string;
  versionNumber: number;
  status: "DRAFT" | "PENDING_REVIEW" | "REJECTED";
  submittedAt: string | null;
  interview: {
    company: string;
    role: string;
    round: string;
    interviewDate: Date;
  };
};

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
  requestedSubmissions: RequestedSubmission[];
}) {
  const router = useRouter();

  function getActionLabel(status: RequestedSubmission["status"]) {
    switch (status) {
      case "DRAFT":
        return "Continue";
      case "REJECTED":
        return "Edit & Resubmit";
      case "PENDING_REVIEW":
        return "View";
      default:
        return "";
    }
  }

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
        <section>
          <h2 className="text-lg font-medium mb-4">Requested Submissions</h2>

          <div className="space-y-3">
            {requestedSubmissions.map((s) => (
              <div
                key={s.submissionVersionId}
                className="flex items-center justify-between rounded border p-4"
              >
                <div>
                  <div className="font-medium">
                    {s.interview.company} · {s.interview.role} ·{" "}
                    {s.interview.round}
                  </div>
                  <div className="text-sm opacity-60">
                    Interview on{" "}
                    {new Date(s.interview.interviewDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs mt-1">
                    Status:{" "}
                    <span className="font-medium">
                      {toSentenceCase(s.status)}
                    </span>
                  </div>
                </div>

                <button
                  className="rounded border px-4 py-2 text-sm hover:bg-muted"
                  onClick={() =>
                    router.push(`/resource/submissions/${s.submissionId}`)
                  }
                >
                  {getActionLabel(s.status)}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
