import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import StudyMaterial from "../models/studyMaterial.js";

import { generateSummary } from "../utils/aiGenerator.js";

const router = express.Router();

router.post("/summary", authMiddleware, async (req, res) => {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: "materialId is required",
      });
    }

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

    if (!material.extractedText) {
      return res.status(400).json({
        success: false,
        message: "No extracted text found",
      });
    }

    console.log("Generating summary for:", material.originalName);

    const summary = await generateSummary(material.extractedText);

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

export default router;
