import {
  LayoutDashboard,
  Users,
  Settings,
  ClipboardPen,
  BadgeQuestionMark,
  Building2,
  FileBraces,
} from "lucide-react";
import { roleDashboardRoute } from "@/app/utils/utils";
import { SidebarMenuConfig } from "@/app/types";

export const SIDEBAR_MENU: SidebarMenuConfig = {
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
    {
      label: "Interview Submissions",
      href: "/resource-manager/submissions",
      icon: ClipboardPen,
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
    {
      label: "My Submissions",
      href: "/resource/submissions",
      icon: ClipboardPen,
    },
    // {
    //   label: "Questions",
    //   icon: BadgeQuestionMark,
    //   children: [
    //     {
    //       label: "By companies",
    //       href: "/resource/questions/companies",
    //       icon: Building2,
    //     },
    //     {
    //       label: "By roles",
    //       href: "/resource/questions/roles",
    //       icon: FileBraces,
    //     },
    //   ],
    // },
    {
      label: "Questions",
      href: "/resource/questions",
      icon: BadgeQuestionMark,
    },
    { label: "Settings", href: "/resource/settings", icon: Settings },
  ],
};
