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
}
