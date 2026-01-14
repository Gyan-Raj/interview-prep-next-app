"use client";

import { ConfirmAction, UserRow } from "@/app/types";
import { useEffect, useRef, useState } from "react";

export default function UserActionsMenu({
  actions,
  onAction,
  user,
  canDelete,
}: {
  actions: { key: ConfirmAction; label: string }[];
  onAction: (action: ConfirmAction) => void;
  user: UserRow;
  canDelete: boolean;
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
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="px-2 py-1 text-lg leading-none inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
      >
        ⋮
      </button>

      {/* Menu */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-36 z-20"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {actions.map((action, index) => (
            <button
              key={action.key}
              onClick={() => {
                setOpen(false);
                onAction(action.key);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
              disabled={!canDelete && action.key === "delete"}
              style={{
                cursor: canDelete ? "pointer" : "not-allowed",
                color: canDelete ? undefined : "var(--color-border)",
                borderBottom:
                  index < actions.length - 1
                    ? "1px solid var(--color-border)"
                    : undefined,
                borderRadius:
                  index < actions.length - 1
                    ? "var(--radius-cdard)"
                    : "var(--radius-card) var(--radius-card)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = canDelete
                  ? "var(--color-accent)"
                  : "transparent";
                e.currentTarget.style.borderRadius =
                  actions.length === 1
                    ? "var(--radius-card)"
                    : index < actions.length - 1
                    ? "var(--radius-card) var(--radius-card) 0 0"
                    : "0 0 var(--radius-card) var(--radius-card)";
                e.currentTarget.style.borderBottom = canDelete
                  ? "1px solid var(--color-border)"
                  : "default";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
