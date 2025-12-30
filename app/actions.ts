import api from "@/app/api";
import {
  ChangePasswordTypes,
  LoginType,
  SwitchRoleTypes,
  UpdateRoles_Admin_Types,
} from "@/app/types";

export async function login(payload: LoginType) {
  return api.post("/login", payload);
}
export async function me() {
  return api.get("/me");
}
export async function changePassword(payload: ChangePasswordTypes) {
  return api.post("/change-password", payload);
}
export async function deleteProfile() {
  return api.post("/delete-profile");
}
export async function switchRole(payload: SwitchRoleTypes) {
  return api.post("/switch-role", payload);
}
export async function logout() {
  return api.post("/logout");
}

/** Admin routes */
export async function getUsers_Admin() {
  return api.get("/admin/users");
}
export async function updateRoles_Admin(payload: UpdateRoles_Admin_Types) {
  return api.post("/admin/roles", payload);
}
