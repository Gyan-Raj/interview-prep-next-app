"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SIDEBAR_MENU } from "@/app/components/SidebarMenu";
import { ChevronLeft, ChevronRight, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { SidebarMenuItem } from "@/app/types";
import { logout } from "../actions";
import { useAppDispatch } from "../store/hooks";
import { clearUser } from "../store/slices/authSlice";

type Role = "Admin" | "Resource Manager" | "Resource";

type Props = {
  role: Role;
  collapsed: boolean;
  onToggle: () => void;
};

function isParentItem(
  item: SidebarMenuItem
): item is Extract<SidebarMenuItem, { children: SidebarMenuItem[] }> {
  return Array.isArray(item.children);
}

export default function Sidebar({ role, collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const menu = SIDEBAR_MENU[role];
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const dispatch = useAppDispatch();
  const router = useRouter();

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleLogout() {
    try {
      const res = await logout();
      if (res.status === 200) {
        dispatch(clearUser());
        router.replace("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Error logging out (api/logout)", error);
    }
  }

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ${
        collapsed ? "w-12" : "w-42"
      } border-r`}
      style={{ borderRight: "0.5px solid var(--color-text)" }}
    >
      {/* Toggle */}
      <div className="flex justify-end p-2 relative">
        <button
          onClick={onToggle}
          className={`p-1 absolute border-[0.5px] h-7 w-7 -right-3 top-0 transition bg-(--color-panel) hover:bg-(--color-accent-strong) rounded-full`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1">
        {menu.map((item) => {
          const Icon = item.icon;

          if (isParentItem(item)) {
            const isOpen = openItems[item.label];
            const isChildActive = item.children.some((c) =>
              pathname.startsWith(c.href)
            );

            return (
              <div key={item.label}>
                <div
                  onClick={() => toggleItem(item.label)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition ${isChildActive ? "bg-(--color-selected-bg) font-medium" : "hover:bg-(--color-hover)"}`}
                  style={{ color: "var(--color-text)" }}
                >
                  <Icon size={18} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </div>

                {!collapsed && (
                  <div
                    className={`ml-8 overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-4 py-2 text-sm transition ${childActive ? "bg-(--color-selected-bg)" : "hover:bg-(--color-hover)"}`}
                          style={{ color: "var(--color-text)" }}
                        >
                          <ChildIcon size={16} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Leaf item
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center text-sm transition ${collapsed ? "justify-center px-0 py-2" : "gap-2 px-4 py-2"} ${isActive ? "bg-(--color-selected-bg) font-medium" : "hover:bg-(--color-hover)"}`}
              style={{ color: "var(--color-text)" }}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 pb-4">
        <button
          className={`w-full flex items-center rounded-lg py-2 text-sm font-medium transition-colors btn-logout ${
            collapsed ? "justify-center px-0" : "gap-2 px-3"
          }`}
          onClick={handleLogout}
        >
          <LogOut size={collapsed ? 12 : 18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
