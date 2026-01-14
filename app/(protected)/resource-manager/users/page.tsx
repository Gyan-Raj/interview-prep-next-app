"use client";

import {
  deleteUser_ResourceManager,
  getAllRoles_ResourceManager,
  getUsers_ResourceManager,
  updateRoles_ResourceManager,
} from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/authSlice";
import { ConfirmAction, FilterConfig, Role, UserRow } from "@/app/types";
import { useEffect, useState } from "react";
import { useDebounce } from "@/app/hooks/hooks";
import EditRolesModal from "./EditRolesModal";
import { canRMDeleteUser, toSentenceCase } from "@/app/utils/utils";
import AddUserModal from "@/app/(protected)/resource-manager/users/AddUserModal";
import UsersList from "@/app/components/users/UsersList";
import UserActionsMenu from "@/app/components/users/UserActionsMenu";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import FiltersMenu from "@/app/components/filters/FiltersMenu";
import ListToolbar from "@/app/components/list/ListToolbar";
import SearchInput from "@/app/components/SearchInput";

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

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [userAction, setUserAction] = useState<ConfirmAction | null>(null);

  const [allRoles, setAllRoles] = useState<RoleOption[]>([]);

  const debouncedQuery = useDebounce(query, 400);

  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const roleOptions = allRoles.map((r) => ({
    id: r.id,
    name: toSentenceCase(r.name),
  }));

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
      setUserAction(null);
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

  const isAllRolesSelected =
    roleOptions.length > 0 && selectedRoleIds.length === roleOptions.length;

  const filtersConfig: FilterConfig[] = [
    {
      key: "roles",
      label: "Roles",
      options: roleOptions,
      selected: selectedRoleIds,
      isAllSelected: isAllRolesSelected,
      onToggle: (id) => {
        setSelectedRoleIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
      },
      onSelectAll: () => {
        if (!isAllRolesSelected) {
          setSelectedRoleIds(roleOptions.map((r) => r.id));
        }
      },
    },
  ];

  const handleDeleteProfile = async () => {
    try {
      const res = await deleteUser_ResourceManager({
        userId: selectedUser?.id,
      });

      if (res.status === 200) {
        fetchUsers();
        setUserAction(null);
        setSelectedUser(null);
      }
    } catch (e) {
      console.error("Error fetching users", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <ListToolbar
        left={
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search users"
          />
        }
        right={
          <>
            <FiltersMenu filters={filtersConfig} />
            <button
              className="btn-primary px-4 py-2 text-sm font-medium whitespace-nowrap"
              onClick={() => setShowAddUser(true)}
            >
              + Add User
            </button>
          </>
        }
      />

      {/* Users List */}
      <div style={{ position: "relative" }}>
        {!listLoading && (
          <UsersList
            users={users}
            renderActions={(user) => {
              const canDelete = canRMDeleteUser(user);

              return (
                <UserActionsMenu
                  actions={[
                    { key: "edit", label: "Edit roles" },
                    { key: "delete", label: "Delete user" },
                  ]}
                  onAction={(action) => {
                    setSelectedUser(user);
                    setUserAction(action);
                  }}
                  user={user}
                  canDelete={canDelete}
                />
              );
            }}
          />
        )}
      </div>

      {userAction === "edit" && selectedUser && (
        <EditRolesModal
          user={selectedUser}
          onClose={() => setUserAction(null)}
          onSave={updateRoles}
        />
      )}

      {userAction === "delete" && selectedUser && (
        <ConfirmationDialog
          open={userAction === "delete"}
          action="delete"
          entity="user"
          details={
            <>
              <div>{selectedUser.name}</div>
              <div className="opacity-70">{selectedUser.email}</div>
            </>
          }
          onCancel={() => setUserAction(null)}
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
