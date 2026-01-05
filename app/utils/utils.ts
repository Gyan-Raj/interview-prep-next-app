import type { PendingInviteRow, RoleOps } from "@/app/types";

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
  onAfterCopy: () => void
) {
  try {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${invite.inviteId}`;

    await navigator.clipboard.writeText(inviteUrl);

    if (onAfterCopy) {
      onAfterCopy();
    }
  } catch (error) {
    console.error("Failed to copy invite link", error);
    alert("Failed to copy invite link");
  }
}
