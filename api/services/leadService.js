import admin from '../_lib/firebaseAdmin.js';

export const saveLead = async (body) => {
  // Security Guards
  if (body.name?.length > 100 || body.email?.length > 100 || body.businessName?.length > 100) {
      throw new Error("Enrollment payload exceeds safety constraints.");
  }
  
  if (!body.phone || body.phone.length < 8) throw new Error("Operator contact verification failed: Invalid phone number.");

  const { name, email, phone, businessName, requirement, projectName, price } = body;

  if (!name || !email || !phone) throw new Error("Verification failed: Mandatory contact fields missing.");

  await admin.firestore().collection("leads").add({
    name,
    email,
    phone,
    businessName: businessName || 'Custom Build',
    requirement: requirement || 'AI Scoping',
    projectName: projectName || 'General Request',
    price: price || 0,
    status: "NEW",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: 'QuickKit-Market-Shell'
  });

  return true;
};
