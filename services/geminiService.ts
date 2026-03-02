import { BlogInputs, GeneratedBlog } from "../types";

export const generateSEOContent = async (inputs: BlogInputs): Promise<GeneratedBlog> => {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate content");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
