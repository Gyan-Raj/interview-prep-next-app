import type {
  ConfirmAction,
  ConfirmEntity,
  Message,
  InviteRow,
  RoleOps,
  SubmissionRow,
  UserRow,
} from "@/app/types";

export function toSentenceCase(role: string): string {
  if (!role) return "";

  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const roleDashboardRoute: Record<RoleOps, string> = {
  ADMIN: "/admin/dashboard",
  "RESOURCE MANAGER": "/resource-manager/dashboard",
  RESOURCE: "/resource/dashboard",
};

export async function copyInviteLink(
  invite: InviteRow,
  onAfterCopy?: () => void
) {
  try {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${invite.id}`;
    await navigator.clipboard.writeText(inviteUrl);
    onAfterCopy?.();
  } catch (e) {
    console.error("Failed to copy invite link", e);
    alert("Failed to copy invite link");
  }
}

// app/utils/formatDate.ts

function getDaySuffix(day: number) {
  if (day >= 11 && day <= 13) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatDisplayDate(dateInput: string | Date) {
  const date = new Date(dateInput);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}${getDaySuffix(day)} ${month}, ${year}`;
}

export function canAdminDeleteUser(user: UserRow) {
  return !user.roles.some((r) => r.name === "ADMIN");
}

export function canRMDeleteUser(user: UserRow) {
  return !user.roles.some((r) =>
    ["ADMIN", "RESOURCE MANAGER"].includes(r.name)
  );
}

export function canAdminCancelInvite(invite: InviteRow) {
  return !invite.roles.some((r) => r.name === "ADMIN");
}

export function canRMCancelInvite(invite: InviteRow) {
  return !invite.roles.some((r) =>
    ["ADMIN", "RESOURCE MANAGER"].includes(r.name)
  );
}

export function getConfirmationTitle(
  action: ConfirmAction,
  entity: ConfirmEntity
) {
  let readableAction = "";
  switch (action) {
    case "approved":
      readableAction = "Approve";
      break;
    case "rejected":
      readableAction = "Reject";
      break;
    case "send-again":
      readableAction = "Send new";
      break;
    case "reminder":
      readableAction = "Send reminder for the";
      break;
    default:
      readableAction = toSentenceCase(action);
      break;
  }

  return `${readableAction} ${entity}?`;
}

export function buildSystemPrompt(role: string): Message {
  return {
    role: "system",
    content: `
You are an expert technical interviewer and mentor with deep experience across
frontend, backend, DevOps, QA, system design, and software architecture.

You are currently helping a candidate prepare for a ${role} interview.

Your task is to help developers prepare for interviews by giving
clear, structured, and practical answers.

RULES YOU MUST FOLLOW:

1. Always explain in a clear, step-by-step manner.
2. Start with a short, direct answer (2–3 lines max).
3. Then explain the reasoning in simple terms.
4. Use practical examples whenever possible.
5. If code is relevant, show minimal and correct code snippets only.
6. Avoid unnecessary theory unless explicitly asked.
7. Prefer real-world explanations over textbook definitions.
8. Be concise, but complete — no rambling.
9. If a concept has common mistakes, explicitly mention them.
10. If trade-offs exist, clearly compare them.
11. Assume the reader has basic technical knowledge but may be nervous (interview context).

OUTPUT FORMAT (STRICT):

- Short Answer
- Explanation
- Example (if applicable)
- Common Mistakes (if applicable)
- When to Use / Avoid (if applicable)

TONE:
- Professional
- Calm
- Confident
- Interview-focused

Do NOT:
- Mention AI, models, or yourself.
- Over-explain obvious basics.
- Use excessive markdown.
- Ask follow-up questions unless clarification is required.

Your goal is to help the user give a strong interview answer, not to teach a full course.
`,
  };
}
