"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const router = useRouter();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Delete profile state
  const [confirmDelete, setConfirmDelete] = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setLoading(false);

    if (res.ok) {
      alert("Password changed successfully. Please log in again.");
      router.replace("/");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.message || "Failed to change password");
    }
  }

  async function handleDeleteProfile() {
    if (confirmDelete !== "DELETE") {
      alert('Type "DELETE" to confirm');
      return;
    }

    const res = await fetch("/api/delete-profile", {
      method: "POST",
    });

    if (res.ok) {
      router.replace("/");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.message || "Failed to delete profile");
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
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded px-4 py-2 text-sm"
          style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
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
          className="rounded px-4 py-2 text-sm bg-red-600 text-white"
        >
          Delete Profile
        </button>
      </div>
    </div>
  );
}
