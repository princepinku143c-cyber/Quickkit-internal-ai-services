import admin from "./_lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { userId, projectId, vpsEndpoint, vpsToken, agentConfig } = req.body;

  if (!userId || !projectId || !vpsEndpoint) {
    return res.status(400).json({ message: "Missing required deployment parameters." });
  }

  try {
    const db = admin.firestore();
    const projectRef = db.collection("projects").doc(projectId);

    // 1. Initialise Deployment State
    console.log(`🚀 [DEPLOY_ORCHESTRATOR] Initialising deployment for Project: ${projectId}`);
    await projectRef.set({
      userId,
      status: "DEPLOYING",
      logs: admin.firestore.FieldValue.arrayUnion({
          time: new Date().toISOString(),
          msg: "Initializing neural cluster allocation..."
      }),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 2. Trigger VPS Automation (Paperclip Protocol)
    const vpsResponse = await fetch(`${vpsEndpoint}/deploy-agent`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${vpsToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectId,
        userId,
        config: agentConfig || { type: "autonomous-operator" }
      })
    });

    if (!vpsResponse.ok) {
       const errorText = await vpsResponse.text();
       throw new Error(`VPS Cluster Rejected Deployment: ${errorText}`);
    }

    const vpsData = await vpsResponse.json();

    // 3. Commit Terminal State
    console.log(`✅ [DEPLOY_SUCCESS] Project ${projectId} is now LIVE at ${vpsData.url}`);
    await projectRef.update({
      status: "LIVE",
      deploymentUrl: vpsData.url,
      logs: admin.firestore.FieldValue.arrayUnion({
          time: new Date().toISOString(),
          msg: "Neural link established. Agent is LIVE."
      }),
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ 
        success: true, 
        url: vpsData.url,
        message: "Deployment Cycle Complete."
    });

  } catch (err) {
    console.error("🚨 [DEPLOY_FAILURE]:", err.message);
    
    // Update project state to FAILED
    if (projectId) {
      await admin.firestore().collection("projects").doc(projectId).update({
        status: "FAILED",
        lastError: err.message,
        updatedAt: new Date().toISOString()
      }).catch(e => console.error("Could not update failure state:", e));
    }

    return res.status(500).json({ 
        message: "Deployment Orchestration Failed",
        details: err.message 
    });
  }
}
