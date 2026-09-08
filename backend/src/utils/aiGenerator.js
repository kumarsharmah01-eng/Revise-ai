import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateQuiz = async (text, numberOfQuestions = 5) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: `
You are an expert educational quiz generator.

Generate exactly ${numberOfQuestions} multiple-choice questions
from the study material below.

Rules:
- Use ONLY information from the study material.
- Each question must have exactly 4 options.
- Only one option can be correct.
- correctAnswer must be the index of the correct option.
- Index starts from 0.
- Give a short explanation for every answer.
- Questions should be useful for exam preparation.
- Avoid duplicate questions.

Study Material:

${text}
`,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            questions: {
              type: Type.ARRAY,

              items: {
                type: Type.OBJECT,

                properties: {
                  question: {
                    type: Type.STRING,
                  },

                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },

                  correctAnswer: {
                    type: Type.INTEGER,
                  },

                  explanation: {
                    type: Type.STRING,
                  },
                },

                required: [
                  "question",
                  "options",
                  "correctAnswer",
                  "explanation",
                ],
              },
            },
          },

          required: ["questions"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Quiz Generation Error:", error);

    throw new Error(error?.message || "Failed to generate quiz");
  }
};
export default generateQuiz;
