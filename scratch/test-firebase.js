import admin from 'firebase-admin';

// Hardcoded for verification purposes (ONLY IN SCRATCH)
const FIREBASE_PROJECT_ID = "ai-crm-system-d28ef";
const FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@ai-crm-system-d28ef.iam.gserviceaccount.com";
const FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCbZti0MKFYaqlS\n/r9N8NGameo4pPrJM0zLcdbw4bz9EDXhiNPaLhCh1P7kb4ks5+QZmvpctCpcwzP9\nHaambyXqhtJBv/bsiHjHEp6X1GvBhqD9/x3lhLCSsDNv3IX93Q5YCD+Ofc3uBcYG\n73ljAG6QpvYQGhk5WRFmVkRes3ukGIg9REsBf5OpMQdAUF7TQVxwHxrp7QfdL5iJ\nFAY6ex548EMPvcrcxy+DXOQZE4vz02kaFMjslMey+UQShmZyTMlVeahRJy5l2P7b\njmXpPMOJVh4Ji4dokwmIvH4njkHyjoQJ9A5D7lLw5tkAXS0yF8lRA+wbTLZoRO/q\nJ1eZqePHAgMBAAECggEADMAyOmFdxmTEt+vxw8dlVgttoxrbqPPt8n4eEMMKQAll\nzQzuX7yKiNIdMp55jEG1VD8vGQ7UsFUj8uTNQ7gNowyk5oLbE9VZc5wc1IBixwzw\n22Zktuxdleuh4iUfVBEgmCs1FnqkEZ+k+/SyP7lNWSPElNWktDE8CEA+eTa+MlyK\n3AK9HR+IQGaXBrf/e5sJfkQAZfBh0Zd09L5TeuDVZ+WcoHtJnM8ubQuQJrBzHM85\nhKLOdB1Lqoydmk+ePzetD5FEKHBXHfn8Ay5CLPq2gNliuuDpq2W4yLuODYT8NjOBLDY3tK6Tm7+tb5X2N3FAJN0KY5UJadGNkTa1PYa3QQKBgQDOLajNyM5A9c6ogV48\nPRCbXShxFZo/TRJF9WfRPTOt/ExZkBOKrUK7J/CedQtgW5mWzUtOU+j3H0XC/TFk\ngzvZQADe/S9pEWWQB71evha8QboL6ydrUAS+0SXcNCM+S93MBQA3upJTW/SgD+ei\nlQIUHp0yUEgEj5D2lsB9sB44iQKBgQDA9BwJ5D0IT0YWQdEmSYSeGZ7wcxqeUhnW\nR9pHuJUvMsz00yP2S2jAdFaBlQXc4zUDb+/9J7H7fozXBJRk0mkHmytLgA9nuA5p\nL59C76EBtvPQqXwT5IjCws69cswdNRTJjWRirmJlSYG/3I5m34GjIeeOBziiaasu\EeGPokOFzwKBgQC48WYhKYYx6Qx2RI1mVZRm+NqFDc6uB5Fjpa15mH+aCt3l3QJae+6G+V2yleUdiy0rg32Qhl5MBgZK0VmUAtAVoX7mh5AWnF9RIlAxAyxbtE2R0V8ruLx4+h0O+MnAYMdU8gtu8fG9ypeVWI78XNNfftKdRjxDsxBi0XlbhTammQKBgDKj\nHYSfCEFZBIyswyWoH4yaLrLtkivAYhVxD+DImSYkz9LkYkitq5TuMxGYuUwpuGzp\ngHLQaw4UPQPkqMj4yyV63FbZCbHvhKCoJcScPIXFrKCzCePyks2B8F2ZdeWoW4c1\newXGu/3W150xVZG70DqumCUW0g8Vah4SBT77l3rTAoGBAInrjzrhWQM5gaOt+OUg\nc/sFT0OQLdyXOHOEKrysis3vwUce/optMD9yRczvL0TfR+5gAwR8WpnznRO3VkkL\nwSFqGrFLkz8X8u+ZcNNw7x9qHIcdbbu4G7ogxYV8kA9PkgKZyFigcFPxL7SjsZmM\nlsnbJcwqVPwgyPScuhZlGtre\n-----END PRIVATE KEY-----";

async function verify() {
  console.log("🚀 Starting Firebase Connection Verification...");
  
  try {
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    const db = admin.firestore();
    
    // Test 1: Write a verification log
    console.log("📝 Attempting to write verification log...");
    const docRef = await db.collection('system_verification').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "SUCCESS",
      agent: "Antigravity-AI-Agent",
      message: "Neural Link Verified Successfully."
    });
    
    console.log(`✅ SUCCESS! Document written with ID: ${docRef.id}`);
    
    // Test 2: Read it back
    const doc = await docRef.get();
    console.log("📖 Read verified data:", doc.data());
    
    console.log("\n🔥 FIREBASE PRIVATE KEY IS 100% FUNCTIONAL.");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ VERIFICATION FAILED!");
    console.error("Error Detail:", err.message);
    process.exit(1);
  }
}

verify();
