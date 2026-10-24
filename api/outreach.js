import admin from "./_lib/firebaseAdmin.js";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import dns from "dns";

// CORS Headers Configuration
const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
};

const success = (res, data) => res.status(200).json(data);
const error = (res, msg, code = 400) => res.status(code).json({ error: msg });

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action } = req.query;

  try {
    // 1. Telegram webhook check
    if (action === "telegram-webhook") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const secretParam = req.query.secret;
      const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || botToken;
      if (!secretParam || secretParam !== expectedSecret) {
        console.warn("Unauthorized Telegram webhook call attempted.");
        return res.status(403).json({ error: "Unauthorized: Invalid Webhook Secret Signature" });
      }
      return handleTelegramWebhook(req, res);
    }

    // 2. Resolve user authentication
   ¶»§q«^