import admin from './_lib/firebaseAdmin.js';
import { success, error } from './_lib/response.js';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return error(res, 'Unauthorized', 401);

  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;

    const snap = await admin.firestore()
      .collection('projects')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return success(res, Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("MY_PROJECTS_CRASH:", err);
    return error(res, err.message);
  }
}
