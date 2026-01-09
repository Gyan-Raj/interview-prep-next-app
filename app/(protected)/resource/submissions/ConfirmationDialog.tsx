import { SubmissionRow } from "@/app/types";
import { toSentenceCase } from "@/app/utils/utils";

export default function ConfirmationDialog({
  selectedSubmissionVersion,
  onClose,
  onConfirm,
  action,
}: {
  selectedSubmissionVersion: SubmissionRow;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  action: "save" | "submit";
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
          {toSentenceCase(action)} Submission?
        </h2>

        {/* Message */}
        <p className="text-sm opacity-80">
          Are you sure you want to {action}{" "}
          <span className="font-medium">
            this submission by {selectedSubmissionVersion.resource?.name} for{" "}
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
            Yes, {action}
          </button>
        </div>
      </div>
    </div>
  );
}
