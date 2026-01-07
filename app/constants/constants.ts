import { SubmissionVersionStatus } from "@prisma/client";


export const SUBMISSION_STATUS_CONFIG = [
  {
    key: SubmissionVersionStatus.DRAFT,
    label: "Saved",
  },
  {
    key: SubmissionVersionStatus.PENDING_REVIEW,
    label: "Under Review",
  },
  {
    key: SubmissionVersionStatus.APPROVED,
    label: "Approved",
  },
  {
    key: SubmissionVersionStatus.REJECTED,
    label: "Rejected",
  },
] as const;
