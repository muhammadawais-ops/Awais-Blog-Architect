
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog, GroundingSource } from "../types";
import { analyzeText } from "../utils/textAnalysis";
import { EEAT_GUIDELINES } from "./eeatGuidelines";

export const generateSemanticVariations = async (primaryKeyword: string): Promise<string[]> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") throw new Error("GEMINI_API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 4 semantic variations or LSI keywords for the primary keyword: "${primaryKeyword}". Return ONLY the variations as a comma-separated list.`,
    config: {
      temperature: 0.7,
      responseMimeType: "text/plain",
    },
  });

  const text = response.text;
  if (!text) return [];
  return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const isGuestPost = inputs.contentType === 'guest_post';

  const systemInstruction = `
  ${EEAT_GUIDELINES}

  ROLE: You are an ${isGuestPost ? "Expert Guest Post Writer (Teacher Persona)" : "Expert Senior SEO Content Strategist & Consultant (Closer Persona)"}.
  
  ADDITIONAL CONTEXT & RULES:
  - EEAT Context: ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}
  - Brand Name: ${inputs.brandName || "Our Agency"}
  - Target Website (Client): ${inputs.websiteUrl}
  ${isGuestPost ? `- Backlink Target: ${inputs.backlinkUrl} (Anchor: ${inputs.anchorText})` : ""}
  ${isGuestPost ? `- Host Website Context (Where this will be published): ${inputs.targetSiteContext}` : ""}
  
  LANGUAGE & ENGAGEMENT (STRICT):
  - Language: Use extremely simple, clear, and conversational English (Grade 3-4 level).
  - Pain Points: Start by immediately addressing the reader's specific pain points.
  - PARAGRAPHS: Keep paragraphs extremely short (2-3 sentences max). Avoid "walls of text".
  
  RESEARCH & LINKING (CRITICAL):
  - EXTERNAL LINKS: Use Google Search to find 3-4 high-authority external sources (Forbes, Wikipedia, HBR, TechCrunch, etc.). Use placeholders like [[EXT_1]], [[EXT_2]] in text.
  - INTERNAL LINKS: Search for 2-3 relevant pages from ${inputs.websiteUrl} using "site:${inputs.websiteUrl} ${inputs.topic}".
  - NATURAL INTEGRATION: Naturally mention the Target Website (${inputs.websiteUrl}) 2-3 times within the body content.
  ${isGuestPost ? `- GUEST POST BACKLINK: Naturally integrate a link to ${inputs.backlinkUrl} using anchor text "${inputs.anchorText}". It must feel 100% natural and non-salesy.` : ""}
  
  KEYWORD STRATEGY:
  - PRIMARY KEYWORD: "${inputs.primaryKeyword}" (Title, Meta, H1, Intro, Body, Conclusion).
  - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" (Semantic SEO).

  CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
  1. H1 TITLE: Catchy, personal, includes primary keyword.
  2. **AI OVERVIEW (CRITICAL)**: The very first paragraph after H1 must be **BOLDED**. It MUST be a blunt, direct, and simple answer to the user's main query or topic. No fluff. (~300-500 characters).
  
  ${isGuestPost ? `
  GUEST POST SPECIFICS (TEACHER PERSONA):
  - TONE: Neutral, Educational, Authority-based. Third-person perspective. Think: "I am a teacher, not a seller."
  - TOPIC SELECTION: Must be highly relevant to the host website niche (${inputs.targetSiteContext}) and informational, not sales-driven.
  - STRUCTURE:
    - Strong Introduction: Hook + Problem + Promise. Make the reader feel "This is for me".
    - Educational Body Content: Step-by-step guidance, actionable tips, and data/real insights (E-E-A-T).
    - Soft Brand Mention: Mention experience naturally (e.g., "In our experience at ${inputs.brandName || 'our agency'} working with small businesses..."). NO hard selling.
    - Soft Conclusion: Summarize the value provided.
    - Author Bio: Short, authority-based, includes the backlink to ${inputs.backlinkUrl} with anchor "${inputs.anchorText}" and a clear CTA.
  - AVOID: Hard selling, "Buy our service" tone, over-promotional language, keyword stuffing.
  ` : `
  BLOG POST SPECIFICS (CONSULTANT PERSONA):
  - TONE: Helpful, Persuasive, Clear, Simple, Conversational (US Tone). First-person perspective. Think: "I am a consultant who wants to close a client."
  - SEARCH INTENT: Identify if intent is Informational, Commercial, or Transactional. Structure strictly around solving the user's problem.
  - KEYWORD STRATEGY: Use Primary Keyword ("${inputs.primaryKeyword}") in H1, first 100 words, at least one H2, Meta Title, and Meta Description.
  - E-E-A-T: Demonstrate real experience with realistic examples, use-case scenarios, and specific outcomes (e.g., traffic growth). Avoid vague claims.
  - AUTHORITY: Include at least 2 data-backed insights or statistics (real data). Mention industry-standard practices/tools.
  - SEO ELEMENTS: 
    - Meta Title: 55-60 characters.
    - Meta Description: 140-155 characters, persuasive.
    - Internal Linking: Include placeholders like "[Insert internal link to service page]".
    - Image Placement: Include placeholders like "[Add image: Description]" with alt text suggestions.
  - STRUCTURE:
    - Hook: Engaging + problem-focused.
    - Introduction: Clear explanation + keyword.
    - Problem Section: Pain points.
    - Core Solution: Step-by-step actionable guidance.
    - Advanced Tips: To build authority.
    - Common Mistakes: Optional but valuable.
    - FAQ Section: 3-5 questions based on real search queries with blunt answers.
    - Conclusion: Summary + next steps.
    - Strong CTA: Benefit-driven, mentions service value, addresses pain, encourages action.
  - GOAL: Problem -> Solution -> Action.
  `}
  
  FAQs: 3-5 questions with blunt, exact answers.
  `;

  const prompt = `
    TASK: Write a master-level ${isGuestPost ? "GUEST POST" : "BLOG POST"} that is simple, engaging, and authoritative.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words (STRICTLY MATCH THIS WORD COUNT)
    TARGET WEBSITE: ${inputs.websiteUrl}
    ${isGuestPost ? `BACKLINK: ${inputs.backlinkUrl} with anchor "${inputs.anchorText}"` : ""}
    
    CITATION & LINKING SYSTEM (CRITICAL):
    1. Use Google Search to find 3-4 high-authority external sources.
    2. In the "content" field, use placeholders like [[EXT_1]], [[EXT_2]], etc.
    3. TARGET DOMAIN INTEGRATION: Naturally weave ${inputs.websiteUrl} into the content.
    4. In the "externalCitations" field of the JSON, provide the details for each placeholder.
    ${isGuestPost ? `5. BACKLINK INTEGRATION: Add a natural link to ${inputs.backlinkUrl} using anchor text "${inputs.anchorText}" in the Author Bio section.` : ""}

    MANDATORY REQUIREMENTS: 
    - START WITH PAIN POINTS: Immediate resonance with reader struggles.
    - SIMPLE LANGUAGE: Grade 3-4 level.
    - BOLDED ANSWER: First paragraph after H1.
    - DEEP EEAT INTEGRATION: Use provided context.
    - SHORT PARAGRAPHS: Max 3 sentences.
    - ${isGuestPost ? "GUEST POST STYLE: Educational, Teacher Persona, Third-person, Soft brand mention, Author Bio with backlink." : "BLOG POST STYLE: Persuasive, Consultant Persona, First-person, Keyword-focused, Strong CTA, Search Intent focused."}
    - SEO: Meta Title (55-60 chars), Meta Description (140-155 chars), Internal link placeholders, Image placeholders with alt text.

    OUTPUT FORMAT: Return ONLY valid JSON.
    {
      "metaTitle": "Title including primary keyword",
      "metaDescription": "Description including primary keyword",
      "content": "Full markdown content. Use placeholders like [[EXT_1]] for external links.",
      "externalCitations": [
        { "placeholder": "[[EXT_1]]", "siteName": "Forbes", "url": "https://forbes.com/..." },
        { "placeholder": "[[EXT_2]]", "siteName": "Wikipedia", "url": "https://en.wikipedia.org/..." }
      ],
      "humanConfidence": 99
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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
            externalCitations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  placeholder: { type: Type.STRING },
                  siteName: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["placeholder", "siteName", "url"]
              }
            },
            humanConfidence: { type: Type.INTEGER }
          },
          required: ["metaTitle", "metaDescription", "content", "externalCitations", "humanConfidence"]
        },
        temperature: 0.85,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    const data = JSON.parse(text);
    
    // Inject Citations into content
    let finalContent = data.content || "";
    const sources: GroundingSource[] = [];

    if (data.externalCitations && Array.isArray(data.externalCitations)) {
      data.externalCitations.forEach((citation: any) => {
        if (citation.placeholder && citation.url) {
          const markdownLink = `[${citation.siteName || "Source"}](${citation.url})`;
          // Replace all occurrences of the placeholder
          finalContent = finalContent.split(citation.placeholder).join(markdownLink);
          
          // Add to sources list if not already there
          if (!sources.find(s => s.uri === citation.url)) {
            sources.push({
              title: citation.siteName || "Reference Source",
              uri: citation.url
            });
          }
        }
      });
    }

    const textMetrics = analyzeText(finalContent);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Add grounding chunks to sources if they aren't already included
    for (const chunk of groundingChunks) {
      if (chunk.web && chunk.web.uri) {
        if (!sources.find(s => s.uri === chunk.web?.uri)) {
          sources.push({
            title: chunk.web.title || "Reference Source",
            uri: chunk.web.uri as string
          });
        }
      }
    }

    return {
      content: finalContent,
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
