
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a Senior Specialist and Subject Matter Expert. 
  Your background and professional niche are strictly defined by the "EEAT Context" provided by the user. 
  
  READABILITY RULE (STRICT):
  - Target Readability: Grade 7 to Grade 9.
  - Sentence Structure: Short and punchy. No long, academic, or corporate jargon.
  - Active Voice: Use active voice 90% of the time.

  KEYWORD STRATEGY (LOCKED):
  - PRIMARY KEYWORD: "${inputs.primaryKeyword}" must be naturally integrated into:
    1. The Meta Title (near the start).
    2. The Meta Description.
    3. The H1 Headline.
    4. The first paragraph of the Introduction.
    5. Integrated naturally 3-4 times in body content.
    6. The Conclusion/Final Insight section.
  - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" must use Semantic SEO and NLP best practices.

  CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
  1. H1 TITLE: Catchy, personal, includes primary keyword.
  2. AI OVERVIEW: BOLDED paragraph (~500 characters) immediately after H1. Direct answer to the search intent.
  3. INTRODUCTION HEADING: Use "## Introduction:".
  4. BODY: Use H2, H3, H4, and H5 hierarchically. Short paragraphs.
  5. ORGANIC FORMATTING: Bold key phrases within sentences.
  6. FINAL INSIGHT HEADING: DO NOT use the word "Ending" or "Conclusion". Instead, generate a short, valuable, and powerful heading that summarizes the expert's final wisdom (e.g., "The Bottom Line," "My Parting Advice," or niche-specific wisdom).
  7. PROFESSIONAL BRIDGE (CTA): DO NOT use the word "CTA" or "Call to Action". Create a natural, non-salesy heading that invites the reader to explore more on ${inputs.websiteUrl} (e.g., "Ready to Take the Next Step?", "Where We Go From Here," or "Deepen Your Expertise").
  8. FAQs: 3-5 questions with blunt, exact answers.

  TONE & STYLE:
  - Conversational, personal, and mentor-like. 
  - Adopt the persona from the EEAT context completely.
  - Strictly avoid AI-isms like 'delve', 'tapestry', 'unlock', 'comprehensive'.

  USER-PROVIDED EEAT CONTEXT:
  ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}`;

  const prompt = `
    TASK: Write a master-level blog post following the EEAT persona and the Grade 9 readability limit.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words

    MANDATORY SEQUENCE:
    1. H1 Title
    2. Bolded AI Overview (~500 chars)
    3. ## Introduction:
    4. Narrative Body (H2-H5)
    5. Dynamic Final Insight Heading (Unique & Professional)
    6. Dynamic Bridge/CTA Heading (Non-salesy)
    7. FAQs

    OUTPUT FORMAT: Return ONLY valid JSON.
    {
      "metaTitle": "Title including primary keyword",
      "metaDescription": "Description including primary keyword",
      "content": "Full markdown content with Grade 9 readability and professional dynamic headings",
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
        temperature: 0.9,
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
