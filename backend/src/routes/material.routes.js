import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import StudyMaterial from "../models/studyMaterial.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error("Get maetials error ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch study materials",
      error: error.message,
    });
  }
});

export default router;
