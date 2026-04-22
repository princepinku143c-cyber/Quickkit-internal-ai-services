import admin from './_lib/firebaseAdmin';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;

    const projectsSnap = await admin.firestore().collection('projects')
        .where('ownerId', '==', userId)
        .where('public_form_enabled', '==', true)
        .get();
        
    const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
