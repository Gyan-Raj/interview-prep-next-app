import { LayoutDashboard, Users, Settings } from "lucide-react";
import { roleDashboardRoute } from "@/app/utils/utils";

export const SIDEBAR_MENU = {
  Admin: [
    {
      label: "Dashboard",
      href: roleDashboardRoute.ADMIN,
      icon: LayoutDashboard,
    },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],

  "Resource Manager": [
    {
      label: "Dashboard",
      href: roleDashboardRoute["RESOURCE MANAGER"],
      icon: LayoutDashboard,
    },
    { label: "Users", href: "/resource-manager/users", icon: Users },
    { label: "Settings", href: "/resource-manager/settings", icon: Settings },
  ],

  Resource: [
    {
      label: "Dashboard",
      href: roleDashboardRoute.RESOURCE,
      icon: LayoutDashboard,
    },
  ],
};
