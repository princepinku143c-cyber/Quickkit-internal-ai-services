
import admin from './_lib/firebaseAdmin.js';
import nodemailer from 'nodemailer';
import { askAI } from './_lib/services/aiService.js';
import { checkRateLimit } from './_lib/security.js';
import { escapeHtml, getClientIp, isPlainObject, normalizeCreditPackage, payloadTooLarge, safeMetadata, safeNumber, safeText } from './_lib/input.js';
import { getPublicSystemError } from './_lib/systemErrors.js';
import { getSystemActionMethods } from './_lib/systemActionMethods.js';
import { generatePaymentToken, verifyAndConsumePaymentToken } from './_lib/paymentToken.js';


const success = (res, data) => res.status(200).json(data);
const error = (res, msg, code = 400) => res.status(code).json({ error: msg });

export default async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    const authHeader = req.headers.authorization;

    let userId = null;
    let userData = null;
    let authContext = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(to¶»§q«^