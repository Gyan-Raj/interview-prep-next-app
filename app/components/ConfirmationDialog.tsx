// app/components/ConfirmationDialog/ConfirmationDialog.tsx
"use client";

import { toSentenceCase } from "../utils/utils";
import { ConfirmAction, ConfirmEntity } from "@/app/types";
import {
  getConfirmationTitle,
  getConfirmationMessage,
} from "@/app/utils/utils";

export default function ConfirmationDialog({
  open,
  action,
  entity,
  details,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  action: ConfirmAction;
  entity: ConfirmEntity;

  /** Optional extra info (user name, email, etc.) */
  details?: React.ReactNode;

  confirmLabel?: string;
  cancelLabel?: string;

  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md p-6"
        style={{
          backgroundColor: "var(--color-panel)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Header */}
        <h2 className="text-lg font-semibold mb-3">
          {getConfirmationTitle(action, entity)}
        </h2>

        {/* Body */}
        <p className="text-sm opacity-80 mb-4">
          {getConfirmationMessage(action)}
        </p>

        {details && (
          <div
            className="mb-4 p-3 text-sm"
            style={{
              backgroundColor: "var(--color-bg-muted)",
              borderRadius: "var(--radius-card)",
            }}
          >
            {details}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger px-4 py-2 text-sm"
          >
            {confirmLabel ?? toSentenceCase(action)}
          </button>
        </div>
      </div>
    </div>
  );
}
