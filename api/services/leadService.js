import admin from '../_lib/firebaseAdmin.js';

/**
 * Hardened Lead Transmission Service.
 * Ensures data integrity and prevents spam-leakage through strict sanitization.
 */
export const saveLead = async (body) => {
  const { name, email, phone, businessName, requirement, projectName, price } = body;

  // 1. Mandatory Schema Scrutiny (Anti-Spam)
  if (!name || name.length < 2) throw new Error("Operator identity required.");
  if (!email || !email.includes('@')) throw new Error("Invalid neural communication channel (email).");
  if (!phone || phone.length < 8) throw new Error("Operator contact verification failed.");

  // 2. Length Constraints
  if (name.length > 100 || email.length > 100 || (businessName?.length || 0) > 100) {
      throw new Error("Enrollment payload exceeds safety constraints.");
  }
  
  // 3. Deterministic Field Mapping
  const leadPayload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    businessName: (businessName || 'Elite Enterprise').trim(),
    requirement: (requirement || 'Full Intelligence Build').trim(),
    projectName: (projectName || 'Neural Project').trim(),
    price: Number(price) || 0,
    status: "NEW", // Deterministic State
    source: 'QuickKit-Platform-V2',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await admin.firestore().collection("leads").add(leadPayload);
  return { id: docRef.id };
};
