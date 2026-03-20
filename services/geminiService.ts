
import { BlogInputs, GeneratedBlog } from "../types";

/**
 * Calls the backend API to generate SEO-optimized blog content.
 * This approach keeps the API key secure on the server.
 */
export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputs),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("API Error (generateSEOContent):", error);
    throw error;
  }
};

/**
 * Calls the backend API to generate semantic variations.
 */
export const generateSemanticVariations = async (primaryKeyword: string): Promise<string[]> => {
  try {
    const response = await fetch("/api/variations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ primaryKeyword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.variations || [];
  } catch (error: any) {
    console.error("API Error (generateSemanticVariations):", error);
    return []; // Return empty list on error
  }
};
