import admin from './_lib/firebaseAdmin.js';
import { success, error } from './_lib/response.js';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return error(res, 'Unauthorized', 401);
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;

    // Fetch projects as workflows
    const snap = await admin.firestore().collection('projects')
        .where('userId', '==', userId)
        .get();

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return success(res, Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("WORKFLOWS_API_CRASH:", err);
    return error(res, err.message);
  }
}
