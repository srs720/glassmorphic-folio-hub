// Server-only helpers for the CV request / OTP flow.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getEmailSettings() {
  const { data, error } = await supabaseAdmin
    .from("email_settings")
    .select("sender_email, app_password")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.sender_email || !data?.app_password) {
    throw new Error("Email settings are not configured yet.");
  }
  return data;
}

function otpEmailHtml(name: string, otp: string) {
  return `
  <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif;background:#F9F8F6;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #e7e5e4">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#14304D">Shoibur Rahman</p>
      <h1 style="margin:0 0 16px;font-size:22px;color:#0F172A">Your CV access code</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155">
        Hi ${escapeHtml(name)}, use the code below to confirm your CV access request. It expires in 10 minutes.
      </p>
      <div style="font-size:34px;letter-spacing:12px;font-weight:700;color:#14304D;background:#F1F5F9;border-radius:14px;padding:18px;text-align:center">
        ${otp}
      </div>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748B">
        After confirming the code, your request is reviewed manually. You will be able to open the CV once it is approved.
      </p>
    </div>
  </div>`;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  const settings = await getEmailSettings();
  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: settings.sender_email, pass: settings.app_password },
  });
  await transporter.sendMail({
    from: `"Shoibur Rahman" <${settings.sender_email}>`,
    to,
    subject: `Your CV access code: ${otp}`,
    text: `Hi ${name}, your CV access code is ${otp}. It expires in 10 minutes.`,
    html: otpEmailHtml(name, otp),
  });
}
