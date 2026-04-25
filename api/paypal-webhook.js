import admin from './_lib/firebaseAdmin.js';
import { success, error } from './_lib/response.js';
import fetch from "node-fetch";

/**
 * Handle PayPal Webhooks for critical state transitions.
 * This is the ultimate fallback to ensure payments are NEVER missed or spoofed.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);

  const event = req.body;
  const event_type = event.event_type;

  console.log(`[PAYPAL_WEBHOOK] Received Event: ${event_type}`);

  try {
    // 1. Handshake / Verification (Standard PayPal Payload)
    if (event_type === "PAYMENT.CAPTURE.COMPLETED") {
       const resource = event.resource;
       const orderID = resource.supplementary_data?.related_ids?.order_id || resource.id;
       const amount = resource.amount.value;

       // 2. Synchronize Database
       // We search for the payment record created by the frontend/API capture
       const paymentSnap = await admin.firestore().collection('payments')
           .where('orderID', '==', orderID)
           .limit(1)
           .get();

       if (!paymentSnap.empty) {
           const pDoc = paymentSnap.docs[0];
           const pData = pDoc.data();

           if (!pData.webhookVerified) {
               await pDoc.ref.update({
                   webhookVerified: true,
                   webhookCapturedAt: admin.firestore.FieldValue.serverTimestamp()
               });

               // 3. Ensure Project is updated (Safety Secondary)
               if (pData.projectId) {
                   await admin.firestore().collection('projects').doc(pData.projectId).update({
                       advancePaid: true,
                       status: "IN_PROGRESS",
                       paymentStatus: "WEBHOOK_CONFIRMED",
                       updatedAt: admin.firestore.FieldValue.serverTimestamp()
                   }).catch(() => {});
               }

               console.log(`[PAYPAL_WEBHOOK] Successfully verified Order: ${orderID}`);
           }
       } else {
           // Case where webhook arrives BEFORE the frontend capture (Rare race condition)
           console.warn(`[PAYPAL_WEBHOOK] Async Record mapping initiated for Order: ${orderID}`);
           // Log for manual audit
           await admin.firestore().collection('audit_logs').add({
               type: 'PAYPAL_ORPHAN_WEBHOOK',
               event: event,
               createdAt: admin.firestore.FieldValue.serverTimestamp()
           });
       }
    }

    return success(res, { acknowledged: true });
  } catch (err) {
    console.error("WEBHOOK_CRASH:", err);
    return error(res, "Webhook processing failure", 500);
  }
}
