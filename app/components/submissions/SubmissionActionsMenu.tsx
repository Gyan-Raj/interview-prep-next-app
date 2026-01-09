// app/components/SubmissionActionsMenu.tsx
"use client";

import { ConfirmAction } from "@/app/types";
import { useEffect, useRef, useState } from "react";

export default function SubmissionActionsMenu({
  actions,
  onAction,
}: {
  actions: { key: ConfirmAction; label: string }[];
  onAction: (action: ConfirmAction) => void;
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

  if (actions.length === 0) return null;

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="px-2 py-1 text-lg leading-none inline-flex items-center justify-center rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100 relative top-2"
        style={{
          color: "var(--color-text)",
        }}
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
            color: "var(--color-text)",
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
              style={{
                borderBottom:
                  index < actions.length - 1
                    ? "1px solid var(--color-border)"
                    : undefined,
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
