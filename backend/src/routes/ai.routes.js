import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import StudyMaterial from "../models/studyMaterial.js";

import {
  generateSummary,
  extractTextFromImage,
  generateQuiz,
} from "../utils/aiGenerator.js";

const router = express.Router();

// ==========================================
// SUMMARY
// ==========================================

router.post("/summary", authMiddleware, async (req, res) => {
  try {
    const { materialId } = req.body || {};

    console.log("SUMMARY BODY:", req.body);

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

    console.log("Generating summary for:", material.originalName);
    console.log("File type:", material.mimeType);

    let summary;

    // ==========================================
    // PDF → Extracted Text → Gemini
    // ==========================================

    if (material.mimeType === "application/pdf") {
      if (!material.extractedText) {
        return res.status(400).json({
          success: false,
          message: "No extracted text found for this PDF",
        });
      }

      summary = await generateSummary(material.extractedText);
    }

    // ==========================================
    // JPG / PNG → Gemini Vision
    // ==========================================
    else if (
      material.mimeType === "image/jpeg" ||
      material.mimeType === "image/png"
    ) {
      summary = await extractTextFromImage(
        material.filePath,
        material.mimeType,
      );
    }

    // ==========================================
    // Unsupported file
    // ==========================================
    else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    // ==========================================
    // Final response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      summary,
    });
  } catch (error) {
    console.error("Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate summary",
      error: error.message,
    });
  }
});

// ==========================================
// QUIZ
// ==========================================

router.post("/quiz", authMiddleware, async (req, res) => {
  try {
    const { materialId } = req.body || {};

    console.log("QUIZ BODY:", req.body);

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

    // Quiz requires extracted text
    if (!material.extractedText) {
      return res.status(400).json({
        success: false,
        message: "No extracted text found for this material",
      });
    }

    // Prevent quiz from using old placeholder
    if (material.extractedText === "IMAGE_PENDING_AI_PROCESSING") {
      return res.status(400).json({
        success: false,
        message:
          "This image was uploaded before AI text extraction was enabled. Please upload the image again.",
      });
    }

    console.log("Generating quiz for:", material.originalName);

    const quiz = await generateQuiz(material.extractedText);

    return res.status(200).json({
      success: true,
      message: "Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Quiz Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
      error: error.message,
    });
  }
});

export default router;
