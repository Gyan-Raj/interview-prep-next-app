export interface LoginType {
  email: string;
  password: string;
}
export type RoleOps = "ADMIN" | "RESOURCE MANAGER" | "RESOURCE";
export type Role = {
  id: string;
  name: RoleOps;
};
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  activeRole: Role;
  roles: Role[];
}
export type ChangePasswordTypes = {
  currentPassword?: string;
  password: string;
  token?: string;
};
export type SwitchRoleTypes = {
  roleId: string;
};

/** Admin */
export type UpdateRoles_Admin_Types = {
  userId: string;
  roleIds: string[];
};
export type SendInvite_Admin_Types = {
  name: string;
  email: string;
  phone: string;
  roleIds: string[];
};
export type UserRow = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  roles: Role[];
};
type DisplayRole = {
  id: string;
  name: string;
};

export type PendingInviteRow = {
  inviteId: string;
  userId: string;
  name?: string;
  email: string;
  phone?: string;
  roles: DisplayRole[];
};
