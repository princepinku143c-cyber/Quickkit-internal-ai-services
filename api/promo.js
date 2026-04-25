import admin from './_lib/firebaseAdmin.js';
import crypto from 'crypto';

// ⚠️ SECURITY WARNING: SHA256("password") hashes are predictable. 
// Replace these with unique, high-entropy promo codes in production.
const PROMOS = {
  'ea8905488bf75ea7dffc6cc9622159bfaa749001d38eed44edd2f21bf6925d08': 2000, // NEW2000
  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8': 5000,  // VIP5000 (password hash)
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    const userId = decodedToken.uid;
    const { code } = req.body;

    if (!code) return res.status(400).json({ message: 'Code required' });

    // Hash the input code
    const inputHash = crypto.createHash('sha256').update(code).digest('hex');
    const bonus = PROMOS[inputHash];

    if (!bonus) {
      return res.status(400).json({ message: 'Invalid or expired promo code' });
    }

    const userRef = admin.firestore().collection('users').doc(userId);
    
    // Atomic Transaction to prevent multiple uses if we had a usage tracking collection
    await admin.firestore().runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        const data = userDoc.data();
        
        // Prevent re-using same promo (simple check)
        const usedPromos = data.usedPromos || [];
        if (usedPromos.includes(inputHash)) {
            throw new Error('This promo code has already been used by this account');
        }

        t.update(userRef, {
            credits: admin.firestore.FieldValue.increment(bonus),
            usedPromos: admin.firestore.FieldValue.arrayUnion(inputHash)
        });
    });

    return res.status(200).json({ status: 'success', bonus });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
