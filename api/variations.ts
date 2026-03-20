import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { primaryKeyword } = req.body || {};
  
  if (!primaryKeyword) {
    return res.status(400).json({ error: "Missing required 'primaryKeyword' in request body." });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(`[${new Date().toISOString()}] CRITICAL: No API Key found for variations endpoint.`);
    return res.status(401).json({ error: "API_KEY_MISSING" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 4 semantic variations or LSI keywords for the primary keyword: "${primaryKeyword}". Return ONLY the variations as a comma-separated list.`,
      config: {
        temperature: 0.7,
        responseMimeType: "text/plain",
      },
    });

    const text = response.text;
    if (!text) return res.json({ variations: [] });
    
    const variations = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
    return res.json({ variations });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Variations Error:`, error);
    return res.status(500).json({ error: error.message || "Failed to generate variations" });
  }
}
