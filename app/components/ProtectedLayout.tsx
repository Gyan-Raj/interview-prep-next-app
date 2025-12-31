import { getAuthUser } from "@/app/lib/auth";
import { notFound, redirect } from "next/navigation";
import AuthHydrator from "@/app/components/AuthHydrator";
import { AuthUser, RoleOps } from "@/app/types";

type Props = {
  allowedRoles: RoleOps[];
  children: (user: AuthUser) => React.ReactNode;
};

export default async function ProtectedLayout({
  allowedRoles,
  children,
}: Props) {
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
