import admin from './_lib/firebaseAdmin.js';
import { success, error } from './_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);

  try {
    const { userId, amount, projectName, projectId } = req.body;

    if (!userId || !amount) throw new Error("Ledger Entry Failed: Missing mandatory financial parameters.");

    const invoiceRef = await admin.firestore().collection('invoices').add({
      userId,
      projectId: projectId || null,
      projectName: projectName || 'Professional Services',
      amount: Number(amount),
      status: "PENDING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    return success(res, { invoiceId: invoiceRef.id });
  } catch (err) {
    console.error("INVOICE_CREATE_CRASH:", err);
    return error(res, err.message);
  }
}
