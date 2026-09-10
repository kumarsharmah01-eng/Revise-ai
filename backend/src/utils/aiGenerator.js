import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not loaded");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

// ===============================
// TEXT / PDF SUMMARY
// ===============================
export const generateSummary = async (text) => {
  try {
    const ai = getAI();

    console.log("Calling Gemini for text summary...");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `
You are Revise-AI, an AI study assistant.

Create a clear and concise summary of the following study material.

Rules:
- Use simple language
- Keep all important concepts
- Use headings and bullet points
- Remove unnecessary repetition
- Make it useful for exam revision
- Do not add information that is not present in the study material

Study Material:
${text}
      `,
    });

    console.log("Gemini text summary received");

    return response.text;
  } catch (error) {
    console.error("AI Generator Error:", error);
    throw new Error(error?.message || "Failed to generate summary");
  }
};

// ===============================
// IMAGE SUMMARY
// ===============================
export const extractTextFromImage = async (imagePath, mimeType) => {
  try {
    const ai = getAI();

    console.log("Extracting text from image:", imagePath);

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
        {
          text: `
You are Revise-AI, an AI study assistant.

Extract ALL useful study content from this image.

Rules:
- Read the image carefully.
- Extract all visible text.
- Preserve important definitions, concepts, facts, formulas and examples.
- If there are headings, keep them.
- If there are bullet points, preserve them.
- If the image contains handwritten notes, read them as accurately as possible.
- Do NOT summarize.
- Do NOT add information.
- Return ONLY the extracted study material as plain text.
          `,
        },
      ],
    });

    console.log("Image text extraction successful");

    return response.text;
  } catch (error) {
    console.error("Image Text Extraction Error:", error);

    throw new Error(error?.message || "Failed to extract text from image");
  }
};

// ===============================
// QUIZ GENERATION
// ===============================
export const generateQuiz = async (text) => {
  try {
    const ai = getAI();

    console.log("Calling Gemini for quiz generation...");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `
You are Revise-AI, an AI study assistant.

Create a quiz based ONLY on the study material provided below.

Generate exactly 10 multiple-choice questions.

Rules:
- Each question must have exactly 4 options.
- Only one option should be correct.
- Include the correct answer.
- Include a short explanation.
- Questions should be useful for exam preparation.
- Mix easy, medium and hard questions.
- Do not add information that is not present in the study material.
- Do not repeat questions.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add any text before or after the JSON.

Required JSON format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Correct option",
      "explanation": "Short explanation"
    }
  ]
}

Study Material:
${text}
      `,

      config: {
        responseMimeType: "application/json",
      },
    });

    console.log("Gemini quiz response received");

    const quiz = JSON.parse(response.text);

    return quiz;
  } catch (error) {
    console.error("Quiz Generator Error:", error);

    throw new Error(error?.message || "Failed to generate quiz");
  }
};
