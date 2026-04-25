import admin from '../_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;
    const { projectId, payload } = req.body;

    if (!projectId) return res.status(400).json({ message: 'Missing projectId' });

    await admin.firestore().collection('trigger_queue').add({
      projectId,
      userId,
      payload,
      status: 'PENDING',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ status: 'queued', message: 'Workflow sent to execution engine' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
