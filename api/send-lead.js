
import admin from '../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { name, email, phone, businessName, requirement, projectName, price } = req.body;

  // 🚨 VALIDATION: Ensure critical fields are present
  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Operator verification failed: Missing required contact fields." });
  }

  try {
    // 1. Transactional Save to CRM (Firebase)
    await admin.firestore().collection('leads').add({
      name,
      email,
      phone,
      businessName: businessName || 'Generic Operation',
      requirement: requirement || 'Standard Global Deployment',
      projectName,
      price: price || 0,
      status: 'NEW',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'Internal-Agent-Studio'
    });

    res.status(200).json({ 
      success: true, 
      message: "✅ Deployment Blueprint Received. Our lead architect will contact you within 24 hours." 
    });

  } catch (error) {
    console.error("Lead submission error:", error);
    res.status(500).json({ message: "Internal server error. Transmission failed." });
  }
}
