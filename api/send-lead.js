import admin from '../lib/firebaseAdmin.js';
import { getPayPalAccessToken, BASE_URL } from '../lib/paypalAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { name, email, phone, businessName, requirement, projectName, price } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Fields: Name, Email, and Phone are mandatory." });
    }

    await admin.firestore().collection('leads').add({
      name,
      email,
      phone,
      businessName: businessName || 'Inquiry',
      requirement: requirement || 'AI Automation Request',
      projectName: projectName || 'General Request',
      price: price || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true, message: "Lead captured successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Lead submission failed", details: error.message });
  }
}
