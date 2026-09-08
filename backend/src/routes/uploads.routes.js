import express from "express";

import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import extractTextFromPDF from "../utils/pdfExtractor.js";
import StudyMaterial from "../models/studyMaterial.js";

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

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(req.file.path);

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

export default router;
