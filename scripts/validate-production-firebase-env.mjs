const requiredProductionFirebaseVariables = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

// Vercel sets VERCEL_ENV to "production" only for production deployments.
// Preview and local builds stay usable without production credentials.
if (process.env.VERCEL_ENV === "production") {
  const missing = requiredProductionFirebaseVariables.filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missing.length > 0) {
    console.error(
      "Production Firebase configuration is incomplete. Missing required environment variables: "
      + missing.join(", ")
    );
    process.exitCode = 1;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  if (
    clientEmail
    && !/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(clientEmail)
  ) {
    console.error(
      "Production Firebase service account email format is invalid. "
      + "FIREBASE_CLIENT_EMAIL must be a Google service-account address."
    );
    process.exitCode = 1;
  }

  // Firebase Admin accepts PKCS#8 PEM keys. Normalize Vercel's escaped newlines
  // for validation, but never print or otherwise expose the key material.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
  if (
    privateKey
    && !/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----$/.test(privateKey)
  ) {
    console.error(
      "Production Firebase private key format is invalid. "
      + "FIREBASE_PRIVATE_KEY must be a PKCS#8 PEM private key."
    );
    process.exitCode = 1;
  }

  // The browser Firebase client and trusted Admin SDK must address the same
  // Firebase project. Report variable names only; never print configured IDs.
  const clientProjectId = process.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const adminProjectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (
    clientProjectId
    && adminProjectId
    && clientProjectId !== adminProjectId
  ) {
    console.error(
      "Production Firebase project configuration mismatch. "
      + "VITE_FIREBASE_PROJECT_ID and FIREBASE_PROJECT_ID must refer to the same Firebase project."
    );
    process.exitCode = 1;
  }
}
