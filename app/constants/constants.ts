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

export const statusBadgeClassMap: Record<SubmissionStatusKey, string> = {
  DRAFT: "status-badge status-draft",
  PENDING_REVIEW: "status-badge status-pending",
  APPROVED: "status-badge status-approved",
  REJECTED: "status-badge status-rejected",
};
