import { GoogleGenAI, Type } from "@google/genai";
import admin from './_lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. SECURE ENDPOINT: Check Firebase Session
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(idToken);
    
    const { history, customPrompt, item } = req.body;
    
    // We expect the API key to be set in the Vercel Environment Variables
    const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
    const AI_MODEL = 'gemini-2.0-flash';

    const isCustomProject = !item;

    const systemPrompt = `You are Kelly, an AI Solutions Architect, ROI Calculator, and Sales Conversion Assistant for my Automation Agency.

Your goal is to:
1. Analyze user business based on their input text or image
2. Generate automation workflows
3. Calculate ROI (time + money savings)
4. ${isCustomProject ? 'Recommend a custom proposal explicitly without giving fixed set-up prices' : 'Show premium pricing'}
5. Convert user into paying client

---
BUSINESS MODEL & PRICING:
- SIMPLE (Starter Automation): $799 setup. Maintenance: $100/month
- INTERMEDIATE (Professional Automation): $1599 setup. Maintenance: $199/month
- ADVANCED/ENTERPRISE (Enterprise Automation): $3499 setup. Maintenance: $299/month

${isCustomProject ? 'CRITICAL COMMAND for this Custom Project request: DO NOT output any fixed estimates for setup or maintenance. Set estimatedSetup: 0 and estimatedMaintenance: 0. Set complexityTier to "CUSTOM". Set isCustomEstimate to true. In your chatResponse, clearly state "Hi, I am Kelly. I will discuss your project requirements with my engineering team and email you a premium custom estimate shortly. Please click \\"Request Custom Proposal\\" below to provide your details, or email us directly at sales@quickkit.online."' : 'For this standard catalog service, you MUST use one of the exactly defined price tiers above.'}

STEP 1: AUTOMATION ANALYSIS
Analyze the business and identify repetitive manual processes, automation opportunities, and suggested tools (Zapier, CRM, email, etc.).
Inside your internal JSON 'steps' array, generate a clean workflow (e.g., Website Form -> CRM Entry -> Email Follow-up -> Slack Notification).

STEP 2: ROI CALCULATION (VERY IMPORTANT)
Estimate hours saved (10–30 hours/week depending on tasks).
Benchmark employee salary at $15/hr if not provided by user.

Inside 'chatResponse', you must output EXACTLY THIS FORMAT AND STRUCTURE:

📈 **ROI ESTIMATE & SAVINGS:**
1. Time Saved: [X] hours/week = [Y] hours/year
2. Salary Saved: You are saving the equivalent of [Z] full-time employees! (Calculate: total yearly hours saved * hourly salary. Make it emotional + powerful).
3. Money Saved: $[X]/year (with Average ROI: 240%+)
4. Break-even: Aapka $[SetupFee] project just [Months] months mein recover ho jayega!

Just like a [relevant agency/business type] saved 100+ hours/month and generated $50,000 extra revenue using automation.

🌟 **MAIN BENEFITS:**
• Save time: Free up 15–25 hours/week (let your team do creative work)
• Reduce errors: 40–75% fewer mistakes (happy clients)
• Increase revenue: 15–25% more deals closed (fast follow-up)
• Cut costs: $[Annual Savings] average annual saving

✨ **EXTRA HIDDEN BENEFITS (WOW FACTOR):**
• Better work-life balance (employees won't burnout)
• Scalable business growth (double your business with the same team)
• 24/7 automation (capture leads even while you sleep)
• Reduced operational stress

This automation can 10X your business growth 🚀
Next Step: Book your free automation consultation now! (Proceed to Deployment)

---
IMPORTANT RULES:
* Keep language simple, powerful, and clean. Use big bold numbers and emojis.
* Make user feel they are losing money without automation. Focus on ROI and profit.
* Make pricing look small compared to savings.

OUTPUT FORMAT REQUIREMENTS (JSON ONLY, NO MARKDOWN OUTSIDE JSON):
- 'chatResponse': The EXACT text structure shown above. Do not deviate.
- 'roiBreakdown': A sharp, 1-sentence math justification for the UI panel.
- 'complexityTier': "SIMPLE", "INTERMEDIATE", "ADVANCED", "ENTERPRISE", or "CUSTOM".
- 'estimatedSetup' & 'estimatedMaintenance': MUST EXACTLY MATCH one of the 3 pricing tiers, UNLESS it is a custom project, in which case output 0.
- 'isCustomEstimate': set to true ONLY for custom project scoping.`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: history,
      config: { 
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
           type: Type.OBJECT,
           properties: {
              summary: { type: Type.STRING },
              chatResponse: { type: Type.STRING },
              needsClarification: { type: Type.BOOLEAN },
              totalDuration: { type: Type.STRING },
              estimatedSetup: { type: Type.NUMBER },
              estimatedMaintenance: { type: Type.NUMBER },
              efficiencySavedHours: { type: Type.NUMBER },
              manualLaborCostEstimate: { type: Type.NUMBER },
              complexityTier: { type: Type.STRING },
              complexityReason: { type: Type.STRING },
              annualRoiEstimate: { type: Type.NUMBER },
              roiBreakdown: { type: Type.STRING },
              isCustomEstimate: { type: Type.BOOLEAN },
              steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keyAction: { type: Type.STRING }, duration: { type: Type.STRING } } } }
           }
        }
      }
    });

    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    res.status(200).json(JSON.parse(responseText));

  } catch (error) {
    console.error("Architect API Error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
