import { redirect } from "next/navigation";
import { getAuthUser } from "@/app/lib/auth";
import SignIn from "@/app/components/SignIn";
import { roleDashboardRoute } from "./utils/utils";

export default async function Home() {
  const user = await getAuthUser();

  if (user) {
    redirect(roleDashboardRoute[user.activeRole.name]);
  }
  return (
    <main className="h-[calc(100vh-3.5rem)] overflow-hidden flex items-center justify-center">
      <SignIn />
    </main>
  );
}
