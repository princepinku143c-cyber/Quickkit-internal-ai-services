import { createHash } from 'node:crypto';
import admin from './_lib/firebaseAdmin.js';
import nodemailer from 'nodemailer';
import { checkRateLimit } from './_lib/security.js';
import { getClientIp, isPlainObject, payloadTooLarge, safeNumber, safeText } from './_lib/input.js';

const json = (res, status, body) => res.status(status).json(body);
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const hashKey = (key) => createHash('sha256').update(key).digest('hex');

async function getOrCreateLead(db, idempotencyKey, leadData) {
  const keyRef = db.collection('lead_idempotency').doc(hashKey(idempotencyKey));
  return db.runTransaction(async (tx) => {
    const keySnap = await tx.get(keyRef);
    if (keySnap.exists) {
      const existingRef = db.collection('leads').doc(keySnap.data().leadId);
      const existingSnap = await tx.get(existingRef);
      if (existingSnap.exists) return { ref: existingRef, lead: existingSnap.data(), created: false };
      // Repair an orphaned idempotency record rather than returning a false success.
      const newRef = db.collection('leads').doc();
      const lead = { ...leadData, id: newRef.id };
      tx.set(newRef, lead);
      tx.set(keyRef, { leadId: newRef.id, createdAt: new Date().toISOString() });
      return { ref: newRef, lead, created: true };
    }
    const leadRef = db.collection('leads').doc();
    const lead = { ...leadData, id: leadRef.id };
    tx.create(leadRef, lead);
    tx.create(keyRef, { leadId: leadRef.id, createdAt: new Date().toISOString() });
    return { ref: leadRef, lead, created: true };
  });
}

async function claimNotification(db, leadRef, channel) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(leadRef);
    if (!snap.exists) return false;
    const lead = snap.data();
    const state = lead.emailNotifications?.[channel] || {};
    const now = Date.now();
    if (state.status === 'sent') return false;
    if (state.status === 'sending' && Number(state.leaseUntil) > now) return false;
    tx.update(leadRef, {
      [`emailNotifications.${channel}`]: { status: 'sending', leaseUntil: now + 120000 }
    });
    return true;
  });
}

