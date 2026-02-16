
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  // Initialize the AI client using the Pro model requested by the user
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a Senior Content Architect & SEO Strategist. 
  Your specialty is Gemini 2.5 Pro reasoning to craft deep, human-sounding content.
  EEAT Guidelines:
  - Voice: Natural First-Person ("I have found", "In my experience").
  - Structure: Start with an AEO-ready bolded paragraph (the 'Answer').
  - Vocabulary: Varied, avoiding repetitive AI connectors.
  - Accuracy: Grounded in logical expertise.`;

  const prompt = `
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    WORD COUNT GOAL: ${inputs.wordCount} words
    BUSINESS CONTEXT: ${inputs.businessDetails}
    URL REFERENCE: ${inputs.websiteUrl}

    REQUIREMENT: Produce a complete, high-authority blog post.
    
    Output Format (JSON):
    {
      "metaTitle": "Catchy, SEO-optimized title",
      "metaDescription": "Snippet-ready description",
      "content": "Full blog in Markdown format",
      "humanConfidence": 98
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-preview-01-2025",
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
      metrics: {
        aiScore: 100 - (data.humanConfidence || 95),
        ...textMetrics
      }
    };
  } catch (error: any) {
    console.error("Gemini Pro API Error:", error);
    throw error;
  }
};
