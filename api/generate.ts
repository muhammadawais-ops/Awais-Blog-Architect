import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { EEAT_GUIDELINES } from "../services/eeatGuidelines";
import { analyzeText } from "../utils/textAnalysis";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inputs } = req.body || {};
  
  if (!inputs) {
    return res.status(400).json({ error: "Request body is missing required 'inputs' object." });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(`[${new Date().toISOString()}] CRITICAL: No API Key found in process.env.API_KEY or process.env.GEMINI_API_KEY`);
    return res.status(500).json({ error: "API_KEY_MISSING" });
  }

  try {
    console.log(`[${new Date().toISOString()}] Initializing GoogleGenAI...`);
    const ai = new GoogleGenAI({ apiKey });
    
    console.log(`[${new Date().toISOString()}] Preparing prompt for topic: ${inputs.topic}`);
    const systemInstruction = `
      ${EEAT_GUIDELINES}

      ADDITIONAL CONTEXT & RULES:
      - EEAT Context: ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}
      - Target Website: ${inputs.websiteUrl}
      
      LANGUAGE & ENGAGEMENT (STRICT):
      - Language: Use extremely simple, clear, and conversational English (Grade 3-4 level).
      - Pain Points: Start by immediately addressing the reader's specific pain points.
      
      RESEARCH & LINKING (CRITICAL):
      - EXTERNAL LINKS: Use placeholders like [[EXT_1]], [[EXT_2]] in text. Provide mapping in "externalCitations" JSON field.
      - INTERNAL LINKS: Search for 2-3 relevant pages from ${inputs.websiteUrl} using "site:${inputs.websiteUrl} ${inputs.topic}".
      
      KEYWORD STRATEGY:
      - PRIMARY KEYWORD: "${inputs.primaryKeyword}" (Title, Meta, H1, Intro, Body, Conclusion).
      - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" (Semantic SEO).

      CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
      1. H1 TITLE: Catchy, personal, includes primary keyword.
      2. **AI OVERVIEW (CRITICAL)**: The very first paragraph after H1 must be **BOLDED**. It MUST be a blunt, direct, and simple answer to the user's main query or topic. No fluff, no "In this blog...", no filler. Just the direct answer in extremely clear language. (~300-500 characters).
      3. INTRODUCTION HEADING: Use "## Introduction:". Start by addressing the reader's pain points.
      4. BODY: Use H2, H3, H4, and H5 hierarchically. Short paragraphs citing authoritative data.
      5. ORGANIC FORMATTING: Bold key phrases.
      6. FINAL INSIGHT HEADING: Professional dynamic heading (Unique & Professional).
      7. PROFESSIONAL BRIDGE (CTA): Professional dynamic bridge to ${inputs.websiteUrl}.
      8. FAQs: 3-5 questions with blunt, exact answers.
    `;

    const prompt = `
      TASK: Write a master-level blog post that is simple, engaging, and authoritative.
      TOPIC: ${inputs.topic}
      PRIMARY KEYWORD: ${inputs.primaryKeyword}
      SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
      TARGET LENGTH: ${inputs.wordCount} words (STRICTLY MATCH THIS WORD COUNT)
      TARGET WEBSITE: ${inputs.websiteUrl}
      
      CITATION SYSTEM (CRITICAL):
      1. Use Google Search to find 3-4 high-authority external sources (Forbes, Wikipedia, HBR, etc.).
      2. In the "content" field, DO NOT write the full markdown link. Instead, use placeholders like [[EXT_1]], [[EXT_2]], [[EXT_3]], [[EXT_4]].
      3. Place these placeholders naturally within the sentences where the information is cited.
      4. In the "externalCitations" field of the JSON, provide the details for each placeholder.

      MANDATORY REQUIREMENTS: 
      - START WITH PAIN POINTS: The introduction must immediately resonate with the reader's struggles.
      - SIMPLE LANGUAGE: Write so an 8-year-old (3rd/4th grade) can understand perfectly.
      - BOLDED ANSWER: The first paragraph after H1 must be a bolded, direct answer to the topic.
      - DEEP EEAT INTEGRATION: Use the provided EEAT Context to inject authority and a unique professional voice.
      - INTERACTIVE: Use rhetorical questions and engaging transitions.

      OUTPUT FORMAT: Return ONLY valid JSON.
      {
        "metaTitle": "Title including primary keyword",
        "metaDescription": "Description including primary keyword",
        "content": "Full markdown content. Use placeholders like [[EXT_1]] for external links.",
        "externalCitations": [
          { "placeholder": "[[EXT_1]]", "siteName": "Forbes", "url": "https://forbes.com/..." },
          { "placeholder": "[[EXT_2]]", "siteName": "Wikipedia", "url": "https://en.wikipedia.org/..." }
        ],
        "humanConfidence": 99
      }
    `;

    console.log(`[${new Date().toISOString()}] Calling Gemini API...`);
    
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
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
          temperature: 0.8,
        },
      });
    } catch (searchError: any) {
      console.warn(`[${new Date().toISOString()}] Search-enabled generation failed, trying fallback without search:`, searchError.message);
      
      // Fallback: Try without googleSearch tool if search is restricted (common with billing issues)
      response = await ai.models.generateContent({
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
    }

    console.log(`[${new Date().toISOString()}] Gemini API response received.`);
    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    console.log(`[${new Date().toISOString()}] Parsing JSON response...`);
    const data = JSON.parse(text);
    
    console.log(`[${new Date().toISOString()}] Processing citations and metrics...`);
    // Inject Citations into content
    let finalContent = data.content || "";
    const sources: any[] = [];

    if (data.externalCitations && Array.isArray(data.externalCitations)) {
      data.externalCitations.forEach((citation: any) => {
        if (citation.placeholder && citation.url) {
          const markdownLink = `[${citation.siteName || "Source"}](${citation.url})`;
          finalContent = finalContent.split(citation.placeholder).join(markdownLink);
          
          if (!sources.find(s => s.uri === citation.url)) {
            sources.push({
              title: citation.siteName || "Reference Source",
              uri: citation.url
            });
          }
        }
      });
    }

    let textMetrics = {} as any;
    try {
      textMetrics = analyzeText(finalContent);
    } catch (e) {
      console.error("Text Analysis Error:", e);
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    for (const chunk of groundingChunks) {
      if (chunk.web && chunk.web.uri) {
        if (!sources.find(s => s.uri === chunk.web?.uri)) {
          sources.push({
            title: chunk.web.title || "Reference Source",
            uri: chunk.web.uri as string
          });
        }
      }
    }

    console.log(`[${new Date().toISOString()}] Generation successful. Sending response.`);
    return res.json({
      content: finalContent,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      sources,
      metrics: textMetrics
    });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Vercel Function Error:`, error);
    // Handle specific Gemini errors
    if (error.message?.includes("billing") || error.message?.includes("quota")) {
      return res.status(403).json({ error: "Gemini API Billing/Quota Error: Please ensure your Google Cloud project has billing enabled and you have sufficient quota." });
    }
    return res.status(500).json({ error: error.message || "Failed to generate content" });
  }
}