async function deliverNotification(db, leadRef, channel, transporter, message) {
  const claimed = await claimNotification(db, leadRef, channel);
  if (!claimed) return;
  try {
    await transporter.sendMail(message);
    await leadRef.update({
      [`emailNotifications.${channel}`]: { status: 'sent', sentAt: new Date().toISOString() }
    });
  } catch (error) {
    console.error(`LEAD_EMAIL_${channel.toUpperCase()}_ERROR:`, error?.message || error);
    await leadRef.update({
      [`emailNotifications.${channel}`]: { status: 'pending', lastError: String(error?.message || 'Email delivery failed').slice(0, 240), updatedAt: new Date().toISOString() }
    });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const rawData = req.body;
  if (!isPlainObject(rawData)) return json(res, 400, { error: 'Invalid lead payload' });
  if (payloadTooLarge(rawData)) return json(res, 413, { error: 'Lead payload is too large' });
  const idempotencyKey = safeText(rawData.idempotencyKey, 128);
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
    return json(res, 400, { error: 'A valid submission idempotency key is required. Please refresh the form and try again.' });
  }

  const data = {
    name: safeText(rawData.name, 120),
    phone: safeText(rawData.phone, 48),
    email: safeText(rawData.email, 254),
    businessName: safeText(rawData.businessName, 160),
    businessType: safeText(rawData.businessType, 100),
    plan: safeText(rawData.plan, 100),
    projectName: safeText(rawData.projectName || rawData.plan, 180),
    requirement: safeText(rawData.requirement, 3000),
    price: safeNumber(rawData.price),
    maintenance: safeNumber(rawData.maintenance),
    aiFinancials: isPlainObject(rawData.aiFinancials) ? rawData.aiFinancials : null,
  };
  const required = ['name', 'phone', 'email', 'businessName', 'businessType', 'plan'];
  const missing = required.filter(k => !data[k]);
  if (missing.length) return json(res, 400, { error: 'Missing required fields: ' + missing.join(', ') });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json(res, 400, { error: 'Please provide a valid email address' });

  const adminEmail = process.env.LEAD_NOTIFY_EMAIL || process.env.EMAIL_USER || 'admin@quickkitai.com';
  const fromEmail = process.env.EMAIL_USER || adminEmail;

  try {
    await checkRateLimit(admin, getClientIp(req), 'lead-submit', 5);
    const db = admin.firestore();
    const leadResult = await getOrCreateLead(db, idempotencyKey, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      businessName: data.businessName,
      businessType: data.businessType,
      plan: data.plan,
      projectName: data.projectName,
      requirement: data.requirement,
      price: data.price,
      maintenance: data.maintenance,
      aiFinancials: data.aiFinancials,
      userId: null,
      source: 'website',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    });
    const { ref: leadRef, lead, created } = leadResult;

    let emailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    if (emailConfigured) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: fromEmail, pass: process.env.EMAIL_PASS },
      });
      const setup = lead.price ? `₹${lead.price.toLocaleString('en-IN')}` : 'Custom quote';
      const maintenance = lead.maintenance ? `₹${lead.maintenance.toLocaleString('en-IN')}/month from month 2` : 'Custom';

      await deliverNotification(db, leadRef, 'admin', transporter, {
        from: `QuickKit AI Website <${fromEmail}>`,
        to: adminEmail,
        replyTo: lead.email,
        subject: `🚀 New ${lead.plan} Lead — ${lead.businessName}`,
        html: `<h2>New QuickKit AI Plan Request</h2><p><b>Name:</b> ${esc(lead.name)}</p><p><b>Phone / WhatsApp:</b> ${esc(lead.phone)}</p><p><b>Email:</b> ${esc(lead.email)}</p><p><b>Business:</b> ${esc(lead.businessName)}</p><p><b>Industry:</b> ${esc(lead.businessType)}</p><p><b>Selected Plan:</b> ${esc(lead.plan)}</p><p><b>Setup:</b> ${setup}</p><p><b>Maintenance:</b> ${maintenance}</p><p><b>Requirements:</b><br/>${esc(lead.requirement || 'Not provided')}</p><p><b>Lead ID:</b> ${esc(lead.id)}</p>`
      });
      await deliverNotification(db, leadRef, 'customer', transporter, {
        from: `QuickKit AI <${fromEmail}>`,
        to: lead.email,
        replyTo: adminEmail,
        subject: `We received your QuickKit AI ${lead.plan} request`,
        html: `<h2>Thanks, ${esc(lead.name)}.</h2><p>We received your request for the <b>${esc(lead.plan)}</b> managed AI system.</p><p>Our team will contact you on <b>${esc(lead.phone)}</b> and email you at this address to discuss the setup.</p><p><b>Setup:</b> ${setup}<br/><b>First month:</b> Managed operation included<br/><b>From month 2:</b> ${maintenance}<br/><b>AI/API usage:</b> billed separately according to actual usage.</p><p>— QuickKit AI<br/>${esc(adminEmail)}</p>`
      });
    }

    const latest = (await leadRef.get()).data() || {};
    const adminNotified = latest.emailNotifications?.admin?.status === 'sent';
    const clientConfirmationSent = latest.emailNotifications?.customer?.status === 'sent';
    const notificationsPending = !adminNotified || !clientConfirmationSent;
    return json(res, 200, {
      status: created ? 'LEAD_CREATED' : 'LEAD_ALREADY_RECEIVED',
      leadId: lead.id,
      adminNotified,
      clientConfirmationSent,
      notificationsPending,
      message: notificationsPending
        ? 'Your request is safely recorded. Email notifications are pending and can be retried with the same submission key.'
        : 'Your request is safely recorded and confirmation emails were sent.',
    });
  } catch (error) {
    console.error('LEAD_SUBMIT_ERROR:', error);
    if (error?.status === 429) return json(res, 429, { error: 'Too many requests. Please wait a minute and try again.' });
    if (error?.status === 503) return json(res, 503, { error: 'Lead intake is temporarily unavailable. Please try again shortly.' });
    return json(res, 500, { error: 'Unable to submit the request right now. Please try again or contact admin@quickkitai.com.' });
  }
}
