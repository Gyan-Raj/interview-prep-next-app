import type { RoleOps } from "@/app/types";

export function formatRole(role: string): string {
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
