
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog, GroundingSource } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are "Awais Blog Architect v8.0". You are a high-level industry expert in the specific niche provided by the user. 
    You write in the FIRST PERSON ("I", "My", "Our"). Your voice is authoritative, deeply professional, and reflects the unique culture of the niche.

    STRICT ANTI-SPAM WRITING RULES:
    1. NO CANNED OPENERS: Strictly avoid "I started my journey in...", "Back in [Year]...", "My career began when...", or "Welcome to my blog". 
    2. UNIQUE STARTERS: Start with a punchy industry reflection, a specific observation about a current trend, or a deep professional insight relevant to ${inputs.topic}.
    3. NICHE ADAPTATION: If the niche is construction, sound like a builder. If it's skincare, sound like a dermatologist or aesthetician. Do NOT default to a "Digital Marketer" persona unless that is the actual niche.
    4. AUTHORITY: Only mention specific years of experience if provided in the "Expert Context". If not provided, demonstrate authority through your technical knowledge and sophisticated vocabulary (BERT/MUM optimized).
    5. NO ROBOTIC CLICHÉS: Strictly forbid: "Let's be real", "Let's dive in", "Moreover", "Furthermore", "In summary", "Essential", "Crucial", "Unlock", "Tapestry".

    AEO OPTIMIZED FAQs:
    - End with an "Expert FAQ" section.
    - Questions must target high-value search intent.
    - Answers must be direct, clear, and snippet-ready (Direct Answer + Brief Context).
    - Maintain the first-person expert persona in answers.

    EEAT & READABILITY:
    - Use "I've often observed...", "In my practice...", "What most people overlook is...".
    - Target: Readability Grade 0-9 (The Green Signal).
    - Paragraphs: Natural, asymmetrical flow. No "AI-looking" walls of text.
  `;

  const prompt = `
    Topic: "${inputs.topic}"
    Keywords: ${inputs.primaryKeyword}, ${inputs.secondaryKeywords}
    Context: ${inputs.businessDetails}

    TASK:
    - Generate a ${inputs.wordCount}-word expert-led blog post in a raw, human, first-person voice.
    - DO NOT use generic "journey" or "history" introductions. Jump straight into the expert insight.
    - Include a direct 50-word "AI Overview" summary at the top (no "Here is a summary" intro).
    - Reference a specific scientific fact, industry study, or technical standard related to ${inputs.topic}.
    - End with 3-5 AEO-optimized FAQs.
    - No internal links. No promotional fluff.
    
    Output Format:
    [META_TITLE]: Catchy, expert-driven
    [META_DESCRIPTION]: SEO optimized (155 chars)
    [CONTENT]:
    Markdown content (AI Overview -> Body Content -> FAQs)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.82, // Slightly lowered for more consistent professional tone
      },
    });

    const fullText = response.text || "";
    const metaTitleMatch = fullText.match(/\[META_TITLE\]:\s*(.*)/i);
    const metaDescMatch = fullText.match(/\[META_DESCRIPTION\]:\s*(.*)/i);
    const contentSplit = fullText.split(/\[CONTENT\]:?\s*/i);
    
    const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : inputs.topic;
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : `Expert insights on ${inputs.topic}.`;
    let content = contentSplit.length > 1 ? contentSplit[1].trim() : fullText;

    const auditResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a Human-Authenticity Audit. 
      Does it sound like a generic AI? Are there clichés like "Let's be real" or "I started my journey"?
      Return JSON: {"humanCertainty": number (0-100)}. 
      Text: ${content.substring(0, 800)}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            humanCertainty: { type: Type.NUMBER }
          },
          required: ["humanCertainty"]
        }
      }
    });

    const auditRes = JSON.parse(auditResponse.text || '{"humanCertainty": 98}');
    const textMetrics = analyzeText(content);

    return {
      content,
      metaTitle,
      metaDescription,
      sources: [],
      metrics: {
        aiScore: 100 - auditRes.humanCertainty,
        ...textMetrics
      }
    };
  } catch (error: any) {
    throw error;
  }
};
