import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./db/index.js";

import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploads.routes.js";
import materialRoutes from "./routes/material.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import progressRoutes from "./routes/progress.routes.js";

dotenv.config();

console.log("=================================");
console.log("ENVIRONMENT CHECK");
console.log("=================================");

console.log("EMAIL_USER:", process.env.EMAIL_USER || "MISSING");

console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");

console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "LOADED" : "MISSING",
);

console.log("JWT_SECRET:", process.env.JWT_SECRET ? "LOADED" : "MISSING");

console.log("=================================");

const app = express();

/* ====================================================
   MIDDLEWARE
==================================================== */

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ====================================================
   AUTH ROUTES
==================================================== */

app.use("/api/auth", authRoutes);

/* ====================================================
   UPLOAD ROUTES
==================================================== */

app.use("/api/upload", uploadRoutes);

/* ====================================================
   MATERIAL ROUTES
==================================================== */

app.use("/api/materials", materialRoutes);

/* ====================================================
   AI ROUTES
==================================================== */

app.use("/api/ai", aiRoutes);

/* ====================================================
   PROGRESS ROUTES
==================================================== */

app.use("/api/progress", progressRoutes);

/* ====================================================
   TEST ROUTE
==================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Revise AI Backend is running successfully!",
  });
});

/* ====================================================
   404 HANDLER
==================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ====================================================
   ERROR HANDLER
==================================================== */

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* ====================================================
   SERVER
==================================================== */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Revise AI Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
