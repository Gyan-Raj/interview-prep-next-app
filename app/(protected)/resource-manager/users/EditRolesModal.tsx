"use client";

import { useEffect, useState } from "react";
import { getAllRoles_ResourceManager } from "@/app/actions";
import { toSentenceCase } from "@/app/utils/utils";
import { Role, UserRow } from "@/app/types";

export default function EditRolesModal({
  user,
  onClose,
  onSave,
}: {
  user: UserRow;
  onClose: () => void;
  onSave: (id: string, roles: string[]) => void;
}) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.roles.map((r) => r.id)
  );
  const [loading, setLoading] = useState(true);

  // Fetch all available roles on mount
  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getAllRoles_ResourceManager({ purpose: "edit" });
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

  function toggleRole(roleId: string) {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
    >
      <div
        className="w-105 p-5 space-y-5"
        style={{
          backgroundColor: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
          color: "var(--color-text)",
        }}
      >
        {/* Header */}
        <h2 className="text-lg font-semibold">Edit Roles</h2>

        {/* Roles List */}
        <div className="space-y-2 text-sm">
          {loading && <p className="opacity-70">Loading roles…</p>}

          {!loading && allRoles.length === 0 && (
            <p className="opacity-70">No roles available</p>
          )}

          {!loading &&
            allRoles.map((role) => {
              const checked = selectedRoles.includes(role.id);

              return (
                <label
                  key={role.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={
                      selectedRoles.length === 1 && selectedRoles[0] === role.id
                    }
                    onChange={() => toggleRole(role.id)}
                    className="accent-(--color-accent)"
                  />
                  <span>{toSentenceCase(role.name)}</span>
                </label>
              );
            })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm"
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              backgroundColor: "transparent",
              color: "var(--color-text)",
            }}
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(user.id, selectedRoles)}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{
              backgroundColor: "var(--color-accent)",
              borderRadius: "var(--radius-card)",
              color: "#000",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
