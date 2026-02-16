
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
  Your writing style is derived from the "Personal Experience" EEAT standard. You write as if you are talking directly to a friend, sharing what you've learned through years of trial and error.

  TONE & STYLE (STRICT):
  - CONVERSATIONAL: Use phrases like "You get the gist," "Why bother?", "Here's the deal," and "I've seen this happen."
  - PERSONAL NARRATIVE: Share insights as personal realizations. "I realized that..." or "In my experience..."
  - SIMPLE LANGUAGE: Avoid complex jargon. Use punchy, active verbs.
  - NO AI-ISMS: No 'delve', 'unlock', 'tapestry', 'comprehensive', 'it is important to note'.
  - ADDRESS THE READER: Use "You" frequently. Ask rhetorical questions.

  CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
  1. H1 TITLE: Catchy, personal, and benefit-driven.
  2. AI OVERVIEW: Immediately after H1, provide a BOLDED paragraph (approx. 500 characters). This must be very simple, to-the-point, and answer the search intent directly.
  3. INTRODUCTION HEADING: You MUST use the heading "## Introduction:".
  4. INTRODUCTION CONTENT: Start with a narrative hook. Explain why this topic matters right now.
  5. HIERARCHY: Use H2, H3, H4, and H5. Every heading must be followed by content that feels shared from a first-person perspective.
  6. ORGANIC FLOW: Vary paragraph lengths. Use bolding within paragraphs for emphasis (like the reference blog).
  7. BULLETS: Use them for scenarios or lists, keeping them brief and practical.
  8. PERFECT ENDING: End with a provocative thought or a summary that feels like a mentor's final advice.
  9. CTA: A natural, strategic call to action linked to ${inputs.websiteUrl}.
  10. FAQs: Provide 3-5 FAQs with exact, blunt, and to-the-point answers.

  EEAT FOCUS:
  - Demonstrate hands-on experience. 
  - Mention specific scenarios (e.g., "Let's take two scenarios:").
  - Use "I" and "We" to establish ownership of the advice.`;

  const prompt = `
    TASK: Architect a master-level blog post using the 20-year copywriter persona.
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
      "metaTitle": "Title",
      "metaDescription": "Description",
      "content": "Full markdown content following the exact structure above",
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
