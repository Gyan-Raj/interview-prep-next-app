import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.MAIL_FROM_EMAIL,
          name: process.env.MAIL_FROM_NAME,
        },
        to: [{ email: "mujjalminmulla07@gmail.com" }],
        subject: "Brevo API Test",
        htmlContent: "<p>If you received this, Brevo is working.</p>",
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ success: true, status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
