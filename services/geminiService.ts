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
      let errorMessage = "Failed to generate content";
      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        errorMessage = "Network error or server unreachable";
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
