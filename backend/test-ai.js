import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

console.log("Key exists:", !!process.env.GEMINI_API_KEY);
console.log("Key length:", process.env.GEMINI_API_KEY?.length);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

try {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: "Say hello in one short sentence.",
  });

  console.log("GEMINI RESPONSE:");
  console.log(response.text);
} catch (error) {
  console.error("GEMINI ERROR:");
  console.error(error.message);
}
