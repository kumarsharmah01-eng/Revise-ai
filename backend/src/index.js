import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Revise AI Backend is running successfully!",
  });
});

const PORT = process.env.PORT || 5000;
// connection MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
