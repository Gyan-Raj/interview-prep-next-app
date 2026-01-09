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
  searchText?: string;
  roleIds?: string[];
}) {
  return api.get("/admin/users", {
    params: {
      searchText: params?.searchText,
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
export async function cancelInvite_Admin(id: string) {
  return api.post("/admin/invites/cancel", { id });
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
  searchText?: string;
  roleIds?: string[];
}) {
  return api.get("/resource-manager/users", {
    params: {
      searchText: params?.searchText,
      roleIds: params?.roleIds?.join(","), // important
    },
  });
}
export async function updateRoles_ResourceManager(
  payload: UpdateRoles_Admin_Types
) {
  return api.post("/resource-manager/roles", payload);
}
export async function cancelInvite_ResourceManager(id: string) {
  return api.post("/resource-manager/invites/cancel", { id });
}
export async function getSubmissions_ResourceManager(params?: {
  searchText?: string;
  submissionStatuses?: string[];
  submissionId?: string;
}) {
  return api.get(
    params?.submissionId
      ? `/resource-manager/submissions/${params.submissionId}` // ✅ FIX
      : `/resource-manager/submissions`,
    {
      params: {
        searchText: params?.searchText, // also fix key name
        submissionStatuses: params?.submissionStatuses?.join(","),
      },
    }
  );
}
export async function updateSubmission_ResourceManager(
  payload: UpdateSubmissionStatus_ResourceManager_Types
) {
  return api.patch("/resource-manager/submissions", payload);
}
export async function deleteSubmission_ResourceManager(params: {
  submissionVersionId: string;
}) {
  return api.delete(
    `/resource-manager/submissions/${params.submissionVersionId}`
  );
}
export async function getCompanies_ResourceManager(params?: {
  searchText?: string;
}) {
  return api.get("/resource-manager/submissions/companies", {
    params: { searchText: params?.searchText },
  });
}
export async function getResources_ResourceManager(params?: {
  searchText?: string;
}) {
  return api.get("/resource-manager/submissions/resources", {
    params: { searchText: params?.searchText },
  });
}
export async function getInterviewRoles_ResourceManager(params?: {
  searchText?: string;
}) {
  return api.get("/resource-manager/submissions/interview-roles", {
    params: { searchText: params?.searchText },
  });
}
export async function getInterviewRounds_ResourceManager(params?: {
  searchText?: string;
}) {
  return api.get("/resource-manager/submissions/interview-rounds", {
    params: { searchText: params?.searchText },
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
  submissionStatuses?: string[];
  submissionId?: string;
}) {
  return api.get(
    params?.submissionId
      ? `/resource/submissions/${params.submissionId}` // ✅ FIX
      : `/resource/submissions`,
    {
      params: {
        searchText: params?.searchText, // also fix key name
        submissionStatuses: params?.submissionStatuses?.join(","),
      },
    }
  );
}
export async function updateSubmissionDetail_Resource(
  payload: UpdateSubmissionDetail_Resource_Types
) {
  return api.patch("/resource/submissions", payload);
}
export async function getAllQuestions(params: {
  searchText?: string;
  roleIds?: string[];
  companyIds?: string[];
  roundIds?: string[];
  approvedOnly?: boolean;
  sort?: "asc" | "desc";
}) {
  return api.get("/resource/questions", {
    params: {
      searchText: params.searchText,
      roleIds: params.roleIds?.join(","),
      companyIds: params.companyIds?.join(","),
      roundIds: params.roundIds?.join(","),
      approvedOnly: params.approvedOnly,
      sort: params.sort,
    },
  });
}

export async function getAllCompanies() {
  return api.get("/resource/submissions/companies");
}
export async function getAllRoles() {
  return api.get("/resource/submissions/interview-roles");
}
export async function getAllRounds() {
  return api.get("/resource/submissions/interview-rounds");
}
