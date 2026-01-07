"use client";

import { ResourceSubmissionRow } from "@/app/types";
import { useRouter } from "next/navigation";
import { toSentenceCase } from "@/app/utils/utils";
import { statusColorMap } from "@/app/constants/constants";

export default function ResourceSubmissionsList({
  submissions,
}: {
  submissions: ResourceSubmissionRow[];
}) {
  const router = useRouter();

  if (submissions.length === 0) {
    return <div className="p-6 text-sm opacity-70">No submissions found.</div>;
  }

  return (
    <div
      style={{
        backgroundColor: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
      className="divide-y"
    >
      {submissions.map((submission) => (
        <div
          key={submission.submissionVersionId}
          className="relative p-4 cursor-pointer hover:bg-muted"
          onClick={() =>
            router.push(`/resource/submissions/${submission.submissionId}`)
          }
        >
          {/* Status — fixed top-right */}
          <div
            className={`absolute top-4 right-4 text-xs font-medium ${
              statusColorMap[submission.status]
            }`}
          >
            {toSentenceCase(submission.status)}
          </div>

          {/* Content */}
          <div className="pr-24 space-y-1">
            <p className="font-medium">
              {[submission.companyName, submission.role, submission.round]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <p className="text-sm opacity-70">
              Interviewd on{" "}
              {new Date(submission.interviewDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
