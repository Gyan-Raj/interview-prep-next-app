import { SubmissionVersionStatus } from "@prisma/client";
import { SubmissionStatusKey } from "../types";

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

export const statusColorMap: Record<SubmissionStatusKey, string> = {
  DRAFT: "text-muted-foreground",
  PENDING_REVIEW: "text-blue-600",
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
};
