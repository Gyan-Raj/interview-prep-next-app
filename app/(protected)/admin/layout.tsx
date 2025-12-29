import DashboardShell from "@/app/components/DashboardShell";

import ProtectedLayout from "@/app/components/ProtectedLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRoles={["ADMIN"]}>
      {() => <DashboardShell role="Admin">{children}</DashboardShell>}
    </ProtectedLayout>
  );
}
