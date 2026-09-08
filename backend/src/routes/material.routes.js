import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import StudyMaterial from "../models/studyMaterial.js";

const router = express.Router();

// Get all materials
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
    console.error("Get materials error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch study materials",
      error: error.message,
    });
  }
});

// Get one material
router.get("/:id", authMiddleware, async (req, res) => {
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

    return res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("Get material error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch study material",
      error: error.message,
    });
  }
});

// Delete one material
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

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
