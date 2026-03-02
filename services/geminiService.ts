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
      let errorMessage = `Server Error (${response.status})`;
      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text.substring(0, 200) || errorMessage;
        }
      } catch (e) {
        errorMessage = "Network error or server unreachable";
      }
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse success response as JSON:", responseText);
      throw new Error("The server returned a successful status but the content was not valid JSON. This might be a temporary platform glitch.");
    }
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
