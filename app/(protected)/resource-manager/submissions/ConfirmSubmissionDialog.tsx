import { SubmissionRow } from "@/app/types";
import { toSentenceCase } from "@/app/utils/utils";

export default function ConfirmSubmissionDialog({
  selectedSubmissionVersion,
  onClose,
  onConfirm,
  editAction,
}: {
  selectedSubmissionVersion: SubmissionRow;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  editAction: "approve" | "reject";
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
      }}
    >
      <div
        className="w-105 p-5 space-y-4"
        style={{
          backgroundColor: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
          color: "var(--color-text)",
        }}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold">
          {toSentenceCase(editAction)} Submission?
        </h2>

        {/* Message */}
        <p className="text-sm opacity-80">
          Are you sure you want to {editAction}{" "}
          <span className="font-medium">
            this submission by {selectedSubmissionVersion.resource.name} for{" "}
            {selectedSubmissionVersion.interview.companyName} ·{" "}
            {selectedSubmissionVersion.interview.round}
          </span>
          ?
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm"
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              backgroundColor: "transparent",
              color: "var(--color-text)",
            }}
          >
            No
          </button>

          <button
            className="px-4 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--color-accent)",
              borderRadius: "var(--radius-card)",
              color: "#000",
            }}
            onClick={onConfirm}
          >
            Yes, {editAction}
          </button>
        </div>
      </div>
    </div>
  );
}
