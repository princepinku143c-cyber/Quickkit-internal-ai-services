import nodemailer from "nodemailer";
import { success, error } from './_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);

  const { email, name, subject, text } = req.body;

  if (!email || !text) return error(res, "Mandatory transmission parameters missing.", 400);

  // Production Enforce: Fail if no credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("🚨 CRITICAL: EMAIL_SYSTEM_OFFLINE. Environment variables missing.");
      return error(res, "Notification engine configuration error. Please contact system admin.", 500);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"QuickKit AI OS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || "QuickKit Project Update",
      text: text,
      html: `
        <div style="font-family: sans-serif; padding: 30px; color: #1e293b; background-color: #f8fafc; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.05em;">QUICKKIT AI OS</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em;">Neural Transmission Node</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <p style="font-size: 16px; font-weight: 500; line-height: 1.6;">Hi ${name || 'Operator'},</p>
                <p style="font-size: 16px; line-height: 1.6;">${text}</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                    <p style="font-size: 12px; color: #94a3b8; font-weight: 600;">STATUS: System Verified</p>
                </div>
            </div>
            <p style="text-align: center; margin-top: 30px; font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">© 2026 QuickKit AI Intelligence • Enterprise Scaffolding</p>
        </div>
      `
    });

    return success(res, "Neural transmission successfully delivered.");
  } catch (err) {
    console.error("EMAIL_FAILURE:", err);
    return error(res, "Neural link to mail server rejected transmission.");
  }
}
