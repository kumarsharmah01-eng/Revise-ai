import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import StudyMaterial from "../models/studyMaterial.js";
import Summary from "../models/summary.js";
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

    // ==========================================
    // Save summary to MongoDB
    // ==========================================

    const savedSummary = await Summary.create({
      userId: req.user.userId,
      materialId: material._id,
      content: summary,
    });

    console.log("Summary saved successfully:", savedSummary._id);

    // ==========================================
    // Final response
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
//get summary history

router.get("/summaries", authMiddleware, async (req, res) => {
  try {
    const summaries = await Summary.find({
      userId: req.user.userId,
    })
      .populate("materialId", "originalName fileName mimeType")
      .sort({ createdAt: -1 });

    console.log("FOUND SUMMARIES:", summaries);

    res.status(200).json({
      success: true,
      count: summaries.length,
      summaries,
    });
  } catch (error) {
    console.error("FETCH SUMMARIES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch summaries",
    });
  }
});
//save summary
router.post("/summaries", authMiddleware, async (req, res) => {
  try {
    const { materialId, content } = req.body;

    if (!materialId || !content) {
      return res.status(400).json({
        success: false,
        message: "materialId and content are required",
      });
    }

    // Make sure material belongs to logged-in user
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

    const savedSummary = await Summary.create({
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
// delete summary
router.delete("/summaries/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSummary = await Summary.findOneAndDelete({
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

    console.log("Generating quiz for:", material.originalName);
    console.log("File type:", material.mimeType);

    let studyText = material.extractedText;

    // ==========================================
    // IMAGE → Gemini Vision → Extract Text
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
    // PDF → Existing Extracted Text
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
    // Unsupported file
    // ==========================================
    else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    // ==========================================
    // Generate Quiz
    // ==========================================

    console.log("Sending study material to Gemini for quiz...");

    const quiz = await generateQuiz(studyText);

    console.log("Quiz generated successfully");

    // ==========================================
    // Final response
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
