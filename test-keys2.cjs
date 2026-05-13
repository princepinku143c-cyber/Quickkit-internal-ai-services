const https = require('https');

const keysToTest = [
  "AIzaSyDysnepgTK_Uj4Q1_504xbo7mjfwSun410", // my previous guess
  "AIzaSyDysmepgTK_Uj4Q1_5O4xbo7mjFwSum410", // original
  "AIzaSyDysnepgTK_Uj4Ql_5O4xbo7mjfwSun4l0", // guess with l and O
  "AIzaSyDysnepgTK_Uj4Ql_5O4xbo7mjfwSun410", // l and O, ending in 10
  "AIzaSyDysnepgTK_Uj4Ql_504xbo7mjfwSun410", // l and 0, ending in 10
  "AIzaSyDysnepgTK_Uj4Q1_5O4xbo7mjfwSun4l0", // 1 and O, ending in l0
  "AIzaSyDysnepgTK_Uj4Q1_5O4xbo7mjfwSun410", // 1 and O, ending in 10
  "AIzaSyDysnepgTK_Uj4Q1_504xbo7mjfwSun4l0", // 1 and 0, ending in l0
];

function testKey(key) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signInWithPassword?key=${key}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.error && response.error.message === 'MISSING_EMAIL') {
          resolve({ key, valid: true });
        } else {
          resolve({ key, valid: false, response });
        }
      });
    });

    req.write(JSON.stringify({ returnSecureToken: true }));
    req.end();
  });
}

async function run() {
  for (const key of keysToTest) {
    const result = await testKey(key);
    if (result.valid) {
      console.log(`✅ VALID KEY FOUND: ${key}`);
      return;
    } else {
      console.log(`❌ Invalid: ${key}`);
    }
  }
  console.log("No valid key found among the guesses.");
}

run();
