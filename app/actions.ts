import api from "@/app/api";
import {
  ChangePasswordTypes,
  LoginType,
  SendInvite_Admin_Types,
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
export async function acceptInvite(token: string) {
  return api.get("/accept-invite", {
    params: { token },
  });
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
export async function getUsers_Admin(params?: {
  query?: string;
  roleIds?: string[];
}) {
  return api.get("/admin/users", {
    params: {
      query: params?.query,
      roleIds: params?.roleIds?.join(","), // important
    },
  });
}
export async function updateRoles_Admin(payload: UpdateRoles_Admin_Types) {
  return api.post("/admin/roles", payload);
}
export async function getAllRoles_Admin() {
  return api.get("/admin/roles");
}
export async function sendInvite_Admin(payload: SendInvite_Admin_Types) {
  return api.post("/admin/invites/send", payload);
}
export async function deleteUser_Admin(params?: { userId?: string }) {
  return api.delete("/admin/users", {
    params: {
      userId: params?.userId,
    },
  });
}
export async function cancelInvite_Admin(inviteId: string) {
  return api.post("/admin/invites/cancel", { inviteId });
}
