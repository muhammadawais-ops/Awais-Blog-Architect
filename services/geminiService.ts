
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("CRITICAL: API_KEY is missing in environment. Please check Vercel settings.");
  }

  // Creating instance right before call as per guidelines
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a Senior SEO Content Specialist. 
  Generate a professional blog post and a quality audit in a single JSON response.
  Follow these rules:
  1. Use First-Person voice ("I", "my").
  2. Include a bolded AEO overview paragraph first.
  3. Use H2, H3 headings.
  4. Avoid AI transition words (Furthermore, Moreover).
  5. Target readability Grade 0-9.`;

  const prompt = `
    Generate a blog about: ${inputs.topic}
    Primary Keyword: ${inputs.primaryKeyword}
    Secondary Keywords: ${inputs.secondaryKeywords}
    Word Count: ${inputs.wordCount}
    Business Context: ${inputs.businessDetails}
    Domain: ${inputs.websiteUrl}

    Return strictly in this JSON structure:
    {
      "metaTitle": "SEO title",
      "metaDescription": "155 chars description",
      "content": "Full markdown blog content starting with headline",
      "humanConfidence": 0-100 score
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-latest", // Most stable production model
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
            humanConfidence: { type: Type.NUMBER }
          },
          required: ["metaTitle", "metaDescription", "content", "humanConfidence"]
        },
        temperature: 0.75,
      },
    });

    const data = JSON.parse(response.text || '{}');
    const textMetrics = analyzeText(data.content || "");

    return {
      content: data.content || "Generation failed. Please try again.",
      metaTitle: data.metaTitle || inputs.topic,
      metaDescription: data.metaDescription || "Expert insights.",
      sources: [],
      metrics: {
        aiScore: 100 - (data.humanConfidence || 90),
        ...textMetrics
      }
    };
  } catch (error: any) {
    // Pass the real error up for better debugging
    throw error;
  }
};
