import express from "express";

import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import extractTextFromPDF from "../utils/pdfExtractor.js";
import StudyMaterial from "../models/studyMaterial.js";
import { extractTextFromImage } from "../utils/aiGenerator.js";
import fs from "fs/promises";

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    let extractedText = "";

    // PDF → Extract text using PDF extractor
    if (req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(req.file.path);
    }

    // JPG / PNG → We will process with Gemini later
    else if (
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/png"
    ) {
      console.log("Processing image with Gemini...");

      extractedText = await extractTextFromImage(
        req.file.path,
        req.file.mimetype,
      );

      console.log("Extracted text preview:", extractedText.substring(0, 300));
    }
    // Unsupported file type
    else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    // Save study material in MongoDB
    const studyMaterial = await StudyMaterial.create({
      userId: req.user.userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText: extractedText,
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded and saved successfully",
      material: {
        id: studyMaterial._id,
        originalName: studyMaterial.originalName,
        fileName: studyMaterial.fileName,
        fileSize: studyMaterial.fileSize,
        mimeType: studyMaterial.mimeType,
        createdAt: studyMaterial.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process file",
      error: error.message,
    });
  }
});

// Delete study material
// DELETE study material
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    // Delete physical file from uploads folder
    try {
      await fs.unlink(material.filePath);
    } catch (fileError) {
      console.log("File already deleted or not found:", fileError.message);
    }

    // Delete MongoDB document
    await StudyMaterial.findByIdAndDelete(material._id);

    return res.status(200).json({
      success: true,
      message: "Study material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete study material",
      error: error.message,
    });
  }
});
export default router;
