import admin from './_lib/firebaseAdmin';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
        return res.status(404).json({ message: "User profile not found" });
    }

    return res.status(200).json(userDoc.data());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
