import { useAppSelector } from "@/app/store/hooks";
import { PendingInviteRow } from "@/app/types";
import { copyInviteLink } from "@/app/utils/utils";
import { useEffect, useMemo, useRef, useState } from "react";

export default function InviteActionsMenu({
  invite,
  onConfirm,
}: {
  invite: PendingInviteRow;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const user = useAppSelector((state) => state.auth);

  const isAuthorized = useMemo(() => {
    const invitedUserRoleNames = invite.roles.map((r) => r.name);
    const isNotAllowed =
      invitedUserRoleNames.includes("ADMIN") ||
      invitedUserRoleNames.includes("RESOURCE MANAGER");
    return !isNotAllowed;
  }, [user, invite.roles]);

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
              if (isAuthorized) {
                setOpen(false);
                onConfirm();
              }
            }}
            className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
            style={{
              borderBottom: "1px solid var(--color-border)",
              cursor: isAuthorized ? "pointer" : "not-allowed",
              color: isAuthorized ? "" : "var(--color-border)",
            }}
            disabled={!isAuthorized}
          >
            Cancel Invite
          </button>
          <button
            onClick={() => {
              copyInviteLink(invite, () => setOpen(false));
            }}
            className="block w-full px-3 py-2 text-left text-sm hover:opacity-80 cursor-pointer"
          >
            Copy Invite Link
          </button>
        </div>
      )}
    </div>
  );
}
