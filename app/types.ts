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
  activeRole: Role;
  roles: Role[];
}
export type ChangePasswordTypes = {
  currentPassword: string;
  newPassword: string;
};
export type SwitchRoleTypes = {
  roleId: string;
};

/** Admin */
export type UpdateRoles_Admin_Types = {
  userId: string;
  roleId: string;
  action: "add" | "remove";
};
