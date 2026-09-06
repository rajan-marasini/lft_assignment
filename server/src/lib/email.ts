import nodemailer from "nodemailer";

import logger from "@/lib/logger";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth:
    smtpUser && smtpPassword
      ? {
          user: smtpUser,
          pass: smtpPassword,
        }
      : undefined,
});

export async function sendVerificationEmail(
  toEmail: string,
  name: string,
  token: string,
): Promise<boolean> {
  const verificationUrl = `${clientUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your Email - Event Planner</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 1px solid #eaeaea; padding-bottom: 20px; }
          .header h1 { color: #4f46e5; margin: 0; font-size: 24px; }
          .content { padding: 30px 0; line-height: 1.6; }
          .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; margin-top: 20px; text-align: center; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px; }
          .link-fallback { word-break: break-all; font-size: 13px; color: #6b7280; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Planner</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for signing up for Event Planner! Please verify your email address to complete your account registration and start managing events.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
            </div>
            <div class="link-fallback">
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Event Planner Application. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const fromAddress =
      process.env.SMTP_FROM ||
      (smtpUser
        ? `"Event Planner" <${smtpUser}>`
        : `"Event Planner" <noreply@eventplanner.com>`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: "Verify Your Email Address - Event Planner",
      html: htmlContent,
    });

    logger.info(`Verification email sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send verification email to ${toEmail}:`, error);
    // Don't crash process if email sending fails, but return false so controller can handle appropriately
    return false;
  }
}
