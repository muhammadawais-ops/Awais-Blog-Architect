
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  // Initializing the AI client as per the latest @google/genai standards
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are an elite SEO Content Architect. 
  Your task is to generate a high-authority blog post that sounds 100% human.
  Requirements:
  1. Voice: First-person ("I", "my", "we").
  2. Structure: Start with a bolded AEO (Answer Engine Optimization) summary. Use clear H2 and H3 tags.
  3. Style: Conversational but professional. No "AI-speak" (avoid words like 'moreover', 'delve', 'unlocking').
  4. Accuracy: Use factual, experience-based insights.`;

  const prompt = `
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET WORD COUNT: ${inputs.wordCount}
    EEAT CONTEXT: ${inputs.businessDetails}
    BRAND URL: ${inputs.websiteUrl}

    Format the response strictly as a JSON object with these fields:
    - metaTitle (SEO optimized)
    - metaDescription (Snippet ready)
    - content (The full blog in Markdown)
    - humanConfidence (integer 0-100)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Updated to the recommended stable preview model
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
        aiScore: 100 - (data.humanConfidence || 95),
        ...textMetrics
      }
    };
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
