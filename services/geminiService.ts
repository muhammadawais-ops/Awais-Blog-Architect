
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // The system instruction now prioritizes the user's provided EEAT context to define the persona.
  const systemInstruction = `You are a Senior Specialist and Subject Matter Expert. 
  Your background, years of experience, and professional niche are strictly defined by the "EEAT Context" provided by the user. 
  
  PERSONA RULES:
  - If the user provides specific experience details (e.g., "10 years in Finance" or "Local Bakery Owner"), ADOPT that persona completely.
  - Speak with the authority, tone, and specific vocabulary of that niche.
  - Share insights as personal realizations and hands-on lessons learned over time.
  - Use "I" and "We" to establish real-world ownership of the advice, reflecting the specific business context provided.

  KEYWORD STRATEGY (LOCKED):
  - PRIMARY KEYWORD: "${inputs.primaryKeyword}" must be naturally integrated into:
    1. The Meta Title (near the start).
    2. The Meta Description.
    3. The H1 Headline.
    4. The first paragraph of the Introduction.
    5. Integrated naturally 3-4 times in body content.
    6. The Conclusion/Ending section.
  - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" must use Semantic SEO and NLP best practices for topical depth.

  TONE & STYLE (LOCKED):
  - Conversational, personal, and mentor-like (Personal Experience EEAT).
  - Use natural contractions ("I've," "You'll," "Don't").
  - Simple, punchy, and active language. No AI-isms like 'delve' or 'tapestry'.

  CONTENT STRUCTURE RULES (LOCKED):
  1. H1 TITLE: Catchy, personal, includes primary keyword.
  2. AI OVERVIEW: BOLDED paragraph (~500 characters) immediately after H1. Simple language, direct answer to the intent.
  3. INTRODUCTION HEADING: Use "## Introduction:".
  4. BODY: Use H2, H3, H4, and H5 hierarchically. Varied paragraph lengths.
  5. ORGANIC FORMATTING: Bold key phrases within sentences for emphasis.
  6. ENDING: A provocative, mentorship-style final thought based on the user's specific experience.
  7. CTA: Natural bridge to ${inputs.websiteUrl}.
  8. FAQs: 3-5 questions with blunt, exact answers.

  USER-PROVIDED EEAT CONTEXT:
  ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}`;

  const prompt = `
    TASK: Write a master-level blog post where you act as the expert defined in the EEAT context.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words

    MANDATORY SEQUENCE:
    1. H1 Title
    2. Bolded AI Overview (~500 chars)
    3. ## Introduction:
    4. Narrative Body (H2-H5) reflecting the provided EEAT persona
    5. Ending
    6. CTA
    7. FAQs

    OUTPUT FORMAT: Return ONLY valid JSON.
    {
      "metaTitle": "Title including primary keyword",
      "metaDescription": "Description including primary keyword",
      "content": "Full markdown content optimized with the specified EEAT persona",
      "humanConfidence": 99
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
            humanConfidence: { type: Type.INTEGER }
          },
          required: ["metaTitle", "metaDescription", "content", "humanConfidence"]
        },
        temperature: 0.95,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    const data = JSON.parse(text);
    const textMetrics = analyzeText(data.content || "");

    return {
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      sources: [],
      metrics: textMetrics
    };
  } catch (error: any) {
    console.error("Gemini Architect Error:", error);
    throw error;
  }
};
