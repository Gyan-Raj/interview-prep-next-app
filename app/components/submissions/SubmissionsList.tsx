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
}: {
  submissions: SubmissionRow[];
  renderActions: (submission: SubmissionRow) => React.ReactNode;
  onItemClick?: (submission: SubmissionRow) => void;
  emptyMessage?: string;
}) {
  if (submissions.length === 0) {
    return <div className="p-6 text-sm opacity-70">{emptyMessage}</div>;
  }

  return (
    <List
      items={submissions.map((s) => ({
        kind: "submission" as const,
        data: s,
      }))}
      getTitle={(item) =>
        `${item.data.interview.companyName} · ${item.data.interview.role} · ${item.data.interview.round}`
      }
      getSubtitle={(item) =>
        item.data.resource
          ? `${formatDisplayDate(item.data.interview.interviewDate)}`
          : ""
      }
      getMetaData={(item) =>
        item.data.resource
          ? `${item.data.resource?.name} · ${item.data.resource?.email}`
          : `${formatDisplayDate(item.data.interview.interviewDate)}`
      }
      getBadge={(item) =>
        item.kind === "submission" ? (
          <SubmissionStatusBadge submission={item.data} />
        ) : null
      }
      getActions={(item) => renderActions(item.data)}
      onItemClick={(item) => onItemClick?.(item.data)}
    />
  );
}
