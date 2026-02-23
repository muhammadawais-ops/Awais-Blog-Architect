
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog, GroundingSource } from "../types";
import { analyzeText } from "../utils/textAnalysis";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a Senior Specialist and Subject Matter Expert with real-time research capabilities. 
  Your background, professional voice, and niche authority are strictly defined by the "EEAT Context" provided below. 

  EEAT & PERSONAL BRANDING RULE (CRITICAL):
  - You MUST adopt the persona described in the EEAT Context. 
  - Weave specific experiences, anecdotal insights, and the unique perspective of the business owner into the narrative.
  - The content should not just be informative; it must feel like it was written by a veteran with "skin in the game."
  - Show, don't just tell, the Expertise, Authoritativeness, and Trustworthiness.
  
  LANGUAGE & ENGAGEMENT RULE (STRICT):
  - Language: Use simple, clear, and conversational English. Avoid complex jargon. It must be accessible to a layman while remaining valuable to an expert.
  - Tone: Interactive, engaging, and empathetic. Use "You" and "I" to create a connection.
  - Pain Points: Start the blog by immediately addressing the reader's specific pain points related to the topic. Make them feel understood.

  RESEARCH & LINKING RULE (CRITICAL):
  - EXTERNAL LINKS: Use Google Search to find real-time data, statistics, and insights from high-authority sites (Forbes, HBR, industry leaders). Cite them naturally [Source Name](URL).
  - INTERNAL LINKING BEST PRACTICES (MANDATORY): Use Google Search to find 3-8 relevant pages or blog posts from the user's website: ${inputs.websiteUrl}.
    - Search Query: "site:${inputs.websiteUrl} ${inputs.topic}"
    - STRATEGY:
      1. Descriptive Anchor Text: Use descriptive phrases that tell users and search engines what the target page is about. NEVER use "click here" or "read more."
      2. Relevance: Only link to pages contextually related to the current section.
      3. Priority Placement: Place at least one internal link high up in the introduction or first H2 section.
      4. Silo Structure: Link to pillar pages or relevant cluster topics to strengthen topical authority.
      5. Balance: Aim for 3-8 internal links per 1,000 words.
      6. Dofollow: Ensure links are standard Markdown links to pass authority.
  - DO NOT make up URLs. Only use the ones found during the search.

  READABILITY RULE (STRICT):
  - Target Readability: Grade 7 to Grade 9.
  - Sentence Structure: Short and punchy. No long, academic, or corporate jargon.
  - Active Voice: Use active voice 90% of the time.

  KEYWORD STRATEGY (LOCKED):
  - PRIMARY KEYWORD: "${inputs.primaryKeyword}" must be naturally integrated into Title, Meta, H1, first para, body, and Conclusion.
  - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" must use Semantic SEO.

  CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
  1. H1 TITLE: Catchy, personal, includes primary keyword.
  2. **AI OVERVIEW (CRITICAL)**: The very first paragraph after H1 must be **BOLDED**. It MUST be a blunt, direct, and simple answer to the user's main query or topic. No fluff, no "In this blog...", no filler. Just the direct answer in extremely clear language. (~300-500 characters).
  3. INTRODUCTION HEADING: Use "## Introduction:". Start by addressing the reader's pain points.
  4. BODY: Use H2, H3, H4, and H5 hierarchically. Short paragraphs citing authoritative data.
  5. ORGANIC FORMATTING: Bold key phrases.
  6. CONCLUSION HEADING: Use a professional, dynamic heading for the conclusion (e.g., "## Final Verdict:", "## The Bottom Line:", "## Conclusion:"). Summarize the key takeaways.
  7. CALL TO ACTION HEADING: Use a clear heading for the CTA (e.g., "## Ready to Level Up?", "## Take Action Now:"). Provide a professional bridge and link to ${inputs.websiteUrl}.
  8. FAQs: 3-5 questions with blunt, exact answers.

  USER-PROVIDED EEAT CONTEXT (USE THIS TO SHAPE THE VOICE):
  ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}`;

  const prompt = `
    TASK: Write a master-level blog post that is simple, engaging, and authoritative.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words
    TARGET WEBSITE: ${inputs.websiteUrl}

    MANDATORY REQUIREMENTS: 
    - START WITH PAIN POINTS: The introduction must immediately resonate with the reader's struggles.
    - SIMPLE LANGUAGE: Write so a 12-year-old can understand, but an expert finds it insightful.
    - EXTERNAL LINKS: Cite 2-3 high-authority external sources with direct links.
    - INTERNAL LINKS (ELITE STRATEGY): Search for and include 3-8 relevant internal links from ${inputs.websiteUrl}. Use descriptive anchor text, prioritize high placement, and follow a silo/cluster logic.
    - BOLDED ANSWER: The first paragraph after H1 must be a bolded, direct answer to the topic.
    - DEEP EEAT INTEGRATION: Use the provided EEAT Context to inject authority and a unique professional voice.
    - INTERACTIVE: Use rhetorical questions and engaging transitions.
    - CONCLUSION & CTA: End with a dedicated "Conclusion" section and a "Call to Action" section, both with clear, professional headings.

    OUTPUT FORMAT: Return ONLY valid JSON.
    {
      "metaTitle": "Title including primary keyword",
      "metaDescription": "Description including primary keyword",
      "content": "Full markdown content with Grade 9 readability, professional dynamic headings, authoritative external links, and a direct bolded answer at the start",
      "humanConfidence": 99
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
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
        temperature: 0.85,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    const data = JSON.parse(text);
    const textMetrics = analyzeText(data.content || "");

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = [];
    
    // Using a for-of loop to handle null checks and satisfy TypeScript's strict checks
    for (const chunk of groundingChunks) {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || "Reference Source",
          uri: chunk.web.uri as string
        });
      }
    }

    return {
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      sources,
      metrics: textMetrics
    };
  } catch (error: any) {
    console.error("Gemini Architect Error:", error);
    throw error;
  }
};
