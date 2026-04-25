import admin from './_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;

    // NOTE: This query requires a composite index in Firebase Console: execution_logs (user: asc, timestamp: desc)
    const logsSnap = await admin.firestore().collection('execution_logs')
        .where('user', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

    const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
