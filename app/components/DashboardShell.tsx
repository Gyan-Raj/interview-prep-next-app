"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";

type Props = {
  role: "Admin" | "Resource Manager" | "Resource";
  children: React.ReactNode;
};

export default function DashboardShell({ role, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
      />

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
