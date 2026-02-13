
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog, GroundingSource } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  // Using the GoogleGenAI instance with the API key from environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are "Awais Blog Architect", a world-class SEO and AEO Content Strategist. 
    You write like an expert human who values simplicity, clarity, and direct answers.

    STRICT CONSTRAINTS - FAIL IF NOT FOLLOWED:
    1. READABILITY: Use Hemingway Grade 8 language or LOWER. This is non-negotiable. Use small words. Use short sentences. No "corporate jargon". If a 12-year-old can't understand it, rewrite it.
    2. META DESCRIPTION: Must be exactly 150 to 160 characters long.
    3. WORD COUNT: You MUST reach at least ${inputs.wordCount} words. Use detailed examples and expert commentary to add length, never fluff.
    4. STRUCTURE:
       - H1: Catchy title with "${inputs.primaryKeyword}".
       - INTRO: A 40-50 word "Answer Box" paragraph that directly answers the main question to get featured in Google AI Overviews.
       - BODY: Exactly 2-3 H2 sections. Use H3 and H4 for sub-points. Use bullet points for all lists.
       - CONCLUSION: A summary of the expert's view.
       - CTA: A natural, helpful call to action related to "${inputs.websiteUrl}".
       - FAQs: 4-5 high-value questions with direct answers.
    5. INTERNAL LINKING:
       - Do NOT link to the homepage (/). 
       - Use the googleSearch tool with "site:${inputs.websiteUrl} ${inputs.topic}" to find SPECIFIC blog posts or service pages.
       - Link to at least 3 unique sub-pages naturally.
    6. EXTERNAL LINKING:
       - Use the googleSearch tool to find high-authority references (Forbes, Statista, .gov, .edu). 
       - Cite them as external links when mentioning facts or data.
    
    TONE & VOICE:
    - Use the PAS (Problem, Agitation, Solution) framework.
    - Be conversational. Use "I", "You", and "We". 
    - No "AI-speak" (e.g., "In the digital age", "Unlock the potential", "Delve").
  `;

  const prompt = `
    Write a blog post for "${inputs.topic}" that is ${inputs.wordCount} words long.
    Primary Keyword: ${inputs.primaryKeyword}
    Secondary Keywords: ${inputs.secondaryKeywords}
    Website: ${inputs.websiteUrl}
    Context: ${inputs.businessDetails}

    Instructions:
    - Find deep internal links on ${inputs.websiteUrl} using search.
    - Write for Grade 8 readability.
    - Ensure the Meta Description is strictly 150-160 characters.
    - Follow the H1 -> Intro (AEO) -> H2/H3 -> Conclusion -> CTA -> FAQ structure.

    Output format:
    [META_TITLE]: Title here
    [META_DESCRIPTION]: 150-160 characters here
    [CONTENT]:
    Markdown content here
  `;

  try {
    // Basic Text Tasks (e.g., summarization, proofreading, and simple Q&A): 'gemini-3-flash-preview'
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const fullText = response.text || "";
    const metaTitleMatch = fullText.match(/\[META_TITLE\]:\s*(.*)/i);
    const metaDescMatch = fullText.match(/\[META_DESCRIPTION\]:\s*(.*)/i);
    const contentSplit = fullText.split(/\[CONTENT\]:?\s*/i);
    
    const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : `${inputs.topic}`;
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : `Expert advice on ${inputs.topic}.`;
    let content = contentSplit.length > 1 ? contentSplit[1].trim() : fullText;
    
    content = content.replace(/[\u2013\u2014]/g, '-');

    // Using responseSchema for JSON response as recommended by guidelines
    const analysisResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Rate the human quality of this text from 0 to 100. Return JSON: {"humanPercent": number} 
      Text: ${content.substring(0, 1000)}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            humanPercent: {
              type: Type.NUMBER,
              description: "Percentage of human likeness from 0 to 100."
            }
          },
          required: ["humanPercent"]
        }
      }
    });

    // Directly accessing .text property (not a method)
    const aiRes = JSON.parse(analysisResponse.text || '{"humanPercent": 98}');
    const textMetrics = analyzeText(content);

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({ title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri });
        }
      });
    }

    return {
      content,
      metaTitle,
      metaDescription,
      sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()),
      metrics: {
        aiScore: aiRes.humanPercent,
        ...textMetrics
      }
    };
  } catch (error: any) {
    if (error.message?.includes('429')) {
      throw new Error("API Quota Exhausted. Please wait a minute or upgrade to a paid plan in Google AI Studio.");
    }
    console.error("Architect Error:", error);
    throw error;
  }
};
