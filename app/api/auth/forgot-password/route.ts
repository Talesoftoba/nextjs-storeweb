import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success (prevent email enumeration)
    if (!user) {
      return NextResponse.json({
        message: "If the email exists, a reset link has been sent.",
      });
    }

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.user.update({
      where: { email },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiry: expiry,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;

    console.log("Reset link:", resetLink);

    await resend.emails.send({
      from: "Your App <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click below to reset:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    return NextResponse.json({
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
