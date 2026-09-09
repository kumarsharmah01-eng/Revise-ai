import { GoogleGenAI } from "@google/genai";
export const generateSummary = async (text) => {
  try {
    console.log("Checking Gemini API key...");
    console.log("Key exists:", !!process.env.GEMINI_API_KEY);
    console.log("Key length:", process.env.GEMINI_API_KEY?.length);
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not loaded");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: ` You are Revise-AI, an AI study assistant. Create a clear and concise summary of the following study material.
       Rules: 
        - Use simple language
        - Keep all important concepts 
        - Use headings and bullet points 
        - Remove unnecessary repetition 
        - Make it useful for exam revision 
        - Do not add information that is not present in the study material Study Material: ${text} `,
    });
    console.log("Gemini response received");

    return response.text;
  } catch (error) {
    console.error("AI Generator Error:", error);
    throw new Error(error?.message || "Failed to generate summary");
  }
};
