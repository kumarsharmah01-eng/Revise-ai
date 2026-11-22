import { createHash } from "crypto";
import User from "../models/user.js";
import { isOTPExpired } from "../utils/otp.js";

const hashOTP = (otp) => {
  return createHash("sha256").update(String(otp)).digest("hex");
};

// ====================================================
// VERIFY OTP
// POST /api/auth/verify-otp
// ====================================================

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOTP = String(otp).trim();

    if (!/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        success: false,
        message: "OTP must contain exactly 6 digits",
      });
    }

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check verification status
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check OTP existence
    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No active OTP found. Please request a new OTP.",
      });
    }

    // Check expiry
    if (
      !user.verificationCodeExpires ||
      isOTPExpired(user.verificationCodeExpires)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check maximum attempts
    if (user.verifyAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    // Compare hashed OTP
    const hashedOTP = hashOTP(normalizedOTP);

    const isValid =
      user.verificationCode === hashedOTP ||
      user.verificationCode === normalizedOTP;

    if (!isValid) {
      user.verifyAttempts += 1;

      if (user.verifyAttempts >= 5) {
        user.verificationCode = null;
        user.verificationCodeExpires = null;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsRemaining: Math.max(0, 5 - user.verifyAttempts),
      });
    }

    // Verify email
    user.emailVerified = true;

    // Clear OTP information
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    user.verifyAttempts = 0;
    user.verifyCodeSentAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};
