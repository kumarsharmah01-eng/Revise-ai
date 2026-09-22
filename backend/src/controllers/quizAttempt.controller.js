import QuizAttempt from "../models/quizAttempt.js";
import SavedSummary from "../models/savedSummary.js"; // adjust to your actual summary model name

// POST /api/progress/quiz-attempt
// body: { materialId, totalQuestions, correctCount, incorrectCount }
export const saveQuizAttempt = async (req, res) => {
  try {
    const { materialId, totalQuestions, correctCount, incorrectCount } =
      req.body;

    if (
      !materialId ||
      totalQuestions === undefined ||
      correctCount === undefined ||
      incorrectCount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing quiz attempt data",
      });
    }

    const attempt = await QuizAttempt.create({
      userId: req.user.userId,
      materialId,
      totalQuestions,
      correctCount,
      incorrectCount,
    });

    return res.status(201).json({ success: true, attempt });
  } catch (error) {
    console.error("SAVE QUIZ ATTEMPT ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/progress/stats
export const getProgressStats = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    const quizzesAttempted = attempts.length;

    const totalCorrect = attempts.reduce((sum, a) => sum + a.correctCount, 0);
    const totalQuestions = attempts.reduce(
      (sum, a) => sum + a.totalQuestions,
      0,
    );

    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    // Adjust the model name below if your saved-summary model differs
    const summariesSaved = await SavedSummary.countDocuments({
      userId: req.user.userId,
    });

    const recentAttempts = attempts.slice(0, 5).map((a) => ({
      _id: a._id,
      materialId: a.materialId,
      totalQuestions: a.totalQuestions,
      correctCount: a.correctCount,
      incorrectCount: a.incorrectCount,
      createdAt: a.createdAt,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        quizzesAttempted,
        summariesSaved,
        totalCorrect,
        totalIncorrect: totalQuestions - totalCorrect,
        accuracy,
        recentAttempts,
      },
    });
  } catch (error) {
    console.error("GET PROGRESS STATS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
