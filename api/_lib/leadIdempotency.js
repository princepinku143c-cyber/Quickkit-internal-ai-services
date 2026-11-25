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


/**
 * Atomically creates one webhook lead and project for a tenant-scoped key.
 * The UID is included in the hash so two tenants may safely reuse the same
 * upstream event ID without colliding or receiving one another's document IDs.
 */
export async function getOrCreateWebhookSubmission(db, userId, idempotencyKey, leadData, projectData) {
  if (typeof userId !== "string" || !userId || userId.length > 128 || userId.includes("/")) {
    throw new Error("A valid webhook tenant UID is required.");
  }
  if (typeof idempotencyKey !== "string" || !/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
    throw new Error("A valid webhook idempotency key is required.");
  }
  if (leadData?.userId !== userId || projectData?.userId !== userId) {
    throw new Error("Webhook lead and project ownership must match the tenant UID.");
  }

  const keyId = hashIdempotencyKey(JSON.stringify([userId, idempotencyKey]));
  const keyRef = db.collection("webhook_idempotency").doc(keyId);

  return db.runTransaction(async (tx) => {
    const keySnap = await tx.get(keyRef);
    const now = new Date().toISOString();

    if (keySnap.exists) {
      const existing = keySnap.data() || {};
      if (existing.userId !== userId) {
        throw new Error("Webhook idempotency tenant mismatch.");
      }

      const validDocId = (value) => (
        typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/")
      );
      const leadRef = validDocId(existing.leadId)
        ? db.collection("leads").doc(existing.leadId)
        : db.collection("leads").doc();
      const projectRef = validDocId(existing.projectId)
        ? db.collection("projects").doc(existing.projectId)
        : db.collection("projects").doc();
      const [leadSnap, projectSnap] = await Promise.all([tx.get(leadRef), tx.get(projectRef)]);
      const existingLead = leadSnap.exists ? leadSnap.data() : null;
      const existingProject = projectSnap.exists ? projectSnap.data() : null;

      // A corrupted/stale idempotency mapping must never return another tenant's documents.
      if (existingLead && existingLead.userId !== userId) {
        throw new Error("Webhook idempotency lead tenant mismatch.");
      }
      if (existingProject && existingProject.userId !== userId) {
        throw new Error("Webhook idempotency project tenant mismatch.");
      }

      const lead = existingLead
        ? { ...existingLead, projectId: projectRef.id }
        : { ...leadData, id: leadRef.id, projectId: projectRef.id };
      const project = existingProject
        ? { ...existingProject, leadId: leadRef.id }
        : { ...projectData, leadId: leadRef.id };

      // Repair stale same-tenant links so a valid owner check also preserves link integrity.
      if (!leadSnap.exists || existingLead?.projectId !== projectRef.id) tx.set(leadRef, lead);
      if (!projectSnap.exists || existingProject?.leadId !== leadRef.id) tx.set(projectRef, project);
      tx.set(keyRef, {
        userId,
        leadId: leadRef.id,
        projectId: projectRef.id,
        createdAt: existing.createdAt || now,
        updatedAt: now,
      });

      return {
        leadRef,
        projectRef,
        lead,
        project,
        created: !leadSnap.exists,
        projectCreated: !projectSnap.exists,
      };
    }

    const leadRef = db.collection("leads").doc();
    const projectRef = db.collection("projects").doc();
    const lead = { ...leadData, id: leadRef.id, projectId: projectRef.id };
    const project = { ...projectData, leadId: leadRef.id };

    tx.create(leadRef, lead);
    tx.create(projectRef, project);
    tx.create(keyRef, {
      userId,
      leadId: leadRef.id,
      projectId: projectRef.id,
      createdAt: now,
      updatedAt: now,
    });

    return { leadRef, projectRef, lead, project, created: true, projectCreated: true };
  });
}


/**
 * Atomically persist a system lead and its linked project.
 * When an idempotency key is supplied, retries return the original pair
 * instead of creating duplicate records. Keys are hashed and scoped to the
 * authenticated UID (or the public submission namespace).
 */
export async function createLeadAndProjectAtomically(db, leadData, projectData, idempotencyKey) {
  if (!db || !leadData || !projectData || leadData.userId !== projectData.userId) {
    throw new Error("Lead and project ownership must match.");
  }

  if (idempotencyKey !== undefined && idempotencyKey !== null) {
    if (typeof idempotencyKey !== "string" || !/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
      throw new Error("A valid system lead idempotency key is required.");
    }

    const tenantId = leadData.userId ?? null;
    const keyId = hashIdempotencyKey(JSON.stringify([
      tenantId === null ? "public" : "user",
      tenantId,
      idempotencyKey,
    ]));
    const keyRef = db.collection("system_lead_idempotency").doc(keyId);

    return db.runTransaction(async (tx) => {
      const keySnap = await tx.get(keyRef);
      if (keySnap.exists) {
        const existing = keySnap.data() || {};
        if (existing.userId !== tenantId) {
          throw new Error("System lead idempotency tenant mismatch.");
        }

        const validDocId = (value) => (
          typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/")
        );
        if (!validDocId(existing.leadId) || !validDocId(existing.projectId)) {
          throw new Error("System lead idempotency record is invalid.");
        }

        const leadRef = db.collection("leads").doc(existing.leadId);
        const projectRef = db.collection("projects").doc(existing.projectId);
        const [leadSnap, projectSnap] = await Promise.all([tx.get(leadRef), tx.get(projectRef)]);
        if (!leadSnap.exists || !projectSnap.exists) {
          throw new Error("System lead idempotency record is incomplete.");
        }

        const lead = leadSnap.data() || {};
        const project = projectSnap.data() || {};
        if (lead.userId !== tenantId || project.userId !== tenantId) {
          throw new Error("System lead idempotency document tenant mismatch.");
        }
        if (lead.projectId !== projectRef.id || project.leadId !== leadRef.id) {
          throw new Error("System lead idempotency link mismatch.");
        }

        return { leadRef, projectRef, lead, project, created: false, projectCreated: false };
      }

      const leadRef = db.collection("leads").doc();
      const projectRef = db.collection("projects").doc();
      const lead = { ...leadData, userId: tenantId, id: leadRef.id, projectId: projectRef.id };
      const project = { ...projectData, userId: tenantId, leadId: leadRef.id };
      const createdAt = new Date().toISOString();

      tx.create(leadRef, lead);
      tx.create(projectRef, project);
      tx.create(keyRef, {
        userId: tenantId,
        leadId: leadRef.id,
        projectId: projectRef.id,
        createdAt,
      });

      return { leadRef, projectRef, lead, project, created: true, projectCreated: true };
    });
  }

  const leadRef = db.collection("leads").doc();
  const projectRef = db.collection("projects").doc();
  const lead = { ...leadData, id: leadRef.id, projectId: projectRef.id };
  const project = { ...projectData, leadId: leadRef.id };

  await db.runTransaction(async (tx) => {
    tx.create(leadRef, lead);
    tx.create(projectRef, project);
  });

  return { leadRef, projectRef, lead, project, created: true, projectCreated: true };
}
