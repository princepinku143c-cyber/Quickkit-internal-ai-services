import admin from "./_lib/firebaseAdmin.js";
import { success, error } from "./_lib/response.js";
import { checkRateLimit } from "./_lib/security.js";
import { getClientIp, isPlainObject, safeText } from "./_lib/input.js";
import { createHash } from "node:crypto";
import { callVps, EXECUTION_JOBS, VpsAdapterError, validateExecutionRequest, validateProjectId } from "./_lib/vpsClient.js";
import { askAI } from "./services/aiService.js";

/**
 * Unified AI Intelligence & Execution Cluster.
 * Handles: Kelly Architect, Agent Deployment, and VPS Execution.
 */
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return error(res, "Method Not Allowed", 405);
  }

  if (req.body !== undefined && !isPlainObject(req.body)) {
    return error(res, "Invalid request payload", 400);
  }
  const { action } = req.query;

  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    let decodedToken = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split('Bearer ')[1];
      decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    }

    if (action === 'kelly') return handleKelly(req, res, userId);

    if (!userId) {
      return error(res, "UNAUTHORIZED: Identity Verification Required for Industrial Nodes.", 401);
    }

    if (action === 'deploy') return handleDeploy(req, res, userId);
    if (action === 'execute') return handleExecute(req, res, userId);
    if (action === 'vps-test') return handleVPSTest(req, res, userId);

    return error(res, "Action Not Allowed", 400);
  } catch (err) {
    console.error("AI_CLUSTER_CRASH:", err);
    return error(res, "Identity Verification Failure", 403);
  }
}

