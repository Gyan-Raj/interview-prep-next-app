import { getAuthUser } from "@/app/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminDashboard() {
  const user = await getAuthUser();

  if (!user || user.activeRole.name !== "ADMIN") {
    notFound();
  }

  return (
    <div>
      {/* <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded border p-4">Total Users</div>
        <div className="rounded border p-4">Active Sessions</div>
        <div className="rounded border p-4">System Health</div>
      </div> */}
      <h1 className="text-2xl font-semibold">Hi, {user?.name}</h1>
    </div>
  );
}
