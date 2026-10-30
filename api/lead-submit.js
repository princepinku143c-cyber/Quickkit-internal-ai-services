import admin from './_lib/firebaseAdmin.js';
import nodemailer from 'nodemailer';
import { checkRateLimit } from './_lib/security.js';
import { getClientIp, isPlainObject, payloadTooLarge, safeNumber, safeText } from './_lib/input.js';

const json = (res, status, body) => res.status(status).json(body);
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const rawData = req.body;
  if (!isPlainObject(rawData)) return json(res, 400, { error: 'Invalid lead payload' });
  if (payloadTooLarge(rawData)) return json(res, 413, { error: 'Lead payload is too large' });
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
    const leadRef = admin.firestore().collection('leads').doc();
    const lead = {
      id: leadRef.id,
      name: String(data.name).trim(),
      phone: String(data.phone).trim(),
      email: String(data.email).trim(),
      businessName: String(data.businessName).trim(),
      businessType: String(data.businessType).trim(),
      plan: String(data.plan).trim(),
      projectName: String(data.projectName || data.plan).trim(),
      requirement: String(data.requirement || '').trim(),
      price: safeNumber(data.price),
      maintenance: safeNumber(data.maintenance),
      aiFinancials: data.aiFinancials || null,
      userId: null, // Public website submissions stay unassigned until authenticated internally.
      source: 'website',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    await leadRef.set(lead);

    const setup = lead.price ? `₹${lead.price.toLocaleString('en-IN')}` : 'Custom quote';
    const maintenance = lead.maintenance ? `₹${lead.maintenance.toLocaleString('en-IN')}/month from month 2` : 'Custom';
    let adminNotified = false;
    let clientConfirmationSent = false;

    // Email is a best-effort notification. A Gmail/SMTP outage must not
    // discard a lead that has already been safely saved to Firestore.
    if (process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: fromEmail, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `QuickKit AI Website <${fromEmail}>`,
          to: adminEmail,
          replyTo: lead.email,
          subject: `🚀 New ${lead.plan} Lead — ${lead.businessName}`,
          html: `<h2>New QuickKit AI Plan Request</h2><p><b>Name:</b> ${esc(lead.name)}</p><p><b>Phone / WhatsApp:</b> ${esc(lead.phone)}</p><p><b>Email:</b> ${esc(lead.email)}</p><p><b>Business:</b> ${esc(lead.businessName)}</p><p><b>Industry:</b> ${esc(lead.businessType)}</p><p><b>Selected Plan:</b> ${esc(lead.plan)}</p><p><b>Setup:</b> ${setup}</p><p><b>Maintenance:</b> ${maintenance}</p><p><b>Requirements:</b><br/>${esc(lead.requirement || 'Not provided')}</p><p><b>Lead ID:</b> ${esc(lead.id)}</p>`
        });
        adminNotified = true;

        await transporter.sendMail({
          from: `QuickKit AI <${fromEmail}>`,
          to: lead.email,
          replyTo: adminEmail,
          subject: `We received your QuickKit AI ${lead.plan} request`,
          html: `<h2>Thanks, ${esc(lead.name)}.</h2><p>We received your request for the <b>${esc(lead.plan)}</b> managed AI system.</p><p>Our team will contact you on <b>${esc(lead.phone)}</b> and email you at this address to discuss the setup.</p><p><b>Setup:</b> ${setup}<br/><b>First month:</b> Managed operation included<br/><b>From month 2:</b> ${maintenance}<br/><b>AI/API usage:</b> billed separately according to actual usage.</p><p>— QuickKit AI<br/>${esc(adminEmail)}</p>`
        });
        clientConfirmationSent = true;
      } catch (emailError) {
        console.error('LEAD_EMAIL_NOTIFICATION_ERROR:', emailError);
      }
    } else {
      console.warn('LEAD_EMAIL_SKIPPED: EMAIL_PASS is not configured.');
    }

    return json(res, 200, { status: 'LEAD_CREATED', leadId: lead.id, adminNotified, clientConfirmationSent });
  } catch (error) {
    console.error('LEAD_SUBMIT_ERROR:', error);
    if (error?.status === 429) return json(res, 429, { error: 'Too many requests. Please wait a minute and try again.' });
    if (error?.status === 503) return json(res, 503, { error: 'Lead intake is temporarily unavailable. Please try again shortly.' });
    return json(res, 500, { error: 'Unable to submit the request right now. Please try again or contact admin@quickkitai.com.' });
  }
}
