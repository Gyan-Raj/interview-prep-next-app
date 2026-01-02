import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type SendInviteMailParams = {
  toEmail: string;
  toName?: string;
  inviteLink: string;
};

export async function sendInviteMail({
  toEmail,
  toName,
  inviteLink,
}: SendInviteMailParams): Promise<boolean> {
  try {
    const res = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: process.env.MAIL_FROM_EMAIL,
          name: process.env.MAIL_FROM_NAME,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject: "Invitation to join - Interview Ready",
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

          <p>This link will expire in 72 hours.</p>

          <p>If you didn’t expect this invite, you can ignore this email.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 10_000,
      }
    );

    return res.status >= 200 && res.status < 300;
  } catch (error) {
    console.error("Brevo mail send failed:", error);
    return false;
  }
}
