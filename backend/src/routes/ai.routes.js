import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import StudyMaterial from "../models/studyMaterial.js";
import generateQuiz from "../utils/aiGenerator.js";

const router = express.Router();

router.post("/generate-quiz", authMiddleware, async (req, res) => {
  try {
    const { materialId, numberOfQuestions = 5 } = req.body || {};

    // Check materialId
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: "materialId is required",
      });
    }

    // Find material belonging to logged-in user
    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    // Generate quiz using Gemini
    const quiz = await generateQuiz(material.extractedText, numberOfQuestions);

    return res.status(200).json({
      success: true,
      message: "Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Generate quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
      error: error.message,
    });
  }
});

export default router;
