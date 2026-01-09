"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_MENU } from "@/app/components/SidebarMenu";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

type Role = "Admin" | "Resource Manager" | "Resource";

type Props = {
  role: Role;
  collapsed: boolean;
  onToggle: () => void;
};
import { SidebarMenuItem } from "@/app/types";

function isParentItem(
  item: SidebarMenuItem
): item is Extract<SidebarMenuItem, { children: SidebarMenuItem[] }> {
  return Array.isArray(item.children);
}

export default function Sidebar({ role, collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const menu = SIDEBAR_MENU[role];

  // Track open accordions (keyed by href)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <aside
      className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      style={{
        backgroundColor: "var(--color-panel)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Collapse toggle */}
      <div className="flex justify-end p-2">
        <button
          onClick={onToggle}
          className="rounded p-1 transition"
          style={{ color: "var(--color-text)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-border)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-2 flex flex-col gap-1">
        {menu.map((item) => {
          const Icon = item.icon;

          // ✅ Parent item (accordion)
          if (isParentItem(item)) {
            const isOpen = openItems[item.label] || false;

            const isChildActive = item.children.some((c) =>
              pathname.startsWith(c.href)
            );

            return (
              <div key={item.label}>
                <div
                  className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer transition"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: isChildActive
                      ? "var(--color-border)"
                      : "transparent",
                  }}
                  onClick={() => toggleItem(item.label)}
                >
                  <Icon size={18} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </div>

                {!collapsed && (
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isOpen ? "500px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="ml-8 flex flex-col">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        const ChildIcon = child.icon;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-2 px-4 py-2 text-sm transition"
                            style={{
                              color: "var(--color-text)",
                              backgroundColor: childActive
                                ? "var(--color-border)"
                                : "transparent",
                            }}
                          >
                            <ChildIcon size={16} />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // ✅ Leaf item (normal link)
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 text-sm transition"
              style={{
                color: "var(--color-text)",
                backgroundColor: isActive
                  ? "var(--color-border)"
                  : "transparent",
              }}
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
