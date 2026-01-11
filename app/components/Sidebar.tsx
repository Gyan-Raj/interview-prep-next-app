"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_MENU } from "@/app/components/SidebarMenu";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SidebarMenuItem } from "@/app/types";

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

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`transition-all duration-300 ${
        collapsed ? "w-12" : "w-42"
      } border-r`}
      style={{ borderRight: "0.5px solid var(--color-text)" }}
    >
      {/* Toggle */}
      <div className="flex justify-end p-2 relative">
        <button
          onClick={onToggle}
          className={`p-1 absolute border-[0.5px] h-7 w-7 -right-3 top-0 transition bg-(--color-panel) hover:bg-(--color-button-primary-bg) cursor-pointer`}
          style={{
            color: "var(--color-text)",
            borderRadius: "100%",
          }}
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
                  className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer transition
                    ${
                      isChildActive
                        ? "bg-(--color-border)"
                        : "hover:bg-(--color-hover)"
                    }`}
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
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-4 py-2 text-sm transition
                            ${
                              childActive
                                ? "bg-(--color-border)"
                                : "hover:bg-(--color-hover)"
                            }`}
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
              className={`flex items-center gap-2 px-4 py-2 text-sm transition
                ${
                  isActive
                    ? "bg-(--color-border)"
                    : "hover:bg-(--color-hover)"
                }`}
              style={{ color: "var(--color-text)" }}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
