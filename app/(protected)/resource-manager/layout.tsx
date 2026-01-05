import DashboardShell from "@/app/components/DashboardShell";

import ProtectedLayout from "@/app/components/ProtectedLayout";

export default function ResourceManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRoles={["RESOURCE MANAGER"]}>
      {() => <DashboardShell role="Resource Manager">{children}</DashboardShell>}
    </ProtectedLayout>
  );
}
