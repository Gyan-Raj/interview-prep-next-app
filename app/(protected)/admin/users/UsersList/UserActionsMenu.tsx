"use client";

import { UserRow } from "@/app/types";
import { useEffect, useMemo, useRef, useState } from "react";

export default function UserActionsMenu({
  user,
  onEdit,
  onDelete,
}: {
  user: UserRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isAuthorized = useMemo(() => {
    const userRoleNames = user.roles.map((r) => r.name);
    return !userRoleNames.includes("ADMIN");
  }, [user, user.roles]);

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

      {/* Menu (conditional) */}
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
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
            style={{
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            Edit roles
          </button>

          <button
            onClick={() => {
              if (isAuthorized) {
                setOpen(false);
                onDelete();
              }
            }}
            className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
            style={{
              cursor: isAuthorized ? "pointer" : "not-allowed",
              color: isAuthorized ? "" : "var(--color-border)",
            }}
            disabled={!isAuthorized}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
