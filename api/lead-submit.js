import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const json = (res, status, body) => res.status(status).json(body);
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const data = req.body || {};
  const required = ['name', 'phone', 'email', 'businessName', 'businessType', 'plan'];
  const missing = required.filter(k => !String(data[k] || '').trim());
  if (missing.length) return json(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });

  const adminEmail = process.env.LEAD_NOTIFY_EMAIL || process.env.EMAIL_USER || 'admin@quickkitai.com';
  const fromEmail = process.env.EMAIL_USER || adminEmail;

  try {
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
      price: Number(data.price || 0),
      maintenance: Number(data.maintenance || 0),
      aiFinancials: data.aiFinancials || null,
      userId: data.userId || null,
      source: data.source || 'website',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    await leadRef.set(lead);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: fromEmail, pass: process.env.EMAIL_PASS },
    });

    const setup = lead.price ? `₹${lead.price.toLocaleString('en-IN')}` : 'Custom quote';
    const maintenance = lead.maintenance ? `₹${lead.maintenance.toLocaleString('en-IN')}/month from month 2` : 'Custom';

    await transporter.sendMail({
      from: `QuickKit AI Website <${fromEmail}>`,
      to: adminEmail,
      replyTo: lead.email,
      subject: `🚀 New ${lead.plan} Lead — ${lead.businessName}`,
      html: `<h2>New QuickKit AI Plan Request</h2><p><b>Name:</b> ${esc(lead.name)}</p><p><b>Phone / WhatsApp:</b> ${esc(lead.phone)}</p><p><b>Email:</b> ${esc(lead.email)}</p><p><b>Business:</b> ${esc(lead.businessName)}</p><p><b>Industry:</b> ${esc(lead.businessType)}</p><p><b>Selected Plan:</b> ${esc(lead.plan)}</p><p><b>Setup:</b> ${setup}</p><p><b>Maintenance:</b> ${maintenance}</p><p><b>Requirements:</b><br/>${esc(lead.requirement || 'Not provided')}</p><p><b>Lead ID:</b> ${esc(lead.id)}</p>`
    });

    await transporter.sendMail({
      from: `QuickKit AI <${fromEmail}>`,
      to: lead.email,
      replyTo: adminEmail,
      subject: `We received your QuickKit AI ${lead.plan} request`,
      html: `<h2>Thanks, ${esc(lead.name)}.</h2><p>We received your request for the <b>${esc(lead.plan)}</b> managed AI system.</p><p>Our team will contact you on <b>${esc(lead.phone)}</b> and email you at this address to discuss the setup.</p><p><b>Setup:</b> ${setup}<br/><b>First month:</b> Managed operation included<br/><b>From month 2:</b> ${maintenance}<br/><b>AI/API usage:</b> billed separately according to actual usage.</p><p>— QuickKit AI<br/>${esc(adminEmail)}</p>`
    });

    return json(res, 200, { status: 'LEAD_CREATED', leadId: lead.id, adminNotified: true, clientConfirmationSent: true });
  } catch (error) {
    console.error('LEAD_SUBMIT_ERROR:', error);
    return json(res, 500, { error: 'Unable to submit the request right now. Please try again or contact admin@quickkitai.com.' });
  }
}
