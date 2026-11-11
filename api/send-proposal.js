import nodemailer from "nodemailer";
import { success, error } from "./_lib/response.js";
import { isPlainObject } from "./_lib/input.js";
import admin from "./_lib/firebaseAdmin.js";
import { buildProposalEmail } from "../services/proposalEmail.js";

/**
 * Administrative Proposal Transmission Endpoint.
 * Only a verified administrator may send a proposal to a validated recipient.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return error(res, "Method Not Allowed", 405);

  const authHeader = typeof req.headers?.authorization === "string"
    ? req.headers.authorization
    : "";
  let isAdmin = false;

  if (authHeader.startsWith("Bearer ")) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(authHeader.slice(7));
      const userSnap = await admin.firestore().collection("users").doc(decodedToken.uid).get();
      isAdmin = userSnap.data()?.role === "admin";
    } catch {
      // Do not log token-verifier diagnostics or project details.
      console.warn("SEND_PROPOSAL_AUTH_FAILED");
    }
  }

  if (!isAdmin) {
    return error(res, "Forbidden: Admin access required", 403);
  }

  if (!isPlainObject(req.body)) {
    return error(res, "Invalid proposal payload.", 400);
  }

  let proposal;
  try {
    proposal = buildProposalEmail(req.body);
  } catch {
    return error(res, "Invalid proposal payload. Provide a valid recipient, name, price, and up to 20 text features.", 400);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "support@quickkitai.com",
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"QuickKit AI" <${process.env.EMAIL_USER || "support@quickkitai.com"}>` ,
      to: proposal.to,
      subject: "Your Custom AI Blueprint – QuickKit AI",
      html: proposal.html
    });

    return success(res, { status: "PROPOSAL_DISPATCHED", target: proposal.to });
  } catch {
    // Never serialize SMTP exceptions; they may contain transport or credential details.
    console.error("PROPOSAL_DISPATCH_FAILURE");
    return error(res, "Failed to transmit proposal.", 500);
  }
}
