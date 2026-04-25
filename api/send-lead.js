import { saveLead } from './services/leadService.js';
import { success, error } from './_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 'Method Not Allowed', 405);

  try {
    await saveLead(req.body);
    return success(res, "Lead archived in neural database.");
  } catch (err) {
    console.error("LEAD_API_CRASH:", err);
    return error(res, err.message, 400); 
  }
}
