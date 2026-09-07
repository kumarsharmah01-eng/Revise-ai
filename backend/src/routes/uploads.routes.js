import express from "express";
import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import extractTextFromPDF from "../utils/pdfExtractor.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Upload route is working!",
  });
});

router.post("/", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a file",
    });
  }

  return res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    file: {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
    },
  });
});

export default router;
