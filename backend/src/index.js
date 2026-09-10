import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploads.routes.js";
import materialRoutes from "./routes/material.routes.js";
import aiRoutes from "./routes/ai.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//auth routerrs
app.use("/api/auth", authRoutes);

//upload
app.use("/api/upload", uploadRoutes);

//material routes
app.use("/api/materials", materialRoutes);

console.log(
  "Gemini API Key:",
  process.env.GEMINI_API_KEY ? "LOADED" : "NOT LOADED",
);

//ai routes
app.use("/api/ai", aiRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Revise AI Backend is running successfully!",
  });
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
