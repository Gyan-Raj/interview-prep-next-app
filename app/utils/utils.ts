import type {
  ConfirmAction,
  ConfirmEntity,
  PendingInviteRow,
  RoleOps,
  SubmissionRow,
  UserRow,
} from "@/app/types";
import { statusBadgeClassMap } from "../constants/constants";

export function toSentenceCase(role: string): string {
  if (!role) return "";

  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const roleDashboardRoute: Record<RoleOps, string> = {
  ADMIN: "/admin/dashboard",
  "RESOURCE MANAGER": "/resource-manager/dashboard",
  RESOURCE: "/resource/dashboard",
};

export async function copyInviteLink(
  invite: PendingInviteRow,
  onAfterCopy?: () => void
) {
  try {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${invite.id}`;
    await navigator.clipboard.writeText(inviteUrl);
    onAfterCopy?.();
  } catch (e) {
    console.error("Failed to copy invite link", e);
    alert("Failed to copy invite link");
  }
}

// app/utils/formatDate.ts

function getDaySuffix(day: number) {
  if (day >= 11 && day <= 13) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatDisplayDate(dateInput: string | Date) {
  const date = new Date(dateInput);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}${getDaySuffix(day)} ${month}, ${year}`;
}

export function canAdminDeleteUser(user: UserRow) {
  return !user.roles.some((r) => r.name === "ADMIN");
}

export function canRMDeleteUser(user: UserRow) {
  return !user.roles.some((r) =>
    ["ADMIN", "RESOURCE MANAGER"].includes(r.name)
  );
}

export function canAdminCancelInvite(invite: PendingInviteRow) {
  return !invite.roles.some((r) => r.name === "ADMIN");
}

export function canRMCancelInvite(invite: PendingInviteRow) {
  return !invite.roles.some((r) =>
    ["ADMIN", "RESOURCE MANAGER"].includes(r.name)
  );
}

export function getConfirmationTitle(
  action: ConfirmAction,
  entity: ConfirmEntity
) {
  return `${toSentenceCase(action)} ${entity}?`;
}

export function getConfirmationMessage(action: ConfirmAction) {
  return `Are you sure you want to ${action}?`;
}
