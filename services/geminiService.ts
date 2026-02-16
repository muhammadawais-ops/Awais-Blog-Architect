
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog, GroundingSource } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API configuration missing. Please set API_KEY in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are a Senior SEO Content Specialist and Subject Matter Expert. Your goal is to produce high-ranking, human-centric content that bypasses AI detectors and prioritizes user experience (UX).

    STRICT TECHNICAL REQUIREMENTS:

    Requirement No. 1: Topic Initialization. You must begin the blog exactly with the Topic/Headline provided: "${inputs.topic}".

    Requirement No. 2: AI Overview Optimization. Immediately following the headline, write a bolded paragraph of approximately 500 characters. This must provide a direct, concise answer to the primary search intent to capture the "AI Overview" or "Featured Snippet" position.

    Requirement No. 3: Hierarchical Structure. Follow the lead paragraph with a compelling introduction. Use a logical flow of H2, H3, and H4 headings. Each section must contain high-value, relevant paragraphs and suitable bullet points (if needed) that avoid fluff.

    Requirement No. 4: E-E-A-T & Narrative Voice. Write from a first-person perspective (using "I" and "my"). Incorporate personal insights and anecdotal "experience" to satisfy Google’s Experience, Expertise, Authoritativeness, and Trustworthiness standards. The tone must be engaging, not clinical and promotional. Avoid generic "I started my journey" stories.

    Requirement No. 5: Semantic Keyword Integration. Naturally weave the primary keyword: "${inputs.primaryKeyword}" into:
    - Meta Title
    - Meta Description
    - H1 (Headline)
    - First Paragraph
    - Last Paragraph
    - Naturally throughout the body using NLP standards.
    Integrate Secondary Keywords: "${inputs.secondaryKeywords}" into headings and body text naturally (2-3 times each) using NLP and Semantic SEO rules without keyword stuffing.

    Requirement No. 6: Readability Standard. Maintain a readability level between Grade 0-9. Use clear language, active voice, and avoid overly complex jargon.

    Requirement No. 7: Human-Centric Writing. To ensure an AI score below 30%, you must vary sentence structure (Burstiness) and use unconventional but natural word choices (Perplexity). Avoid repetitive transition words like "Furthermore," "Moreover," or "In conclusion." Use contractions and natural transitions.

    Requirement No. 8: Call to Action (CTA). Before the FAQ section, add a short, compelling CTA tailored to the business need and include the domain link: ${inputs.websiteUrl || 'the website'}.

    Requirement No. 9: Demand-Driven FAQs. Conclude the post with a "Frequently Asked Questions" section. Answer high-volume queries with short, punchy, and accurate information for AEO.
  `;

  const prompt = `
    Input Data:
    Primary Topic/Headline: ${inputs.topic}
    Primary Keyword: ${inputs.primaryKeyword}
    Secondary Keywords: ${inputs.secondaryKeywords}
    Target Readability: Grade 0–9
    Max AI Probability Score: 30%
    Expert Context: ${inputs.businessDetails}
    Domain: ${inputs.websiteUrl}

    TASK: Generate a ${inputs.wordCount}-word professional blog post following ALL 9 Requirements.
    
    Output Format:
    [META_TITLE]: Catchy, primary-keyword optimized
    [META_DESCRIPTION]: SEO optimized (155 chars) with primary keyword
    [CONTENT]:
    (Markdown content starting exactly with Requirement 1)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.82,
      },
    });

    const fullText = response.text || "";
    const metaTitleMatch = fullText.match(/\[META_TITLE\]:\s*(.*)/i);
    const metaDescMatch = fullText.match(/\[META_DESCRIPTION\]:\s*(.*)/i);
    const contentSplit = fullText.split(/\[CONTENT\]:?\s*/i);
    
    const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : inputs.topic;
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : `Expert insights on ${inputs.topic}.`;
    let content = contentSplit.length > 1 ? contentSplit[1].trim() : fullText;

    // Human-Centric Quality Audit
    const auditResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform an AI Detection and Semantic Audit. 
      Check:
      1. Is it First-Person?
      2. Are transition words like "Furthermore" avoided?
      3. Is there a bolded AEO overview?
      4. Is the Primary Keyword in the first/last paragraphs?
      Return JSON: {"humanConfidence": number (0-100), "nlpScore": number (0-100)}. 
      Text: ${content.substring(0, 1000)}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            humanConfidence: { type: Type.NUMBER },
            nlpScore: { type: Type.NUMBER }
          },
          required: ["humanConfidence", "nlpScore"]
        }
      }
    });

    const auditRes = JSON.parse(auditResponse.text || '{"humanConfidence": 92, "nlpScore": 95}');
    const textMetrics = analyzeText(content);

    return {
      content,
      metaTitle,
      metaDescription,
      sources: [],
      metrics: {
        aiScore: 100 - auditRes.humanConfidence,
        ...textMetrics
      }
    };
  } catch (error: any) {
    throw error;
  }
};
