/**
 * Standardized SaaS Response Orchestration.
 * Ensures consistent payload geometry to prevent frontend hydration crashes.
 */
export const success = (res, data) => {
  return res.status(200).json({ 
    success: true, 
    data: Array.isArray(data) ? data : (data || {}) 
  });
};

export const error = (res, message, code = 500) => {
  console.error(`[API_ERROR] ${code}: ${message}`);
  return res.status(code).json({ 
    success: false, 
    message: message || "Neural link communication failure."
  });
};
