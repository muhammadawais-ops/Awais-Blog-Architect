
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInputs, GeneratedBlog, GroundingSource } from "../types";
import { analyzeText } from "../utils/textAnalysis";
import { EEAT_GUIDELINES } from "./eeatGuidelines";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
  ${EEAT_GUIDELINES}

  ADDITIONAL CONTEXT & RULES:
  - EEAT Context: ${inputs.businessDetails || "Senior SEO Content Strategist with 20 years of experience."}
  - Target Website: ${inputs.websiteUrl}
  
  LANGUAGE & ENGAGEMENT (STRICT):
  - Language: Use extremely simple, clear, and conversational English (Grade 3-4 level).
  - Pain Points: Start by immediately addressing the reader's specific pain points.
  
  RESEARCH & LINKING (CRITICAL):
  - EXTERNAL LINKS: Use placeholders like [[EXT_1]], [[EXT_2]] in text. Provide mapping in "externalCitations" JSON field.
  - INTERNAL LINKS: Search for 2-3 relevant pages from ${inputs.websiteUrl} using "site:${inputs.websiteUrl} ${inputs.topic}".
  - NATURAL INTEGRATION: Naturally mention the Target Website (${inputs.websiteUrl}) 2-3 times within the body content. Do NOT be salesy. Mention it as a helpful resource, a case study, or a source of expertise.
  
  KEYWORD STRATEGY:
  - PRIMARY KEYWORD: "${inputs.primaryKeyword}" (Title, Meta, H1, Intro, Body, Conclusion).
  - SECONDARY KEYWORDS: "${inputs.secondaryKeywords}" (Semantic SEO).

  CONTENT STRUCTURE RULES (NON-NEGOTIABLE):
  1. H1 TITLE: Catchy, personal, includes primary keyword.
  2. **AI OVERVIEW (CRITICAL)**: The very first paragraph after H1 must be **BOLDED**. It MUST be a blunt, direct, and simple answer to the user's main query or topic. No fluff, no "In this blog...", no filler. Just the direct answer in extremely clear language. (~300-500 characters).
  3. INTRODUCTION HEADING: Use "## Introduction:". Start by addressing the reader's pain points.
  4. BODY: Use H2, H3, H4, and H5 hierarchically. Short paragraphs citing authoritative data.
  5. ORGANIC FORMATTING: Bold key phrases.
  6. FINAL INSIGHT HEADING: Professional dynamic heading (Unique & Professional).
  7. PROFESSIONAL BRIDGE (CTA): Professional dynamic bridge to ${inputs.websiteUrl}.
  8. FAQs: 3-5 questions with blunt, exact answers.
  `;

  const prompt = `
    TASK: Write a master-level blog post that is simple, engaging, and authoritative.
    TOPIC: ${inputs.topic}
    PRIMARY KEYWORD: ${inputs.primaryKeyword}
    SECONDARY KEYWORDS: ${inputs.secondaryKeywords}
    TARGET LENGTH: ${inputs.wordCount} words (STRICTLY MATCH THIS WORD COUNT)
    TARGET WEBSITE: ${inputs.websiteUrl}
    
    CITATION & LINKING SYSTEM (CRITICAL):
    1. Use Google Search to find 3-4 high-authority external sources (Forbes, Wikipedia, HBR, TechCrunch, etc.).
    2. In the "content" field, DO NOT write the full markdown link. Instead, use placeholders like [[EXT_1]], [[EXT_2]], [[EXT_3]], [[EXT_4]].
    3. Place these placeholders naturally within the sentences where the information is cited.
    4. TARGET DOMAIN INTEGRATION: Naturally weave the Target Website (${inputs.websiteUrl}) into the content 2-3 times. It should feel like a natural recommendation or a reference to expert advice, NOT an advertisement.
    5. In the "externalCitations" field of the JSON, provide the details for each placeholder.

    MANDATORY REQUIREMENTS: 
    - START WITH PAIN POINTS: The introduction must immediately resonate with the reader's struggles.
    - SIMPLE LANGUAGE: Write so an 8-year-old (3rd/4th grade) can understand perfectly.
    - BOLDED ANSWER: The first paragraph after H1 must be a bolded, direct answer to the topic.
    - DEEP EEAT INTEGRATION: Use the provided EEAT Context to inject authority and a unique professional voice.
    - INTERACTIVE: Use rhetorical questions and engaging transitions.

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
