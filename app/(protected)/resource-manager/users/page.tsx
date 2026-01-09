"use client";

import {
  deleteUser_ResourceManager,
  getAllRoles_ResourceManager,
  getUsers_ResourceManager,
  updateRoles_ResourceManager,
} from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { Role, UserRow } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/app/hooks/hooks";
import EditRolesModal from "./EditRolesModal";
import { canRMDeleteUser, toSentenceCase } from "@/app/utils/utils";
import { Filter } from "lucide-react";
import AddUserModal from "@/app/(protected)/resource-manager/users/AddUserModal";
import UsersList from "@/app/components/users/UsersList";
import UserActionsMenu from "@/app/components/users/UserActionsMenu";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

type RoleOption = {
  id: string;
  name: string;
};

export default function ResourceManagerUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [rolesOpen, setRolesOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showEditRoles, setShowEditRoles] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const [allRoles, setAllRoles] = useState<RoleOption[]>([]);

  const debouncedQuery = useDebounce(query, 400);

  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  async function fetchUsers(isInitial = false) {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setListLoading(true);
    }

    try {
      const res = await getUsers_ResourceManager({
        searchText: debouncedQuery,
        roleIds:
          selectedRoleIds.length === allRoles.length
            ? undefined
            : selectedRoleIds,
      });

      if (res.status === 200) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error("Error fetching users", e);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setListLoading(false);
      }
    }
  }

  const debouncedRoleIds = useDebounce(selectedRoleIds, 400);

  useEffect(() => {
    if (allRoles.length > 0) {
      fetchUsers(true); // 👈 initial page load
    }
  }, [allRoles]);

  useEffect(() => {
    if (allRoles.length > 0) {
      fetchUsers(false); // 👈 list refresh only
    }
  }, [debouncedQuery, debouncedRoleIds]);

  async function updateRoles(userId: string, roleIds: string[]) {
    try {
      const res = await updateRoles_ResourceManager({ userId, roleIds });
      if (res.status === 200) {
        const { updatedUser } = res.data;

        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );

        if (authUser?.id === updatedUser.id) {
          dispatch(setUser(updatedUser));
        }
      }
      setShowEditRoles(false);
    } catch (error) {
      console.error(
        "Error updating user roles(api/resource-manager/roles)",
        error
      );
    }
  }

  useEffect(() => {
    async function fetchRoles() {
      const res = await getAllRoles_ResourceManager();
      if (res.status === 200) {
        setAllRoles(res.data);
        setSelectedRoleIds(res.data.map((r: Role) => r.id)); // all selected
      }
    }
    fetchRoles();
  }, []);

  const isAllSelected =
    allRoles.length > 0 && selectedRoleIds.length === allRoles.length;

  const filterLabel = isAllSelected ? (
    <div className="flex items-center gap-0.5">
      {" "}
      <Filter size={14} style={{ color: "var(--color-text)", opacity: 0.7 }} />
      <span>All</span>
    </div>
  ) : (
    <div className="flex items-center gap-0.5">
      {" "}
      <Filter size={14} style={{ color: "var(--color-text)", opacity: 0.7 }} />
      <span>
        {selectedRoleIds
          .map((id) => allRoles.find((r) => r.id === id)?.name)
          .filter(Boolean)
          .map((el) => toSentenceCase(el ?? ""))
          .join(", ")}
      </span>
    </div>
  );

  function toggleAll() {
    if (isAllSelected) return; // disabled when checked

    setSelectedRoleIds(allRoles.map((r) => r.id));
  }

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  }
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setRolesOpen(false);
      }
    }

    if (rolesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [rolesOpen]);

  {
    initialLoading ? (
      <div>Loading users…</div>
    ) : (
      <>
        {/* Toolbar stays mounted */}
        {/* Users list handles its own loading */}
      </>
    );
  }
  const handleDeleteProfile = async () => {
    try {
      const res = await deleteUser_ResourceManager({
        userId: selectedUser?.id,
      });

      if (res.status === 200) {
        fetchUsers();
        setShowDelete(false);
        setSelectedUser(null);
      }
    } catch (e) {
      console.error("Error fetching users", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <input
          placeholder="Search user"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-0 max-w-md px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            color: "var(--color-text)",
          }}
        />

        <div className="flex items-center gap-3 flex-nowrap">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setRolesOpen((v) => !v)}
              className="px-3 py-2 text-sm whitespace-nowrap"
              style={{
                backgroundColor: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
              }}
            >
              {filterLabel || "Select roles"}
            </button>
            {rolesOpen && (
              <div
                className="absolute mt-2 w-56 p-3 space-y-2 z-20 right-0"
                style={{
                  backgroundColor: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* All */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    disabled={isAllSelected}
                    onChange={toggleAll}
                  />

                  <span>All</span>
                </label>

                <hr style={{ borderColor: "var(--color-border)" }} />

                {/* Roles */}
                {allRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 text-sm"
                    style={{ opacity: isAllSelected ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      disabled={
                        selectedRoleIds.length === 1 &&
                        selectedRoleIds[0] === role.id
                      }
                      onChange={() => toggleRole(role.id)}
                    />
                    {toSentenceCase(role.name)}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="btn-primary px-4 py-2 text-sm font-medium whitespace-nowrap"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div style={{ position: "relative" }}>
        {!listLoading && (
          <UsersList
            users={users}
            renderActions={(user) => {
              const canDelete = canRMDeleteUser(user);

              return (
                <UserActionsMenu
                  canDelete={canDelete}
                  onEdit={() => {
                    setSelectedUser(user);
                    setShowEditRoles(true);
                  }}
                  onDelete={() => {
                    setSelectedUser(user);
                    setShowDelete(true);
                  }}
                />
              );
            }}
          />
        )}
      </div>

      {showEditRoles && selectedUser && (
        <EditRolesModal
          user={selectedUser}
          onClose={() => setShowEditRoles(false)}
          onSave={updateRoles}
        />
      )}

      {showDelete && selectedUser && (
        <ConfirmationDialog
          open={showDelete}
          action="delete"
          entity="user"
          details={
            <>
              <div>{selectedUser.name}</div>
              <div className="opacity-70">{selectedUser.email}</div>
            </>
          }
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDeleteProfile}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onAddUser={() => {
            // call create user action here
            setShowAddUser(false);
            fetchUsers(false);
          }}
        />
      )}
    </div>
  );
}
