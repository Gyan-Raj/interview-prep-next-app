"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deleteProfile } from "@/app/actions";

export default function ResourceSettings() {
  const router = useRouter();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Delete profile state
  const [confirmDelete, setConfirmDelete] = useState("");

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
    </div>
  );
}
