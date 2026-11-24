export function isAdminAppBoundToProject(existingProjectId, configuredProjectId) {
  const expectedProjectId = typeof configuredProjectId === "string"
    ? configuredProjectId.trim()
    : "";
  if (!expectedProjectId) return true;
  return typeof existingProjectId === "string"
    && existingProjectId.trim() === expectedProjectId;
}

export function selectAdminAppForProject(apps, configuredProjectId) {
  const existingApps = Array.isArray(apps) ? apps : [];
  const app = existingApps.find((candidate) => (
    isAdminAppBoundToProject(candidate?.options?.projectId, configuredProjectId)
  )) || null;
  const expectedProjectId = typeof configuredProjectId === "string"
    ? configuredProjectId.trim()
    : "";

  return {
    app,
    blocked: Boolean(expectedProjectId) && existingApps.length > 0 && !app,
  };
}
