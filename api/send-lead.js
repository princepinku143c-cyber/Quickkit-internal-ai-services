import admin from '../lib/firebaseAdmin.js';
import { getPayPalAccessToken, BASE_URL } from '../lib/paypalAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  console.log("🚀 [LEAD_CAPTURE] Incoming Payload:", req.body);

  const { name, email, phone, businessName, requirement, projectName, price } = req.body;

  // 1. ENVIRONMENT AUDIT
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("🚨 [CONFIG_ERROR] Firebase Environment Variables Missing on Vercel!");
    return res.status(500).json({ message: "Infrastructure mismatch. Backend config incomplete." });
  }

  // 2. VALIDATION
  if (!name || !email || !phone) {
    console.warn("⚠️ [VALIDATION_FAIL] Missing required fields:", { name, email, phone });
    return res.status(400).json({ message: "Verification failed: Contact fields are mandatory." });
  }

  try {
    // 3. STORAGE
    const result = await admin.firestore().collection('leads').add({
      name,
      email,
      phone,
      businessName: businessName || 'Custom Build',
      requirement: requirement || 'AI Scoping',
      projectName: projectName || 'General Request',
      price: price || 0,
      status: 'NEW',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'QuickKit-Market-Shell'
    });

    console.log("✅ [SUCCESS] Lead stored with ID:", result.id);

    return res.status(200).json({ 
      success: true, 
      message: "✅ Transmission Successful. Lead indexed." 
    });

  } catch (error) {
    console.error("🔥 [CRASH] Lead submission failed FULL:", error);
    return res.status(500).json({ 
      message: "Internal Cluster Error.",
      details: error.message 
    });
  }
}
