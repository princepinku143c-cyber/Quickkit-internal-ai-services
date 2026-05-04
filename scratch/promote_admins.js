import admin from "../api/_lib/firebaseAdmin.js";

async function promoteUsersToAdmin() {
  const targetEmails = [
    "support@quickkitai.com",
    "admin@quickkitai.com",
    "payments@quickkitai.com",
    "sales@quickkitai.com",
    "princepinku143c@gmail.com" // Just in case they are logged in with this currently
  ];

  console.log("Starting admin promotion process...");

  for (const email of targetEmails) {
    try {
      // Get user by email from Firebase Auth
      const userRecord = await admin.auth().getUserByEmail(email);
      const uid = userRecord.uid;

      // Update their document in Firestore to set role: 'admin'
      await admin.firestore().collection('users').doc(uid).set({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ Promoted to admin: ${email} (UID: ${uid})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️ User not found in Firebase Auth yet: ${email}`);
      } else {
        console.error(`❌ Error promoting ${email}:`, error.message);
      }
    }
  }

  console.log("Admin promotion process complete.");
  process.exit(0);
}

promoteUsersToAdmin();
