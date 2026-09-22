import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  saveQuizAttempt,
  getProgressStats,
} from "../controllers/quizAttempt.controller.js";

const router = express.Router();

router.post("/quiz-attempt", authMiddleware, saveQuizAttempt);
router.get("/stats", authMiddleware, getProgressStats);

export default router;
