
import admin from '../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { name, email, phone, businessName, requirement, projectName, price } = req.body;

  try {
    // 1. Save to CRM (Firebase)
    await admin.firestore().collection('leads').add({
      name,
      email,
      phone,
      businessName,
      requirement,
      projectName,
      price,
      status: 'NEW',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'Agent-Deployment-Form'
    });

    // 2. Here you would normally send an email via Nodemailer/SendGrid
    // console.log("New Lead Received:", { name, email, projectName });

    res.status(200).json({ success: true, message: "Request received! Our team will contact you within 24 hours." });

  } catch (error) {
    console.error("Lead submission error:", error);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
}
