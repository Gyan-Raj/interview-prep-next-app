import DashboardShell from "@/app/components/DashboardShell";

import ProtectedLayout from "@/app/components/ProtectedLayout";

export default function AdminLayout({ children }) {
  return (
    <ProtectedLayout allowedRoles={["ADMIN"]}>
      {(user) => <DashboardShell role="Admin">{children}</DashboardShell>}
    </ProtectedLayout>
  );
}
