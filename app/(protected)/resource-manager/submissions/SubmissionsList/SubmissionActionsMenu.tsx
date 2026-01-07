"use client";

import { useEffect, useRef, useState } from "react";

export default function SubmissionActionsMenu({
  canApprove,
  canReject,
  onEdit,
}: {
  canApprove: boolean;
  canReject: boolean;
  onEdit: (action: "approve" | "reject") => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2 py-1 text-lg leading-none"
        style={{
          color: "var(--color-text)",
          borderRadius: "var(--radius-card)",
        }}
      >
        ⋮
      </button>

      {/* Menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-36 z-20"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
            color: "var(--color-text)",
          }}
        >
          {canApprove && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit("approve");
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
              style={{
                borderBottom: canReject
                  ? "1px solid var(--color-border)"
                  : undefined,
              }}
            >
              Approve
            </button>
          )}

          {canReject && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit("reject");
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}
