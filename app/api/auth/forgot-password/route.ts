import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { identifier } = await req.json(); // could be email or NIK
    
    if (!identifier) {
      return NextResponse.json({ error: "Email or NIK is required" }, { status: 400 });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { nik: identifier }]
    });

    if (!user) {
      // Return success even if user not found to prevent user enumeration
      return NextResponse.json({ message: "If your account exists, a password reset link has been sent to your email." }, { status: 200 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "mail.dci.dharmap.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false, // TLS requires secure: false for port 587 usually
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: user.email,
      subject: "Password Reset - Kaizen DCCI",
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e293b;">Reset Your Password</h2>
          <p style="color: #475569;">Hello <b>${user.name}</b>,</p>
          <p style="color: #475569;">We received a request to reset your password for the Kaizen DCCI application. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #475569;">If you did not request a password reset, please ignore this email. This link will expire in 1 hour.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">ITMS - IT Management System DCCI</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "If your account exists, a password reset link has been sent to your email." }, { status: 200 });

  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + (error.message || "") }, { status: 500 });
  }
}
