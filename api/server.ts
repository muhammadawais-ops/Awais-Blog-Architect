
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { EEAT_GUIDELINES } from "../services/eeatGuidelines";
import { analyzeText } from "../utils/textAnalysis";

const app = express();
const PORT = 3000;
const SERVER_TIMEOUT = 180000; // 3 minutes

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// API Route for Content Generation
app.post("/api/generate", async (req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Generation request received`);
  
  const { inputs, task, primaryKeyword } = req.body || {};
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(`[${requestId}] CRITICAL: No API Key found`);
    return res.status(401).json({ error: "API_KEY_MISSING" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Handle Semantic Variations
    if (task === 'semantic_variations') {
      if (!primaryKeyword) return res.status(400).json({ error: "Missing primaryKeyword" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 4 semantic variations or LSI keywords for: "${primaryKeyword}". Return ONLY the variations as a comma-separated list.`,
        config: { temperature: 0.7, responseMimeType: "text/plain" },
      });
      const variations = response.text ? response.text.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      return res.json({ variations });
    }

    if (!inputs) return res.status(400).json({ error: "Missing inputs" });

    const isGuestPost = inputs.contentType === 'guest_post';
    const systemInstruction = `
      ${EEAT_GUIDELINES}
      ROLE: Senior SEO Content Architect.
      CONTEXT: ${inputs.businessDetails || "Expert Copywriter."}
      BRAND: ${inputs.brandName}
      TARGET URL: ${inputs.websiteUrl}
      ${isGuestPost ? `GUEST POST MODE: Focus on educational value for ${inputs.targetSiteContext}. Include a natural mention of ${inputs.anchorText} linking to ${inputs.backlinkUrl}.` : ''}
      RULES: Simple English (Grade 4). First paragraph BOLD direct answer. Structure: H1, AI Overview (Bold), Intro, Body (H2-H5), FAQs, Conclusion. Citations: [[EXT_1]], [[EXT_2]].
    `;

    const prompt = `
      Write a ${inputs.wordCount}-word ${isGuestPost ? 'Guest Post' : 'Blog Post'} about "${inputs.topic}".
      Primary Keyword: "${inputs.primaryKeyword}"
      Secondary Keywords: "${inputs.secondaryKeywords}"
      ${isGuestPost ? `Requirement: Naturally integrate a link with anchor text "${inputs.anchorText}" pointing to "${inputs.backlinkUrl}".` : ''}
      Return ONLY valid JSON matching the schema. If no external citations are needed, return an empty array for externalCitations.
    `;

    console.log(`[${requestId}] Calling Gemini...`);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            content: { type: Type.STRING },
            externalCitations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  placeholder: { type: Type.STRING },
                  siteName: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["placeholder", "siteName", "url"]
              }
            },
            humanConfidence: { type: Type.INTEGER }
          },
          required: ["metaTitle", "metaDescription", "content", "externalCitations", "humanConfidence"]
        },
        temperature: 0.7,
      },
    });

    let text = response.text || "";
    // Robust JSON cleaning
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0].trim();
    }

    const data = JSON.parse(text);
    let finalContent = data.content || "";
    const sources: any[] = [];

    if (data.externalCitations && Array.isArray(data.externalCitations)) {
      data.externalCitations.forEach((citation: any) => {
        if (citation.placeholder && citation.url) {
          const markdownLink = `[${citation.siteName || "Source"}](${citation.url})`;
          finalContent = finalContent.split(citation.placeholder).join(markdownLink);
          sources.push({ title: citation.siteName || "Reference", uri: citation.url });
        }
      });
    }

    const metrics = analyzeText(finalContent);
    console.log(`[${requestId}] Success`);
    return res.json({
      content: finalContent,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      sources,
      metrics
    });

  } catch (error: any) {
    console.error(`[${requestId}] Error:`, error);
    if (!res.headersSent) {
      const msg = error.message || "Failed to generate content";
      if (msg.includes("fetch failed") || msg.includes("timeout")) {
        return res.status(504).json({ error: "The AI took too long. Please try a shorter word count." });
      }
      res.status(500).json({ error: msg });
    }
  }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

async function setupVite() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.join(__dirname, "..", "dist");

  // In Vercel production, we don't want to even try loading Vite
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  if (isProduction) {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found" });
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Frontend assets not found. Please ensure build ran correctly.");
        }
      });
    }
  } else {
    try {
      // Only import Vite in non-production environments
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Vite load failed (expected in production):", e);
    }
  }
}

setupVite();

// Only listen if not on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[${new Date().toISOString()}] Server started on http://0.0.0.0:${PORT}`);
  });
  server.timeout = SERVER_TIMEOUT;
  server.keepAliveTimeout = 70000;
  server.headersTimeout = 71000;
}

export default app;

