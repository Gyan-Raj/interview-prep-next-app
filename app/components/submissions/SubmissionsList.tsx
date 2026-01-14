// app/components/SubmissionsList.tsx
import List from "@/app/components/list/List";
import { statusBadgeClassMap } from "@/app/constants/constants";
import { SubmissionRow } from "@/app/types";
import { formatDisplayDate, toSentenceCase } from "@/app/utils/utils";

function SubmissionStatusBadge({ submission }: { submission: SubmissionRow }) {
  return (
    <span className={`${statusBadgeClassMap[submission.status]}`}>
      {" "}
      {toSentenceCase(submission.status)}{" "}
    </span>
  );
}

export default function SubmissionsList({
  submissions,
  renderActions,
  onItemClick,
  emptyMessage = "No submissions found.",
  isLoading = false,
}: {
  submissions: SubmissionRow[];
  renderActions: (submission: SubmissionRow) => React.ReactNode;
  onItemClick?: (submission: SubmissionRow) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}) {
  if (!isLoading && submissions.length === 0) {
    return <div className="p-6 text-sm opacity-70">{emptyMessage}</div>;
  }

  return (
    <List
      items={submissions.map((s) => ({
        kind: "submission" as const,
        data: s,
      }))}
      getTitle={(submission) =>
        `${submission.data.interview.companyName} · ${submission.data.interview.role} · ${submission.data.interview.round}`
      }
      getSubtitle={(submission) =>
        submission.data.resource
          ? `${formatDisplayDate(submission.data.interview.interviewDate)}`
          : ""
      }
      getMetaData={(submission) =>
        submission.data.resource
          ? `${submission.data.resource?.name} · ${submission.data.resource?.email}`
          : `${formatDisplayDate(submission.data.interview.interviewDate)}`
      }
      getBadge={(submission) =>
        submission.kind === "submission" ? (
          <SubmissionStatusBadge submission={submission.data} />
        ) : null
      }
      getActions={(submission) => renderActions(submission.data)}
      onItemClick={(submission) => onItemClick?.(submission.data)}
      loading={isLoading}
    />
  );
}