async function handleKelly(req, res, userId) {
  const body = req.body || {};
  const rawMessage = body.message;
  if (typeof rawMessage !== "string" || !rawMessage.trim()) {
    return error(res, "Payload missing: a text message is required.", 400);
  }
  if (rawMessage.length > 5000) return error(res, "Message is too long (maximum 5000 characters).", 413);
  const message = safeText(rawMessage, 5000);
  const history = Array.isArray(body.history)
    ? body.history
        .filter((item) => isPlainObject(item) && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
        .slice(-5)
        .map((item) => ({ role: item.role, content: safeText(item.content, 2000) }))
        .filter((item) => item.content)
    : [];

  try {
    const rateKey = userId ? "uid:" + userId : "guest:" + getClientIp(req);
    await checkRateLimit(admin, rateKey, "kelly", userId ? 30 : 5);

    if (userId) {
      const userRef = admin.firestore().collection('users').doc(userId);
      const userSnap = await userRef.get();

      let credits = 0;
      if (!userSnap.exists) {
        credits = 500;
        await userRef.set({ credits, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      } else {
        credits = userSnap.data().credits || 0;
      }

      if (credits < 10) {
        return error(res, "INSUFFICIENT_CREDITS: Neural power depleted. Please upgrade your node.", 403);
      }

      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-10),
        lastUsed: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const messages = [
      ...history,
      { role: 'user', content: message }
    ].slice(-6);

    const reply = await askAI(messages);
    return success(res, { reply });
  } catch (e) {
    console.error("KELLY_ERROR:", e);
    return error(res, e.message, e.status || 500);
  }
}

const EXECUTION_CREDIT_COST = 10;

function executionRequestRef(db, userId, requestId) {
  const userKey = createHash("sha256").update(userId).digest("hex").slice(0, 24);
  return db.collection("vps_execution_jobs").doc(userKey + "_" + requestId);
}

function requestStatusError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function reserveExecution(admin, userId, jobRef, jobId, args, requestId) {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);
  return db.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const jobSnap = await transaction.get(jobRef);
    if (jobSnap.exists) {
      const job = jobSnap.data() || {};
      if (job.userId !== userId || job.jobId !== jobId || JSON.stringify(job.args || {}) !== JSON.stringify(args || {})) {
        throw requestStatusError("Request ID has already been used for a different task or argument set.", 409);
      }
      if (job.status === "SUCCEEDED") return { replay: true, job };
      if (job.status === "RESERVED") throw requestStatusError("This task is already processing. Check task history before retrying.", 409);
      throw requestStatusError("This request already failed. Submit a new request ID to retry.", 409);
    }
    if (!userSnap.exists) throw requestStatusError("User account was not found.", 404);
    const credits = Number(userSnap.data()?.credits) || 0;
    if (credits < EXECUTION_CREDIT_COST) throw requestStatusError("Insufficient credits. This read-only VPS task requires 10 credits.", 402);
    transaction.update(userRef, { credits: credits - EXECUTION_CREDIT_COST });
    transaction.create(jobRef, {
      userId,
      jobId,
      args: args || {},
      requestId,
      status: "RESERVED",
      creditCost: EXECUTION_CREDIT_COST,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { replay: false, creditsRemaining: credits - EXECUTION_CREDIT_COST };
  });
}

async function refundExecution(admin, userId, jobRef, reason) {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);
  await db.runTransaction(async (transaction) => {
    const jobSnap = await transaction.get(jobRef);
    const userSnap = await transaction.get(userRef);
    if (!jobSnap.exists || jobSnap.data()?.status !== "RESERVED" || !userSnap.exists) return;
    const currentCredits = Number(userSnap.data()?.credits) || 0;
    const refund = Number(jobSnap.data()?.creditCost) || EXECUTION_CREDIT_COST;
    transaction.update(userRef, { credits: currentCredits + refund });
    transaction.update(jobRef, {
      status: "FAILED_REFUNDED",
      error: safeText(reason, 250),
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}

async function handleExecute(req, res, userId) {
  const input = validateExecutionRequest(req.body);
  if (!input.ok) return error(res, input.error, 400);
  try {
    await checkRateLimit(admin, "uid:" + userId, "vps-execute", 8);
    const jobRef = executionRequestRef(admin.firestore(), userId, input.requestId);
    const reservation = await reserveExecution(admin, userId, jobRef, input.jobId, input.args, input.requestId);
    if (reservation.replay) {
      return success(res, {
        status: "SUCCEEDED",
        jobId: reservation.job.jobId,
        label: EXECUTION_JOBS[input.jobId].label,
        output: reservation.job.output || "",
        requestId: input.requestId,
        replayed: true
      });
    }

    let result;
    try {
      result = await callVps("/v1/jobs/execute", {
        method: "POST",
        requestId: input.requestId,
        body: { jobId: input.jobId, args: input.args, requestId: input.requestId },
        timeoutMs: 8000
      });
      if (result.status !== "SUCCEEDED" || result.requestId !== input.requestId || result.jobId !== input.jobId) {
        throw new VpsAdapterError("VPS worker did not confirm the requested task. No success was recorded.", 502);
      }
      const output = safeText(result.output, 12000);
      await jobRef.set({
        status: "SUCCEEDED",
        label: EXECUTION_JOBS[input.jobId].label,
        output,
        exitCode: Number.isInteger(result.exitCode) ? result.exitCode : 0,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return success(res, {
        status: "SUCCEEDED",
        jobId: input.jobId,
        label: EXECUTION_JOBS[input.jobId].label,
        output,
        requestId: input.requestId,
        creditCost: EXECUTION_CREDIT_COST,
        creditsRemaining: reservation.creditsRemaining
      });
    } catch (taskError) {
      try {
        await refundExecution(admin, userId, jobRef, taskError.message);
      } catch (refundError) {
        console.error("VPS_EXECUTION_REFUND_RECONCILIATION_REQUIRED", {
          requestId: input.requestId,
          error: safeText(refundError?.message, 200)
        });
        return error(res, "Task outcome could not be confirmed and credit reconciliation failed. Save request ID " + input.requestId + " for support.", 503);
      }
      throw taskError;
    }
  } catch (err) {
    const status = Number.isInteger(err?.status) ? err.status : 503;
    if (status >= 500) console.error("VPS_EXECUTION_FAILED", { requestId: input.requestId, message: safeText(err?.message, 250) });
    return error(res, safeText(err?.message, 300) || "VPS execution failed.", status);
  }
}

async function handleVPSTest(_req, res, userId) {
  try {
    await checkRateLimit(admin, "uid:" + userId, "vps-health", 5);
    const health = await callVps("/v1/health", { method: "GET", timeoutMs: 5000 });
    if (health.status !== "CONNECTED") throw new VpsAdapterError("VPS worker did not confirm connectivity.", 502);
    return success(res, { status: "CONNECTED", version: safeText(health.version, 40), capabilities: Array.isArray(health.capabilities) ? health.capabilities.map((item) => safeText(item, 60)).slice(0, 10) : [] });
  } catch (err) {
    const status = Number.isInteger(err?.status) ? err.status : 503;
    return error(res, safeText(err?.message, 300) || "VPS connectivity could not be verified.", status);
  }
}

function deploymentRequestRef(db, userId, requestId) {
  const userKey = createHash("sha256").update(userId).digest("hex").slice(0, 24);
  return db.collection("vps_deployment_jobs").doc(userKey + "_" + requestId);
}

async function reserveDeployment(admin, userId, projectId, requestId, jobRef) {
  const db = admin.firestore();
  return db.runTransaction(async (transaction) => {
    const jobSnap = await transaction.get(jobRef);
    if (jobSnap.exists) {
      const job = jobSnap.data() || {};
      if (job.userId !== userId || job.projectId !== projectId) {
        throw requestStatusError("Request ID has already been used for a different deployment.", 409);
      }
      if (job.status === "SUCCEEDED") return { replay: true, job };
      if (job.status === "PENDING") throw requestStatusError("This deployment request is already processing. Check deployment history before retrying.", 409);
      throw requestStatusError("This deployment request already failed. Use a new request ID only after reviewing the worker logs.", 409);
    }
    transaction.create(jobRef, {
      userId,
      projectId,
      requestId,
      status: "PENDING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { replay: false };
  });
}

async function handleDeploy(req, res, userId) {
  if (Object.keys(req.body || {}).some((key) => !["projectId", "requestId"].includes(key))) {
    return error(res, "Unexpected deployment payload fields.", 400);
  }
  const projectId = validateProjectId(req.body?.projectId);
  if (!projectId) return error(res, "A valid projectId is required.", 400);
  const requestId = safeText(req.body?.requestId, 64);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return error(res, "A valid requestId is required for deployment idempotency.", 400);
  }

  let jobRef;
  try {
    await checkRateLimit(admin, "uid:" + userId, "vps-deploy", 3);
    const db = admin.firestore();
    const projectSnap = await db.collection("projects").doc(projectId).get();
    if (!projectSnap.exists || projectSnap.data()?.userId !== userId) {
      return error(res, "Project not found or you do not have permission to deploy it.", 404);
    }
    jobRef = deploymentRequestRef(db, userId, requestId);
    const reservation = await reserveDeployment(admin, userId, projectId, requestId, jobRef);
    if (reservation.replay) {
      return success(res, {
        status: "SUCCEEDED",
        projectId,
        url: safeText(reservation.job.url, 2048),
        deploymentId: safeText(reservation.job.deploymentId, 128),
        requestId,
        replayed: true
      });
    }

    try {
      const deployment = await callVps("/v1/deploy", {
        method: "POST",
        requestId,
        body: { projectId, userId, requestId },
        timeoutMs: 15000
      });
      if (deployment.status !== "SUCCEEDED" || typeof deployment.url !== "string" || deployment.requestId !== requestId) {
        throw new VpsAdapterError("Deployment runner did not confirm a successful deployment.", 502);
      }
      const result = {
        status: "SUCCEEDED",
        projectId,
        url: safeText(deployment.url, 2048),
        deploymentId: safeText(deployment.deploymentId, 128),
        requestId
      };
      await jobRef.set({
        status: "SUCCEEDED",
        url: result.url,
        deploymentId: result.deploymentId,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return success(res, result);
    } catch (deploymentError) {
      try {
        await jobRef.set({
          status: "FAILED",
          error: safeText(deploymentError?.message, 250) || "Deployment result was not confirmed.",
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (auditError) {
        console.error("VPS_DEPLOYMENT_AUDIT_RECONCILIATION_REQUIRED", {
          requestId,
          error: safeText(auditError?.message, 200)
        });
      }
      throw deploymentError;
    }
  } catch (err) {
    const status = Number.isInteger(err?.status) ? err.status : 503;
    if (status >= 500) console.error("VPS_DEPLOYMENT_FAILED", { requestId, projectId, message: safeText(err?.message, 250) });
    return error(res, safeText(err?.message, 300) || "Deployment could not be confirmed.", status);
  }
}
