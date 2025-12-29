"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_MENU } from "@/app/components/SidebarMenu";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  role: "Admin" | "Resource Manager" | "Resource";
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ role, collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const menu = SIDEBAR_MENU[role];

  return (
    <aside
      className={`transition-all ${collapsed ? "w-16" : "w-64"}`}
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
          style={{
            color: "var(--color-text)",
          }}
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
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 text-sm transition"
              style={{
                color: "var(--color-text)",
                backgroundColor: active ? "var(--color-border)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "var(--color-border)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
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
