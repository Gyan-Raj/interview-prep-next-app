import { SUBMISSION_STATUS_CONFIG } from "@/app/constants/constants";
import { LucideIcon } from "lucide-react";

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
  id: string;
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
  interview: Interview;
  resource?: Resource;
  status: SubmissionStatusKey;
  submissionId: string;
  submissionVersionId: string;
  submittedAt: string | null;
  versionNumber: number;
};

export type UpdateSubmissionStatus_ResourceManager_Types = {
  submissionVersionId: string;
  action: string;
  reason?: string;
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

export type SubmissionStatusKey =
  (typeof SUBMISSION_STATUS_CONFIG)[number]["key"];

export type ResourceSubmissionRow = {
  submissionId: string;
  interview: Interview;
  submissionVersionId: string;
  submittedAt: string | null;
  versionNumber: number;
  status: SubmissionStatusKey;
};

export type UpdateSubmissionDetail_Resource_Types = {
  submissionId: string;
  action: "save" | "submit";
  questions: {
    text: string;
    mediaUrl?: string;
  }[];
};

type SidebarLeaf = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: never;
};

type SidebarParent = {
  label: string;
  icon: LucideIcon;
  children: SidebarLeaf[];
  href?: never;
};

export type SidebarMenuItem = SidebarLeaf | SidebarParent;

export type SidebarMenuConfig = {
  Admin: SidebarMenuItem[];
  "Resource Manager": SidebarMenuItem[];
  Resource: SidebarMenuItem[];
};
export type Question = {
  createdAt: string;
  id?: string;
  mediaUrl?: string | null;
  submissionVersionId?: string;
  tags?: string[];
  text: string;
};

export type QuestionRow = {
  id: string;
  text: string;
  createdAt: string;

  interview: {
    companyName?: string;
    role?: string;
    round?: string;
    interviewDate: string;
  };
};

export type EditActionTypes = "approved" | "rejected" | "delete";
// app/components/ConfirmationDialog/types.ts

export type ConfirmAction =
  | "delete"
  | "approved"
  | "rejected"
  | "save"
  | "edit"
  | "submit"
  | "cancel";

export type ConfirmEntity = "user" | "invite" | "submission" | "item"; // fallback / generic
