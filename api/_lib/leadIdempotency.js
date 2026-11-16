import { createHash } from "node:crypto";

export function hashIdempotencyKey(key) {
  return createHash("sha256").update(key).digest("hex");
}

export async function getOrCreateLead(db, idempotencyKey, leadData) {
  const keyRef = db.collection("lead_idempotency").doc(hashIdempotencyKey(idempotencyKey));
  return db.runTransaction(async (tx) => {
    const keySnap = await tx.get(keyRef);
    if (keySnap.exists) {
      const existingRef = db.collection("leads").doc(keySnap.data().leadId);
      const existingSnap = await tx.get(existingRef);
      if (existingSnap.exists) {
        return { ref: existingRef, lead: existingSnap.data(), created: false };
      }

      // Repair an orphaned idempotency record instead of returning false success.
      const newRef = db.collection("leads").doc();
      const lead = { ...leadData, id: newRef.id };
      tx.set(newRef, lead);
      tx.set(keyRef, { leadId: newRef.id, createdAt: new Date().toISOString() });
      return { ref: newRef, lead, created: true };
    }

    const leadRef = db.collection("leads").doc();
    const lead = { ...leadData, id: leadRef.id };
    tx.create(leadRef, lead);
    tx.create(keyRef, { leadId: leadRef.id, createdAt: new Date().toISOString() });
    return { ref: leadRef, lead, created: true };
  });
}
