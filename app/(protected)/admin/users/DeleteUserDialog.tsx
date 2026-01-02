import { UserRow } from "./page";

export default function DeleteUserDialog({
  user,
  onClose,
  onConfirm,
}: {
  user: UserRow;
  onClose: () => void;
  onConfirm: () => void;
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
        <h2 className="text-lg font-semibold">Delete user?</h2>

        {/* Message */}
        <p className="text-sm opacity-80">
          Are you sure you want to delete{" "}
          <span className="font-medium">{user.name}</span>'s profile (
          {user.email})? This action cannot be undone.
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
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}
