import DashboardShell from "@/app/components/DashboardShell";

import ProtectedLayout from "@/app/components/ProtectedLayout";

export default function ResourceManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRoles={["RESOURCE"]}>
      {() => <DashboardShell role="Resource">{children}</DashboardShell>}
    </ProtectedLayout>
  );
}
