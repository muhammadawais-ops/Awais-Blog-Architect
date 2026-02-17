
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog, GroundingSource } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a Senior Specialist and Subject Matter Expert with real-time research capabilities. 
  Your background and professional niche are strictly defined by the "EEAT Context" provided by the user. 
  
  RESEARCH & CITATION RULE (CRITICAL):
  - Use Google Search to find real-time data, statistics, and insights from renowned, high-authority websites (e.g., Forbes, Harvard Business Review, Statista, specialized industry leaders).
  - INTEGRATE EXTERNAL LINKS: Naturally cite these sources within the content using Markdown links [Source Name](URL). 
  - Ensure links are placed on relevant keywords or statistics to provide maximum value and authority.
  - DO NOT make up URLs. Only use the ones found during the search.

  READABILITY RULE (STRICT):
  - Target Readability: Grade 7 to Grade 9.
  - Sentence Structure: Short and punchy. No long, academic, or corporate jargon.
  - Active Voice: Use active voice 90% of the time.

  KEYWORD STRATEGY (LOCKED):
  - PRIMARY KEYWORD: "${inputs.primaryKeyword}" must be naturally integrated into Title, Meta, H1, first para, body, and Conclusion.
  - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" must use Semantic SEO.

  CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
  1. H1 TITLE: Catchy, personal, includes primary keyword.
  2. **AI OVERVIEW (CRITICAL)**: The very first paragraph after H1 must be **BOLDED**. It MUST be a blunt, direct, and simple answer to the user's main query or topic. No fluff, no "In this blog...", no filler. Just the direct answer in extremely clear language. (~300-500 characters).
  3. INTRODUCTION HEADING: Use "## Introduction:".
  4. BODY: Use H2, H3, H4, and H5 hierarchically. Short paragraphs citing authoritative data.
  5. ORGANIC FORMATTING: Bold key phrases.
  6. FINAL INSIGHT HEADING: Professional dynamic heading (Unique & Professional).
  7. PROFESSIONAL BRIDGE (CTA): Professional dynamic bridge to ${inputs.websiteUrl}.
  8. FAQs: 3-5 questions with blunt, exact answers.

  USER-PROVIDED EEAT CONTEXT:
  ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}`;

  const prompt = `
    TASK: Write a master-level blog post using real-time search data to cite authoritative sources.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words

    MANDATORY: 
    - The first bolded paragraph MUST be the direct, no-nonsense answer to "${inputs.topic}".
    - Cite at least 2-3 renowned external websites with direct links in the content to prove authenticity.

    OUTPUT FORMAT: Return ONLY valid JSON.
    {
      "metaTitle": "Title including primary keyword",
      "metaDescription": "Description including primary keyword",
      "content": "Full markdown content with Grade 9 readability, professional dynamic headings, authoritative external links, and a direct bolded answer at the start",
      "humanConfidence": 99
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
            humanConfidence: { type: Type.INTEGER }
          },
          required: ["metaTitle", "metaDescription", "content", "humanConfidence"]
        },
        temperature: 0.85,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    const data = JSON.parse(text);
    const textMetrics = analyzeText(data.content || "");

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => ({
        title: chunk.web.title || "Reference Source",
        uri: chunk.web.uri
      }));

    return {
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      sources,
      metrics: textMetrics
    };
  } catch (error: any) {
    console.error("Gemini Architect Error:", error);
    throw error;
  }
};
