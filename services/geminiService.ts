
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  // Initializing with the highly stable and high-limit Gemini 3 Flash model
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are an Elite Content Architect. 
  Your goal is to produce content that is indistinguishable from high-end human journalism.
  
  Writing Standards:
  - NO "AI-speak" (avoid words like: delve, essential, unlock, moreover, furthermore).
  - Voice: Experienced, opinionated, and first-person.
  - Structure: Start with a 40-50 word bolded summary that answers the user's intent immediately (AEO optimization).
  - Depth: Use specific anecdotal details based on the business context provided.`;

  const prompt = `
    TASK: Write a long-form, high-authority SEO blog post.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words
    CONTEXT: ${inputs.businessDetails}
    BRAND URL: ${inputs.websiteUrl}

    OUTPUT FORMAT: Must be valid JSON.
    {
      "metaTitle": "Highly engaging SEO title",
      "metaDescription": "Click-worthy meta description",
      "content": "The full blog in professional Markdown formatting",
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
        temperature: 0.8,
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
        aiScore: 100 - (data.humanConfidence || 99),
        ...textMetrics
      }
    };
  } catch (error: any) {
    console.error("Gemini Elite Engine Error:", error);
    throw error;
  }
};
