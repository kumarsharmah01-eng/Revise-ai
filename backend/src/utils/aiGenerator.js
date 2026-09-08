import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateQuiz = async (text, numberOfQuestions = 5) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      input: [
        {
          role: "system",
          content:
            "You are an expert educational quiz generator. Generate accurate multiple-choice questions strictly from the provided study material.",
        },
        {
          role: "user",
          content: `
Generate ${numberOfQuestions} multiple-choice questions from the following study material.

Rules:
- Questions must be based only on the provided material.
- Each question must have exactly 4 options.
- Only one option should be correct.
- Include a short explanation for the correct answer.
- Make the questions useful for exam preparation.
- Return only the requested JSON structure.

Study Material:
${text}
`,
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "quiz",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                    },
                    options: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    correctAnswer: {
                      type: "integer",
                    },
                    explanation: {
                      type: "string",
                    },
                  },
                  required: [
                    "question",
                    "options",
                    "correctAnswer",
                    "explanation",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.output_text);
  } catch (error) {
    console.error("AI Quiz Generation Error:", error);
    throw new Error("Failed to generate quiz");
  }
};

export default generateQuiz;
