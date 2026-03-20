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
    return res.status(401).json({ error: "API_KEY_MISSING" });
  }

  // Log masked key for debugging
  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`[${new Date().toISOString()}] Using API Key: ${maskedKey} (Source: ${process.env.API_KEY ? 'process.env.API_KEY' : 'process.env.GEMINI_API_KEY'})`);

  try {
    console.log(`[${new Date().toISOString()}] Initializing GoogleGenAI...`);
    const ai = new GoogleGenAI({ apiKey });
    
    const isGuestPost = inputs.contentType === 'guest_post';

    console.log(`[${new Date().toISOString()}] Preparing prompt for topic: ${inputs.topic} (Type: ${inputs.contentType})`);
    const systemInstruction = `
      ${EEAT_GUIDELINES}

      ROLE: You are an ${isGuestPost ? "Expert Guest Post Writer (Teacher Persona)" : "Expert Senior SEO Content Strategist & Consultant (Closer Persona)"}.
      
      ADDITIONAL CONTEXT & RULES:
      - Brand Name: ${inputs.brandName || "Our Agency"}
      - EEAT Context: ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}
      - Target Website (Client): ${inputs.websiteUrl}
      - Search Intent: ${inputs.searchIntent}
      ${isGuestPost ? `- Backlink Target: ${inputs.backlinkUrl} (Anchor: ${inputs.anchorText})` : ""}
      ${isGuestPost ? `- Host Website Context (Where this will be published): ${inputs.targetSiteContext}` : ""}
      
      LANGUAGE & ENGAGEMENT (STRICT):
      - Language: Use extremely simple, clear, and conversational US English (Grade 3-4 level).
      - Tone: Helpful, persuasive, and authoritative but approachable. Avoid AI-like fluff and jargon.
      - Pain Points: Start by immediately addressing the reader's specific pain points.
      - PARAGRAPHS: Keep paragraphs extremely short (2-3 sentences max). Avoid "walls of text".
      
      KEYWORD STRATEGY (MANDATORY):
      - PRIMARY KEYWORD: "${inputs.primaryKeyword}"
      - Use primary keyword naturally in: H1 title, First 100 words, At least one H2, Meta title, and Meta description.
      - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" (Use for semantic SEO).
      - Avoid keyword stuffing. Keep it natural.

      E-E-A-T OPTIMIZATION (CRITICAL):
      - Demonstrate REAL experience.
      - Include: Realistic examples, specific use-case scenarios, and specific outcomes (e.g., "we saw a 40% traffic growth").
      - Use data-backed insights and mention industry-standard tools/practices.

      CONTENT STRUCTURE (NON-NEGOTIABLE):
      1. H1 TITLE: Catchy, includes primary keyword.
      2. HOOK: A compelling opening that addresses search intent.
      3. INTRODUCTION: Include the primary keyword in the first 100 words.
      4. PROBLEM SECTION: Deep dive into the reader's pain points.
      5. CORE SOLUTION: The main value proposition/answer.
      6. ADVANCED TIPS: High-level insights demonstrating expertise.
      7. COMMON MISTAKES: What to avoid (optional but recommended).
      8. FAQ SECTION: 3-5 questions with blunt, exact answers.
      9. CONCLUSION: Summarize and build trust.
      10. STRONG CTA: Benefit-driven call to action for ${inputs.brandName || "our agency"}.

      ON-PAGE SEO:
      - Meta Title: 55-60 characters.
      - Meta Description: 140-155 characters.
      - Internal Linking: Use [Insert internal link to relevant page on ${inputs.websiteUrl}] placeholders.
      - Image Placement: Use [Add image: Description with alt text including keywords] placeholders.

      ${isGuestPost ? `
      GUEST POST SPECIFICS (TEACHER PERSONA):
      - TONE: Neutral, Educational, Authority-based. Third-person perspective. Think: "I am a teacher, not a seller."
      - TOPIC SELECTION: Must be highly relevant to the host website niche (${inputs.targetSiteContext}) and informational, not sales-driven.
      - Soft Brand Mention: Mention experience naturally (e.g., "In our experience at ${inputs.brandName || 'our agency'} working with small businesses..."). NO hard selling.
      - Author Bio: Short, authority-based, includes the backlink to ${inputs.backlinkUrl} with anchor "${inputs.anchorText}" and a clear CTA.
      ` : `
      BLOG POST SPECIFICS (CONSULTANT PERSONA):
      - TONE: Helpful, Persuasive, Clear, Simple, Conversational (US Tone). First-person perspective. Think: "I am a consultant who wants to close a client."
      - SEARCH INTENT: Identify if intent is Informational, Commercial, or Transactional. Structure strictly around solving the user's problem.
      - GOAL: Problem -> Solution -> Action.
      `}
    `;

    const prompt = `
      TASK: Write a master-level ${isGuestPost ? "GUEST POST" : "BLOG POST"} that is simple, engaging, and authoritative.
      TOPIC: ${inputs.topic}
      PRIMARY KEYWORD: ${inputs.primaryKeyword}
      SEARCH INTENT: ${inputs.searchIntent}
      TARGET LENGTH: ${inputs.wordCount} words
      TARGET WEBSITE: ${inputs.websiteUrl}
      ${isGuestPost ? `BACKLINK: ${inputs.backlinkUrl} with anchor "${inputs.anchorText}"` : ""}
      
      STRICT ADHERENCE TO SEARCH INTENT:
      - If Informational: Focus on educating and solving a "how-to" problem.
      - If Commercial: Focus on helping the user make a decision (comparisons, reviews).
      - If Transactional: Focus on the benefits of taking action (hiring, buying).

      CITATION & LINKING SYSTEM (CRITICAL):
      1. Use Google Search to find 3-4 high-authority external sources.
      2. In the "content" field, use placeholders like [[EXT_1]], [[EXT_2]], etc.
      3. TARGET DOMAIN INTEGRATION: Naturally weave ${inputs.websiteUrl} into the content.
      4. In the "externalCitations" field of the JSON, provide the details for each placeholder.
      ${isGuestPost ? `5. BACKLINK INTEGRATION: Add a natural link to ${inputs.backlinkUrl} using anchor text "${inputs.anchorText}" in the Author Bio section.` : ""}

      MANDATORY REQUIREMENTS: 
      - START WITH PAIN POINTS: Immediate resonance with reader struggles.
      - SIMPLE LANGUAGE: Grade 3-4 level.
      - BOLDED ANSWER: First paragraph after H1.
      - DEEP EEAT INTEGRATION: Use provided context.
      - SHORT PARAGRAPHS: Max 3 sentences.
      - ${isGuestPost ? "GUEST POST STYLE: Educational, Teacher Persona, Third-person, Soft brand mention, Author Bio with backlink." : "BLOG POST STYLE: Persuasive, Consultant Persona, First-person, Keyword-focused, Strong CTA, Search Intent focused."}
      - SEO: Meta Title (55-60 chars), Meta Description (140-155 chars), Internal link placeholders, Image placeholders with alt text.

      OUTPUT FORMAT: Return ONLY valid JSON.
      {
        "metaTitle": "Title (55-60 chars)",
        "metaDescription": "Description (140-155 chars)",
        "content": "Full markdown content following the non-negotiable structure.",
        "externalCitations": [
          { "placeholder": "[[EXT_1]]", "siteName": "Authority Site", "url": "https://..." }
        ],
        "humanConfidence": 99
      }
    `;

    console.log(`[${new Date().toISOString()}] Calling Gemini API...`);
    
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
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
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
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
