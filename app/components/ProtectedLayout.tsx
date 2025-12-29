import { getAuthUser } from "@/app/lib/auth";
import { notFound, redirect } from "next/navigation";
import AuthHydrator from "@/app/components/AuthHydrator";

export default async function ProtectedLayout({ allowedRoles, children }) {
  const user = await getAuthUser();

  if (!user) redirect("/");
  if (!allowedRoles.includes(user.activeRole.name)) notFound();

  return (
    <>
      <AuthHydrator user={user} />
      {children(user)}
    </>
  );
}
