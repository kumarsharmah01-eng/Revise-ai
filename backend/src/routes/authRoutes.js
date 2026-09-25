import express from "express";
import bcrypt from "bcryptjs";

import User from "../models/user.js";

import { generateOTP, getOTPExpiry, isOTPExpired } from "../utils/otp.js";

import { sendVerificationEmail } from "../utils/sendEmail.js";

import { loginUser, getCurrentUser } from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ====================================================
// REGISTER
// POST /api/auth/register
// ====================================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();

    // -----------------------------
    // CHECK EXISTING USER
    // -----------------------------

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // -----------------------------
    // EXISTING USER
    // -----------------------------

    if (user) {
      // Already verified
      if (user.emailVerified) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      // Existing but not verified
      const verificationCode = generateOTP();
      const verificationCodeExpires = getOTPExpiry();

      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;

      await user.save();

      try {
        await sendVerificationEmail(user.email, user.name, verificationCode);
      } catch (emailError) {
        console.error("VERIFICATION EMAIL ERROR:", emailError);

        return res.status(500).json({
          success: false,
          message:
            "Account exists but verification email could not be sent. Check email configuration.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
        email: user.email,
      });
    }

    // -----------------------------
    // HASH PASSWORD
    // -----------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------
    // GENERATE OTP
    // -----------------------------

    const verificationCode = generateOTP();
    const verificationCodeExpires = getOTPExpiry();

    // -----------------------------
    // CREATE USER
    // -----------------------------

    user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,

      emailVerified: false,

      verificationCode,
      verificationCodeExpires,
    });

    // -----------------------------
    // SEND VERIFICATION EMAIL
    // -----------------------------

    try {
      await sendVerificationEmail(user.email, user.name, verificationCode);
    } catch (emailError) {
      console.error("VERIFICATION EMAIL ERROR:", emailError);

      return res.status(500).json({
        success: false,
        message:
          "Account created, but verification email could not be sent. Please try resending the code.",
        email: user.email,
      });
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return res.status(201).json({
      success: true,
      message: "Account created. Verification code sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// ====================================================
// VERIFY EMAIL
// POST /api/auth/verify-email
// ====================================================

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = String(code).trim();

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // ALREADY VERIFIED
    // -----------------------------

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // -----------------------------
    // CHECK CODE EXISTS
    // -----------------------------

    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code.",
      });
    }

    // -----------------------------
    // CHECK EXPIRY
    // -----------------------------

    if (
      !user.verificationCodeExpires ||
      isOTPExpired(user.verificationCodeExpires)
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // -----------------------------
    // CHECK OTP
    // -----------------------------

    if (user.verificationCode !== normalizedCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // -----------------------------
    // VERIFY USER
    // -----------------------------

    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save();

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
});

// ====================================================
// RESEND VERIFICATION CODE
// POST /api/auth/resend-code
// ====================================================

router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // ALREADY VERIFIED
    // -----------------------------

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // -----------------------------
    // GENERATE NEW OTP
    // -----------------------------

    const verificationCode = generateOTP();
    const verificationCodeExpires = getOTPExpiry();

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;

    await user.save();

    // -----------------------------
    // SEND EMAIL
    // -----------------------------

    try {
      await sendVerificationEmail(user.email, user.name, verificationCode);
    } catch (emailError) {
      console.error("RESEND EMAIL ERROR:", emailError);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send verification email. Please check email configuration.",
      });
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("RESEND CODE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resending verification code",
    });
  }
});

// ====================================================
// LOGIN
// POST /api/auth/login
// ====================================================

router.post("/login", loginUser);

// ====================================================
// CURRENT USER
// GET /api/auth/me
// ====================================================

router.get("/me", authMiddleware, getCurrentUser);

export default router;
