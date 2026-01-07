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
  name: string | null;
  email: string;
  phone: string | null;
  activeRole: Role | null;
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

type Interview = {
  id: string;
  companyName: string;
  role: string;
  round: string;
  interviewDate: string;
};
type Resource = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};
export type SubmissionRow = {
  submissionVersionId: string;

  interview: Interview;

  resource: Resource;

  versionNumber: number;
  submittedAt: string;
};

export type UpdateSubmissionStatus_ResourceManager_Types = {
  submissionVersionId: string;
  action: string;
};
export type RequestSubmissionPayload = {
  company: { id?: string; name?: string };
  role: { id?: string; name?: string };
  round: { id?: string; name?: string };
  resourceId: string;
  interviewDate: string;
};

// SearchSelect
export type Option = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
};
export type SearchSelectProps = {
  label: string;
  value: Option | null;
  onChange: (opt: Option) => void;
  fetchOptions: (query?: string) => Promise<Option[]>;
  allowCreate?: boolean;
};
