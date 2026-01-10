import { mailer } from "@/app/lib/mail/mailer";

export async function sendInviteMail({
  toEmail,
  toName,
  inviteLink,
}: {
  toEmail: string;
  toName?: string;
  inviteLink: string;
}) {
  return mailer({
    toEmail,
    toName,
    subject: "Invitation to join – Interview Ready",
    htmlContent: `
      <p>Hello ${toName ?? ""},</p>

      <p>You’ve been invited to join <strong>Interview Ready</strong>.</p>

      <p>
        Click the link below to set your password and activate your account:
      </p>

      <p>
        <a href="${inviteLink}" target="_blank">
          Accept Invitation
        </a>
      </p>

      <p><strong>This link will expire in 72 hours.</strong></p>

      <p>If you didn’t expect this invite, you can safely ignore this email.</p>
    `,
  });
}

export async function sendInviteCancelledMail({
  toEmail,
  toName,
  cancelledByRole,
}: {
  toEmail: string;
  toName?: string;
  cancelledByRole: "ADMIN" | "RESOURCE MANAGER";
}) {
  return mailer({
    toEmail,
    toName,
    subject: "Your onboarding invite has been cancelled",
    htmlContent: `
      <p>Hello ${toName ?? ""},</p>

      <p>
        Your onboarding invite link has been <strong>cancelled</strong>
        by a ${cancelledByRole.toLowerCase()}.
      </p>

      <p>
        If you still need access, please contact your manager or administrator
        to request a new invite.
      </p>

      <p>Regards,<br/>Interview Ready Team</p>
    `,
  });
}

export async function sendInviteReminderMail({
  toEmail,
  toName,
  inviteLink,
}: {
  toEmail: string;
  toName?: string;
  inviteLink: string;
}) {
  return mailer({
    toEmail,
    toName,
    subject: "Reminder: Your invitation is waiting",
    htmlContent: `
      <p>Hello ${toName ?? ""},</p>

      <p>This is a reminder to complete your onboarding for <strong>Interview Ready</strong>.</p>

      <p>
        <a href="${inviteLink}" target="_blank">
          Complete Onboarding
        </a>
      </p>

      <p>Please note: this link will expire as per the original timeline.</p>

      <p>Regards,<br/>Interview Ready Team</p>
    `,
  });
}

export async function sendUserDeletedMail({
  toEmail,
  toName,
  deletedByName,
}: {
  toEmail: string;
  toName?: string;
  deletedByName?: string;
}) {
  return mailer({
    toEmail,
    toName,
    subject: "Your account has been removed – Interview Ready",
    htmlContent: `
      <p>Hello ${toName ?? ""},</p>

      <p>
        Your account on <strong>Interview Ready</strong> has been removed by an administrator.
      </p>

      ${
        deletedByName
          ? `<p><strong>Action performed by:</strong> ${deletedByName}</p>`
          : ""
      }

      <p>
        If you believe this was done in error, please contact your administrator
        or manager for clarification.
      </p>

      <p>
        Regards,<br/>
        Interview Ready Team
      </p>
    `,
  });
}
