import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type SendMailParams = {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
};

export async function mailer({
  toEmail,
  toName,
  subject,
  htmlContent,
}: SendMailParams): Promise<boolean> {
  try {
    const res = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: process.env.MAIL_FROM_EMAIL!,
          name: process.env.MAIL_FROM_NAME!,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject,
        htmlContent,
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
