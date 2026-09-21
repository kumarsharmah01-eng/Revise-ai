import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not loaded");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    // Fail after 60s instead of hanging until undici's headers timeout
    httpOptions: { timeout: 60000 },
  });
};

// ===============================
// RETRY + FALLBACK HELPER
// ===============================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (err) => {
  const msg = String(err?.message || "");
  const causeCode = err?.cause?.code || "";

  return (
    [429, 500, 503, 504].includes(err?.status) ||
    msg.includes('"code":503') ||
    msg.includes('"code":429') ||
    msg.includes('"code":500') ||
    msg.includes('"code":504') ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("DEADLINE_EXCEEDED") ||
    msg.includes("high demand") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("aborted") ||
    err?.name === "AbortError" ||
    causeCode === "UND_ERR_HEADERS_TIMEOUT" ||
    causeCode === "ECONNRESET" ||
    causeCode === "ETIMEDOUT"
  );
};

// Your original model is tried first, then fallbacks if it stays overloaded
const MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];
const RETRIES_PER_MODEL = 3;

const generateWithRetry = async (ai, request) => {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= RETRIES_PER_MODEL; attempt++) {
      try {
        return await ai.models.generateContent({ ...request, model });
      } catch (err) {
        lastError = err;

        // Real errors (bad API key, invalid input) should fail immediately
        if (!isRetryable(err)) throw err;

        const wait = 1000 * 2 ** (attempt - 1) + Math.random() * 500;
        console.log(
          `Gemini ${model} attempt ${attempt}/${RETRIES_PER_MODEL} failed. Retrying in ${Math.round(wait)}ms...`,
        );
        await sleep(wait);
      }
    }

    console.log(`Model ${model} is unavailable, switching to next model...`);
  }

  throw lastError;
};

// ===============================
// TEXT / PDF SUMMARY
// ===============================
export const generateSummary = async (text) => {
  try {
    const ai = getAI();

    console.log("Calling Gemini for text summary...");

    const response = await generateWithRetry(ai, {
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

    const response = await generateWithRetry(ai, {
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

    const response = await generateWithRetry(ai, {
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

    // Safety: strip markdown fences if the model adds them anyway
    const cleaned = response.text.replace(/```json|```/g, "").trim();

    const quiz = JSON.parse(cleaned);

    return quiz;
  } catch (error) {
    console.error("Quiz Generator Error:", error);

    throw new Error(error?.message || "Failed to generate quiz");
  }
};
