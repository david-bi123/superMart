import nodemailer from "nodemailer";
import { getAppUrl } from "@/lib/app-url";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "noreply@retailflow.com";
const APP_URL = getAppUrl();
const APP_NAME = "RetailFlow";

async function sendMail(to: string, subject: string, html: string) {
  return transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to,
    subject,
    html,
  });
}

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #7c3aed, #6366f1); padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .body { padding: 32px; }
  .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px; }
  .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
  .button:hover { opacity: 0.9; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${APP_NAME}</h1></div>
    <div class="body">${content}</div>
    <div class="footer">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</div>
  </div>
</body>
</html>`;
}

export async function sendReceipt(params: { to: string; receiptNumber: string; businessName: string; grandTotal: number; receiptUrl: string }) {
  const content = `
    <h2>Your Receipt from ${params.businessName}</h2>
    <p>Receipt #: <strong>${params.receiptNumber}</strong></p>
    <p>Total: <strong>$${params.grandTotal.toFixed(2)}</strong></p>
    <p>Thank you for your purchase!</p>
    <div style="text-align:center;margin-top:24px">
      <a href="${params.receiptUrl}" class="button">View Receipt</a>
    </div>
  `;
  return sendMail(params.to, `Receipt #${params.receiptNumber} from ${params.businessName}`, baseTemplate(content));
}

export async function sendPasswordReset(params: { to: string; name: string; resetUrl: string }) {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${params.name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <div style="text-align:center;margin-top:24px">
      <a href="${params.resetUrl}" class="button">Reset Password</a>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  `;
  return sendMail(params.to, "Reset Your Password", baseTemplate(content));
}

export async function sendVerification(params: { to: string; name: string; verifyUrl: string }) {
  const content = `
    <h2>Verify Your Email</h2>
    <p>Hi ${params.name},</p>
    <p>Welcome to ${APP_NAME}! Please verify your email address to get started.</p>
    <div style="text-align:center;margin-top:24px">
      <a href="${params.verifyUrl}" class="button">Verify Email</a>
    </div>
  `;
  return sendMail(params.to, "Verify Your Email", baseTemplate(content));
}

export async function sendNotification(params: { to: string; subject: string; title: string; message: string; actionUrl?: string; actionLabel?: string }) {
  let actionHtml = "";
  if (params.actionUrl && params.actionLabel) {
    actionHtml = `<div style="text-align:center;margin-top:24px"><a href="${params.actionUrl}" class="button">${params.actionLabel}</a></div>`;
  }
  const content = `
    <h2>${params.title}</h2>
    <p>${params.message}</p>
    ${actionHtml}
  `;
  return sendMail(params.to, params.subject, baseTemplate(content));
}

export default {
  sendReceipt,
  sendPasswordReset,
  sendVerification,
  sendNotification,
};
