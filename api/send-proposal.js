import nodemailer from "nodemailer";
import { success, error } from "./_lib/response.js";

/**
 * Administrative Proposal Transmission Endpoint.
 * Allows the orchestrator to manually dispatch finalized custom pricing and blueprint features
 * directly to the lead via the primary AI neural channel.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, "Method Not Allowed", 405);

  const { email, name, price, features } = req.body;

  if (!email || !name || !price || !Array.isArray(features)) {
      return error(res, "Incomplete Proposal Payload: Email, name, price, and features array required.", 400);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "support@quickkitai.com",
        pass: process.env.EMAIL_PASS
      }
    });

    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">Your Custom AI System Blueprint</h2>
      
          <p>Hi ${name},</p>
      
          <p>Our architectural team has reviewed your requirements. We’ve designed a custom AI engineering system specifically for your business:</p>
      
          <ul style="background: #f8fafc; padding: 20px 40px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${(Array.isArray(features) ? features : []).map(f => `<li style="margin-bottom: 8px;"><strong>${f}</strong></li>`).join("")}
          </ul>
      
          <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-left: 4px solid #2563eb;">
              <h3 style="margin: 0 0 10px 0;">Estimated Fixed Build Cost: $${price}</h3>
              <p style="margin: 0; font-size: 14px; color: #475569;"><em>This pricing is customized exactly based on your scoped requirements to ensure maximum ROI.</em></p>
          </div>

          <p style="margin-top: 30px;">To begin development and secure your VPS node, please complete the initial $299 engineering advance.</p>
      
          <a href="https://quickkitai.com/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Initialize Build Process</a>
      
          <p style="margin-top: 40px; font-size: 12px; color: #64748b;">
              Best regards,<br/>
              QuickKit AI Architect Team<br/>
              support@quickkitai.com
          </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"QuickKit AI" <${process.env.EMAIL_USER || "support@quickkitai.com"}>`,
      to: email,
      subject: "Your Custom AI Blueprint – QuickKit AI",
      html
    });

    return success(res, { status: "PROPOSAL_DISPATCHED", target: email });

  } catch (err) {
    console.error("PROPOSAL_DISPATCH_FAILURE:", err);
    return error(res, "Failed to transmit proposal to neural link.", 500);
  }
}
