import admin from './_lib/firebaseAdmin.js';
import { success, error } from './_lib/response.js';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return error(res, 'Unauthorized', 401);
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;

    const logsSnap = await admin.firestore().collection('execution_logs')
        .where('user', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

    const data = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return success(res, Array.isArray(data) ? data : []);
  } catch (err) {
    return error(res, err.message);
  }
}
