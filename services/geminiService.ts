
import { BlogInputs, GeneratedBlog } from "../types";

export const generateSemanticVariations = async (primaryKeyword: string): Promise<string[]> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'semantic_variations', primaryKeyword })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate variations");
  }

  const data = await response.json();
  return data.variations || [];
};

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs })
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      if (error.error === "API_KEY_MISSING") {
        throw new Error("API_KEY_MISSING");
      }
      throw new Error(error.error || "Failed to generate content");
    } else {
      const text = await response.text();
      console.error("Non-JSON error response:", text);
      if (text.includes("A server error occurred") || text.includes("Internal Server Error")) {
        throw new Error("The server encountered an error or timed out. This often happens if the AI takes too long to generate a long blog post. Please try a shorter word count or a simpler topic.");
      }
      throw new Error(text || "Failed to generate content (Server Error)");
    }
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    const text = await response.text();
    throw new Error("Expected JSON response but received: " + text.substring(0, 100));
  }
};
