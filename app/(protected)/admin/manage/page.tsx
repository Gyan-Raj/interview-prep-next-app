"use client";

import { getUsers_Admin, updateRoles_Admin } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { Role } from "@/app/types";
import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  name?: string;
  email: string;
  roles: Role[];
};

export default function AdminManage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const fetchUsers = async () => {
    try {
      const res = await getUsers_Admin();
      if (res.status === 200) {
        const data = res.data;
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching admin users (admin/users)", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function updateRole(
    userId: string,
    roleId: string,
    action: "add" | "remove"
  ) {
    try {
      const res = await updateRoles_Admin({ userId, roleId, action });

      if (res.status === 200) {
        const { updatedUser } = res.data;

        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );

        if (authUser?.id === updatedUser.id) {
          dispatch(setUser(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error updating user role", error);
    }
  }

  if (loading) {
    return <div>Loading users…</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Role Management</h1>
      <p className="mt-1 opacity-80">
        Manage Admin, Resource Manager, and Resources
      </p>

      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded border p-4"
            style={{
              backgroundColor: "var(--color-panel)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{user.name ?? "—"}</p>
                <p className="text-sm opacity-70">{user.email}</p>
              </div>

              <div className="flex gap-2">
                {user?.roles?.map((role) => {
                  const hasRole = user.roles.find((r) => r.id === role.id);

                  const isSelf = authUser?.id === user.id;
                  const isActiveRole =
                    isSelf && authUser?.activeRole.id === role.id;

                  // 🚫 Do NOT show "Remove" for active role of self
                  if (hasRole && isActiveRole) {
                    return (
                      <span
                        key={role.id}
                        className="rounded px-3 py-1 text-sm opacity-60 border"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        {role.name}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={role.id}
                      onClick={() =>
                        updateRole(user.id, role.id, hasRole ? "remove" : "add")
                      }
                      className="rounded px-3 py-1 text-sm border"
                      style={{
                        backgroundColor: hasRole
                          ? "var(--color-border)"
                          : "transparent",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      {hasRole ? `Remove ${role.name}` : `Add ${role.name}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
