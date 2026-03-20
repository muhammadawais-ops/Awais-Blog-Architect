
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
    const error = await response.json();
    if (error.error === "API_KEY_MISSING") {
      throw new Error("API_KEY_MISSING");
    }
    throw new Error(error.error || "Failed to generate content");
  }

  return await response.json();
};
