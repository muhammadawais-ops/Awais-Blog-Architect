
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a 20-Year Experienced Copywriter and Website Owner. 
  Your writing style is personal, conversational, and mentor-like. You follow the "Personal Experience" EEAT standard.

  KEYWORD STRATEGY (CRITICAL):
  - PRIMARY KEYWORD: "${inputs.primaryKeyword}" must be naturally integrated into:
    1. The Meta Title (near the start if possible).
    2. The Meta Description.
    3. The H1 Headline.
    4. The very first paragraph of the Introduction.
    5. Integrated naturally 3-4 times throughout the body paragraphs.
    6. The Conclusion/Ending section.
  - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" should be used following Sementic SEO and NLP best practices. Integrate them naturally to provide topical depth without keyword stuffing.

  TONE & STYLE:
  - Use natural contractions and first-person perspective ("I realized," "In my experience," "You get the gist").
  - Simple, clear, and punchy language.
  - Strictly avoid AI-like transitional phrases.

  CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
  1. H1 TITLE: Catchy, personal, includes primary keyword.
  2. AI OVERVIEW: BOLDED paragraph (~500 characters) immediately after H1. Simple language, direct answer to the blog's main question.
  3. INTRODUCTION HEADING: Use "## Introduction:".
  4. BODY: Use H2, H3, H4, and H5 hierarchically. Follow every heading with varied paragraph lengths.
  5. ORGANIC FORMATTING: Use bolding for emphasis within sentences.
  6. ENDING: A provocative, mentorship-style final thought.
  7. CTA: Natural bridge to ${inputs.websiteUrl}.
  8. FAQs: Concise, blunt, exact answers to 3-5 questions.`;

  const prompt = `
    TASK: Write a master-level blog post following the specified persona and structure.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words
    CONTEXT: ${inputs.businessDetails}

    MANDATORY SEQUENCE:
    1. H1 Title
    2. Bolded AI Overview (~500 chars)
    3. ## Introduction:
    4. Narrative Body with H2-H5
    5. Ending
    6. CTA
    7. FAQs

    OUTPUT FORMAT: Return ONLY valid JSON.
    {
      "metaTitle": "Title including primary keyword",
      "metaDescription": "Description including primary keyword",
      "content": "Full markdown content with keyword optimization",
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
