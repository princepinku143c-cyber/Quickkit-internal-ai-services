const REQUIRED_FIREBASE_CLIENT_FIELDS = ["apiKey", "authDomain", "projectId", "appId"];

/**
 * @param {Record<string, unknown> | null | undefined} config
 */
export function hasRequiredFirebaseClientConfig(config) {
  if (!config || typeof config !== "object") return false;

  return REQUIRED_FIREBASE_CLIENT_FIELDS.every((field) =>
    typeof config[field] === "string" && config[field].trim().length > 0
  );
}
