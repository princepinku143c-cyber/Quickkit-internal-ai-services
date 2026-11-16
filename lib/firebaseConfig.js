const REQUIRED_FIREBASE_CLIENT_CONFIG = ["apiKey", "authDomain", "projectId", "appId"];

export function getMissingFirebaseClientConfig(config) {
  return REQUIRED_FIREBASE_CLIENT_CONFIG.filter((key) => (
    typeof config?.[key] !== "string" || config[key].trim().length === 0
  ));
}

export function isFirebaseClientConfigComplete(config) {
  return getMissingFirebaseClientConfig(config).length === 0;
}
