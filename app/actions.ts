import api from "@/app/api";
import {
  ChangePasswordTypes,
  LoginType,
  RequestSubmissionPayload,
  SendInvite_Admin_Types,
  SwitchRoleTypes,
  UpdateRoles_Admin_Types,
  UpdateSubmissionDetail_Resource_Types,
  UpdateSubmissionStatus_ResourceManager_Types,
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
export async function getAllRoles_Admin(params?: { purpose?: string }) {
  return api.get("/admin/roles", {
    params: {
      purpose: params?.purpose,
    },
  });
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

/** Resource Manager routes */
export async function getAllRoles_ResourceManager(params?: {
  purpose?: string;
}) {
  return api.get("/resource-manager/roles", {
    params: {
      purpose: params?.purpose,
    },
  });
}
export async function sendInvite_ResourceManager(
  payload: SendInvite_Admin_Types
) {
  return api.post("/resource-manager/invites/send", payload);
}
export async function deleteUser_ResourceManager(params?: { userId?: string }) {
  return api.delete("/resource-manager/users", {
    params: {
      userId: params?.userId,
    },
  });
}
export async function getUsers_ResourceManager(params?: {
  query?: string;
  roleIds?: string[];
}) {
  return api.get("/resource-manager/users", {
    params: {
      query: params?.query,
      roleIds: params?.roleIds?.join(","), // important
    },
  });
}
export async function updateRoles_ResourceManager(
  payload: UpdateRoles_Admin_Types
) {
  return api.post("/resource-manager/roles", payload);
}
export async function cancelInvite_ResourceManager(inviteId: string) {
  return api.post("/resource-manager/invites/cancel", { inviteId });
}
export async function getSubmissions_ResourceManager(params?: {
  searchText?: string;
  submissionStatusIds?: string[];
}) {
  return api.get("/resource-manager/submissions", {
    params: {
      query: params?.searchText,
      submissionStatusIds: params?.submissionStatusIds?.join(","), // important
    },
  });
}
export async function updateSubmission_ResourceManager(
  payload: UpdateSubmissionStatus_ResourceManager_Types
) {
  return api.patch("/resource-manager/submissions", payload);
}
export async function getCompanies_ResourceManager(params?: {
  query?: string;
}) {
  return api.get("/resource-manager/submissions/companies", {
    params: { query: params?.query },
  });
}
export async function getResources_ResourceManager(params?: {
  query?: string;
}) {
  return api.get("/resource-manager/submissions/resources", {
    params: { query: params?.query },
  });
}
export async function getInterviewRoles_ResourceManager(params?: {
  query?: string;
}) {
  return api.get("/resource-manager/submissions/interview-roles", {
    params: { query: params?.query },
  });
}
export async function getInterviewRounds_ResourceManager(params?: {
  query?: string;
}) {
  return api.get("/resource-manager/submissions/interview-rounds", {
    params: { query: params?.query },
  });
}
export async function postRequestSubmission_ResourceManager(
  payload: RequestSubmissionPayload
) {
  return api.post("/resource-manager/submissions", payload);
}

/** Resource */
export async function getMySubmissions_Resource(params?: {
  searchText?: string;
  submissionStatusIds?: string[];
  submissionId?: string;
}) {
  return api.get(
    params && params.submissionId
      ? `/resource/submissions/:${params.submissionId}`
      : `/resource/submissions`,
    {
      params: {
        query: params?.searchText,
        submissionStatusIds: params?.submissionStatusIds?.join(","), // important
      },
    }
  );
}

export async function updateSubmissionDetail_Resource(
  payload: UpdateSubmissionDetail_Resource_Types
) {
  return api.patch("/resource/submissions", payload);
}
