import SubmissionActionsMenu from "@/app/(protected)/resource-manager/submissions/SubmissionsList/SubmissionActionsMenu";
import { SubmissionRow } from "@/app/types";
import SubmissionsEntryList from "@/app/components/SubmissionsEntryList";

export default function SubmissionList({
  submissions,
  onEdit,
}: {
  submissions: SubmissionRow[];
  onEdit: (submission: SubmissionRow, action: "approve" | "reject") => void;
}) {
  if (submissions.length === 0) {
    return <div className="p-6 text-sm opacity-70">No submissions found.</div>;
  }
  return (
    <SubmissionsEntryList
      items={submissions.map((s) => ({
        id: s.submissionVersionId,
        submission: s, // 👈 attach once
        companyName: s.interview.companyName,
        round: s.interview.round,
        role: s.interview.role,
        interviewDate: s.interview.interviewDate,
        resourceName: s.resource.name,
        resourcePhone: s.resource.phone,
      }))}
      renderActions={(item) => (
        <SubmissionActionsMenu
          canApprove={true}
          canReject={true}
          onEdit={(action) => onEdit(item.submission, action)}
        />
      )}
    />
  );
}
