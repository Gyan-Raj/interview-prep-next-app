"use client";

import { PendingInviteRow } from "@/app/types";
import { copyInviteLink } from "@/app/utils/utils";
import { useEffect, useRef, useState } from "react";

export default function UserInviteActionsMenu({
  invite,
  canCancel,
  onCancel,
}: {
  invite: PendingInviteRow;
  canCancel: boolean;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="px-2 py-1 text-lg leading-none inline-flex items-center justify-center rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100"
      >
        ⋮
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-40 z-20"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <button
            disabled={!canCancel}
            onClick={() => {
              if (!canCancel) return;
              setOpen(false);
              onCancel();
            }}
            className="block w-full px-3 py-2 text-left text-sm"
            style={{
              cursor: canCancel ? "pointer" : "not-allowed",
              color: canCancel ? undefined : "var(--color-border)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            Cancel Invite
          </button>

          <button
            onClick={() => copyInviteLink(invite)}
            className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
          >
            Copy Invite Link
          </button>
        </div>
      )}
    </div>
  );
}
