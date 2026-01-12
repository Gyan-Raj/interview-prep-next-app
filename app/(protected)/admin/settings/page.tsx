"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  changePassword,
  deleteProfile,
  getAllRoles_Admin,
  updateRoles_Admin,
} from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { Role } from "@/app/types";
import { toSentenceCase } from "@/app/utils/utils";
import { SquarePen } from "lucide-react";

export default function AdminSettings() {
  const router = useRouter();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isSelfEdit, setIsSelfEdit] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const dispatch = useAppDispatch();

  // Delete profile state
  const [confirmDelete, setConfirmDelete] = useState("");

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getAllRoles_Admin({ purpose: "edit" });
        if (res.status === 200) {
          setAllRoles(res.data);
        }
      } catch (e) {
        console.error("Error fetching roles", e);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  useEffect(() => {
    if (authUser?.roles) {
      setSelectedRoleIds(authUser?.roles.map((r) => r.id) ?? []);
    }
  }, [authUser]);

  async function handleChangePassword(e: React.FormEvent) {
    try {
      e.preventDefault();
      setLoading(true);

      const res = await changePassword({ currentPassword, password });
      setLoading(false);

      if (res.status === 200) {
        alert("Password changed successfully. Please log in again.");
        router.replace("/");
        router.refresh();
      } else {
        const { data } = res;
        alert(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password (api/change-password)", error);
    }
  }

  async function handleDeleteProfile() {
    if (confirmDelete !== "DELETE") {
      alert('Type "DELETE" to confirm');
      return;
    }

    try {
      const res = await deleteProfile();

      if (res.status == 200) {
        router.replace("/");
        router.refresh();
      } else {
        const { data } = res;
        alert(data.message || "Failed to delete profile");
      }
    } catch (error) {
      console.error("Error deleting the profile (api/delete-profile)", error);
    }
  }

  async function handleUpdateRole() {
    try {
      if (!authUser) return;
      const prevRoleIds = authUser.roles.map((r) => r.id);
      const prevSet = new Set(prevRoleIds);
      const isSame = selectedRoleIds.every((id) => prevSet.has(id));

      if (isSame) return;
      if (isSame) return;
      const res = await updateRoles_Admin({
        userId: authUser.id,
        roleIds: selectedRoleIds,
      });

      if (res.status === 200) {
        const { updatedUser } = res.data;

        if (authUser?.id === updatedUser.id) {
          dispatch(setUser(updatedUser));
        }
      }
      setIsSelfEdit(false);
    } catch (error) {
      console.error("Error updating user roles(api/admin/roles)", error);
    }
  }

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) =>
      prev?.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...(prev ?? []), roleId]
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-semibold">Account Settings</h1>

      {/* Change Password */}
      <form
        onSubmit={handleChangePassword}
        className="rounded border p-4 space-y-4"
        style={{
          backgroundColor: "var(--color-panel)",
          borderColor: "var(--color-border)",
        }}
      >
        <h2 className="font-medium">Change Password</h2>

        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
          required
        />

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded px-4 py-2 text-sm btn-primary"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>

      {/* Delete Profile */}
      <div
        className="rounded border p-4 space-y-3"
        style={{
          backgroundColor: "var(--color-panel)",
          borderColor: "var(--color-border)",
        }}
      >
        <h2 className="font-medium text-red-600">Danger Zone</h2>
        <p className="text-sm opacity-80">
          This will permanently delete your account and all sessions.
        </p>

        <input
          placeholder='Type "DELETE" to confirm'
          value={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.value)}
          className="w-full rounded border px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
        />

        <button
          onClick={handleDeleteProfile}
          className="btn-danger rounded px-4 py-2 text-sm"
        >
          Delete Profile
        </button>
      </div>

      {/* Update Roles */}

      <div
        className="rounded border p-4 space-y-3"
        style={{
          backgroundColor: "var(--color-panel)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Header */}
        <h2 className="text-lg font-semibold">Your Roles</h2>
        <div className="flex justify-between">
          <p className="text-sm opacity-80">
            {authUser?.roles.map((r) => toSentenceCase(r.name)).join(", ")}
          </p>
          <SquarePen
            size={18}
            color="var(--color-text)"
            className="cursor-pointer"
            onClick={() =>
              isSelfEdit ? setIsSelfEdit(false) : setIsSelfEdit(true)
            }
          />
        </div>
        {/* Roles List */}
        {isSelfEdit && (
          <>
            <div className="space-y-2 text-sm">
              {loading && <p className="opacity-70">Loading roles…</p>}

              {!loading && allRoles.length === 0 && (
                <p className="opacity-70">No roles available</p>
              )}

              {!loading &&
                allRoles.map((role) => {
                  const checked = selectedRoleIds?.includes(role.id);

                  return (
                    <label
                      key={role.id}
                      className="flex items-center gap-3 cursor-pointer max-w-fit"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRole(role.id)}
                        disabled={role.id === authUser?.activeRole?.id}
                        className="accent-(--color-accent)"
                      />
                      <span>{toSentenceCase(role.name)}</span>
                    </label>
                  );
                })}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleUpdateRole}
                disabled={loading}
                className="btn-primary px-4 py-1.5 text-sm"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
