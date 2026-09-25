import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import StudyMaterial from "../models/studyMaterial.js";

import SavedSummary from "../models/savedSummary.js";

import {
  generateSummary,
  extractTextFromImage,
  generateQuiz,
} from "../utils/aiGenerator.js";

const router = express.Router();

// ==========================================
// SUMMARY
// POST /api/ai/summary
// ==========================================

router.post("/summary", authMiddleware, async (req, res) => {
  try {
    const { materialId } = req.body || {};

    console.log("SUMMARY BODY:", req.body);

    // ==========================================
    // CHECK MATERIAL ID
    // ==========================================

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: "materialId is required",
      });
    }

    // ==========================================
    // FIND MATERIAL
    // ==========================================

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
    // PDF → EXTRACTED TEXT → GEMINI
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
    // JPG / PNG → GEMINI VISION
    // ==========================================
    else if (
      material.mimeType === "image/jpeg" ||
      material.mimeType === "image/png"
    ) {
      console.log("Image detected. Extracting text using Gemini Vision...");

      summary = await extractTextFromImage(
        material.filePath,
        material.mimeType,
      );

      if (!summary || !summary.trim()) {
        return res.status(400).json({
          success: false,
          message: "Could not extract content from this image",
        });
      }

      console.log("Image text extraction successful");
    }

    // ==========================================
    // UNSUPPORTED FILE
    // ==========================================
    else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    // ==========================================
    // SAVE SUMMARY TO MONGODB
    // ==========================================

    const savedSummary = await SavedSummary.create({
      userId: req.user.userId,
      materialId: material._id,
      content: summary,
    });

    console.log("Summary saved successfully:", savedSummary._id);

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      summary: savedSummary.content,
      summaryId: savedSummary._id,
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
// GET SUMMARY HISTORY
// GET /api/ai/summaries
// ==========================================

router.get("/summaries", authMiddleware, async (req, res) => {
  try {
    const summaries = await SavedSummary.find({
      userId: req.user.userId,
    })
      .populate("materialId", "originalName fileName mimeType")
      .sort({ createdAt: -1 });

    console.log("FOUND SUMMARIES:", summaries);

    return res.status(200).json({
      success: true,
      count: summaries.length,
      summaries,
    });
  } catch (error) {
    console.error("FETCH SUMMARIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch summaries",
      error: error.message,
    });
  }
});

// ==========================================
// SAVE SUMMARY
// POST /api/ai/summaries
// ==========================================

router.post("/summaries", authMiddleware, async (req, res) => {
  try {
    const { materialId, content } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!materialId || !content) {
      return res.status(400).json({
        success: false,
        message: "materialId and content are required",
      });
    }

    // ==========================================
    // CHECK MATERIAL OWNERSHIP
    // ==========================================

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

    // ==========================================
    // SAVE SUMMARY
    // ==========================================

    const savedSummary = await SavedSummary.create({
      userId: req.user.userId,
      materialId: material._id,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Summary saved successfully",
      summary: savedSummary,
    });
  } catch (error) {
    console.error("SAVE SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save summary",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE SUMMARY
// DELETE /api/ai/summaries/:id
// ==========================================

router.delete("/summaries/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSummary = await SavedSummary.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!deletedSummary) {
      return res.status(404).json({
        success: false,
        message: "Summary not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Summary deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete summary",
      error: error.message,
    });
  }
});

// ==========================================
// QUIZ
// POST /api/ai/quiz
// ==========================================

router.post("/quiz", authMiddleware, async (req, res) => {
  try {
    const { materialId } = req.body || {};

    console.log("QUIZ BODY:", req.body);

    // ==========================================
    // CHECK MATERIAL ID
    // ==========================================

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: "materialId is required",
      });
    }

    // ==========================================
    // FIND MATERIAL
    // ==========================================

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

    console.log("Generating quiz for:", material.originalName);

    console.log("File type:", material.mimeType);

    let studyText = material.extractedText;

    // ==========================================
    // IMAGE → GEMINI VISION → EXTRACT TEXT
    // ==========================================

    if (
      material.mimeType === "image/jpeg" ||
      material.mimeType === "image/png"
    ) {
      console.log("Image detected. Extracting text using Gemini Vision...");

      studyText = await extractTextFromImage(
        material.filePath,
        material.mimeType,
      );

      if (!studyText || !studyText.trim()) {
        return res.status(400).json({
          success: false,
          message: "Could not extract study content from this image",
        });
      }

      console.log("Image study content extracted successfully");
    }

    // ==========================================
    // PDF → EXISTING EXTRACTED TEXT
    // ==========================================
    else if (material.mimeType === "application/pdf") {
      if (!studyText || !studyText.trim()) {
        return res.status(400).json({
          success: false,
          message: "No extracted text found for this PDF",
        });
      }

      // Prevent old placeholder
      if (studyText === "IMAGE_PENDING_AI_PROCESSING") {
        return res.status(400).json({
          success: false,
          message:
            "This material was uploaded before AI text extraction was enabled. Please upload the material again.",
        });
      }

      console.log("PDF extracted text found successfully");
    }

    // ==========================================
    // UNSUPPORTED FILE
    // ==========================================
    else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    // ==========================================
    // GENERATE QUIZ
    // ==========================================

    console.log("Sending study material to Gemini for quiz...");

    const quiz = await generateQuiz(studyText);

    console.log("Quiz generated successfully");

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

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
