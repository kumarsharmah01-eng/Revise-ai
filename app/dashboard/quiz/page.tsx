"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizData = {
  questions: Question[];
};

export default function QuizPage() {
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Load quiz from sessionStorage
  useEffect(() => {
    const storedQuiz = sessionStorage.getItem("reviseAIQuiz");

    if (!storedQuiz) {
      router.push("/dashboard");
      return;
    }

    try {
      const parsedQuiz = JSON.parse(storedQuiz);

      if (
        !parsedQuiz ||
        !Array.isArray(parsedQuiz.questions) ||
        parsedQuiz.questions.length === 0
      ) {
        router.push("/dashboard");
        return;
      }

      setQuiz(parsedQuiz);
      setAnswers(new Array(parsedQuiz.questions.length).fill(""));
    } catch (error) {
      console.error("Quiz parsing error:", error);
      router.push("/dashboard");
    }
  }, [router]);

  if (!quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading quiz...</p>
      </main>
    );
  }

  const question = quiz.questions[currentQuestion];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;

    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || "");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || "");
    }
  };

  const handleSubmit = () => {
    let finalScore = 0;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        finalScore++;
      }
    });

    setScore(finalScore);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers(new Array(quiz.questions.length).fill(""));
    setSubmitted(false);
    setScore(0);
  };

  // ==========================
  // RESULT SCREEN
  // ==========================

  if (submitted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-sm font-medium text-blue-400">QUIZ COMPLETED</p>

            <h1 className="mt-3 text-4xl font-bold">Your Score</h1>

            <div className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-full border-8 border-blue-500">
              <div>
                <p className="text-4xl font-bold">
                  {score}/{quiz.questions.length}
                </p>

                <p className="mt-1 text-sm text-slate-400">{percentage}%</p>
              </div>
            </div>

            <p className="mt-8 text-lg text-slate-300">
              {percentage >= 80
                ? "Excellent work! 🎉"
                : percentage >= 50
                  ? "Good job! Keep practicing. 💪"
                  : "Keep revising and try again! 📚"}
            </p>

            <button
              onClick={handleRetry}
              className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
            >
              Retry Quiz
            </button>
          </div>

          {/* ANSWER REVIEW */}

          <div className="mt-8 space-y-5">
            <h2 className="text-2xl font-bold">Answer Review</h2>

            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                >
                  <p className="text-sm text-slate-500">Question {index + 1}</p>

                  <h3 className="mt-2 font-semibold">{question.question}</h3>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="text-slate-400">Your answer:</span>{" "}
                      <span
                        className={
                          isCorrect ? "text-green-400" : "text-red-400"
                        }
                      >
                        {userAnswer || "Not answered"}
                      </span>
                    </p>

                    {!isCorrect && (
                      <p>
                        <span className="text-slate-400">Correct answer:</span>{" "}
                        <span className="text-green-400">
                          {question.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-800/70 p-4">
                    <p className="text-sm font-medium text-blue-400">
                      Explanation
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // ==========================
  // QUIZ SCREEN
  // ==========================

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Dashboard
          </button>

          <p className="text-sm text-slate-400">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>

        {/* TITLE */}

        <div className="mt-8">
          <p className="text-sm font-medium text-blue-400">REVISE AI QUIZ</p>

          <h1 className="mt-2 text-3xl font-bold">Test Your Knowledge</h1>

          <p className="mt-2 text-slate-400">
            Choose the best answer for each question.
          </p>
        </div>

        {/* PROGRESS BAR */}

        <div className="mt-8">
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* QUESTION CARD */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <p className="text-sm text-blue-400">
            Question {currentQuestion + 1}
          </p>

          <h2 className="mt-3 text-xl font-semibold leading-8">
            {question.question}
          </h2>

          {/* OPTIONS */}

          <div className="mt-7 space-y-3">
            {question.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);

              const isSelected = selectedAnswer === option;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {optionLetter}
                  </span>

                  <span className="text-sm text-slate-200">{option}</span>
                </button>
              );
            })}
          </div>

          {/* NAVIGATION */}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium transition hover:bg-green-500"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium transition hover:bg-blue-500"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
