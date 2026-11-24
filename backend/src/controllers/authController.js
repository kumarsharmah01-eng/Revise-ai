import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

import User from "../models/user.js";
import { generateOTP, getOTPExpiry, isOTPExpired } from "../utils/otp.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// Hash OTP using SHA-256
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

    // Validation
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
        message: "OTP must be exactly 6 digits",
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

    // Already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check whether OTP exists
    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No active OTP found. Please request a new OTP.",
      });
    }

    // Check expiration
    if (
      !user.verificationCodeExpires ||
      isOTPExpired(user.verificationCodeExpires)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Maximum 5 verification attempts
    if (user.verifyAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // Compare hashed OTP.
    // The second condition supports older accounts that stored plain OTPs.
    const hashedOTP = hashOTP(normalizedOTP);

    const isOTPValid =
      user.verificationCode === hashedOTP ||
      user.verificationCode === normalizedOTP;

    if (!isOTPValid) {
      user.verifyAttempts += 1;

      if (user.verifyAttempts >= 5) {
        user.verificationCode = null;
        user.verificationCodeExpires = null;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          user.verifyAttempts >= 5
            ? "Too many incorrect attempts. Please request a new OTP."
            : "Invalid OTP. Please try again.",
        attemptsRemaining: Math.max(0, 5 - user.verifyAttempts),
      });
    }

    // Verify user
    user.emailVerified = true;

    // Clear OTP data
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

// ====================================================
// RESEND OTP
// POST /api/auth/resend-otp
// ====================================================

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

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

    // Already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // 60-second resend cooldown
    if (user.verifyCodeSentAt) {
      const elapsed = Date.now() - new Date(user.verifyCodeSentAt).getTime();
      const cooldown = 60 * 1000;

      if (elapsed < cooldown) {
        const retryAfterSeconds = Math.ceil((cooldown - elapsed) / 1000);

        return res.status(429).json({
          success: false,
          message: `Please wait ${retryAfterSeconds} seconds before requesting another OTP.`,
          retryAfterSeconds,
        });
      }
    }

    // Generate new OTP
    const verificationCode = generateOTP();

    // Store only its SHA-256 hash
    user.verificationCode = hashOTP(verificationCode);
    user.verificationCodeExpires = getOTPExpiry();
    user.verifyAttempts = 0;
    user.verifyCodeSentAt = new Date();

    await user.save();

    // Send OTP email
    try {
      await sendVerificationEmail(user.email, user.name, verificationCode);
    } catch (emailError) {
      console.error("RESEND OTP EMAIL ERROR:", emailError);

      // Invalidate the code if email delivery fails
      user.verificationCode = null;
      user.verificationCodeExpires = null;
      user.verifyCodeSentAt = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message: "Unable to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
};

// ====================================================
// LOGIN USER
// POST /api/auth/login
// ====================================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in",
        email: user.email,
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ====================================================
// GET CURRENT USER
// GET /api/auth/me
// ====================================================

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -verificationCode -verificationCodeExpires",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
}; // ====================================================
// UPDATE USER SETTINGS
// PATCH /api/auth/settings
// ====================================================

export const updateUserSettings = async (req, res) => {
  try {
    const { name, settings } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    if (settings !== undefined) {
      if (
        !settings ||
        typeof settings !== "object" ||
        Array.isArray(settings)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid settings data",
        });
      }

      const allowedThemes = ["dark", "light"];
      const allowedGoals = [
        "Exam Preparation",
        "Interview Preparation",
        "Skill Development",
        "General Learning",
      ];
      const allowedLevels = ["Beginner", "Intermediate", "Advanced"];
      const allowedSummaryLengths = ["short", "medium", "detailed"];
      const allowedDifficulties = ["easy", "medium", "hard"];
      const allowedQuestionCounts = [5, 10, 15, 20];

      const currentSettings = user.settings?.toObject
        ? user.settings.toObject()
        : user.settings || {};

      const updatedSettings = {
        ...currentSettings,
      };

      if (settings.learningPreferences) {
        const learning = settings.learningPreferences;

        if (
          learning.goal !== undefined &&
          !allowedGoals.includes(learning.goal)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid learning goal",
          });
        }

        if (
          learning.studyLevel !== undefined &&
          !allowedLevels.includes(learning.studyLevel)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid study level",
          });
        }

        if (
          learning.subjects !== undefined &&
          (!Array.isArray(learning.subjects) ||
            !learning.subjects.every((subject) => typeof subject === "string"))
        ) {
          return res.status(400).json({
            success: false,
            message: "Subjects must be an array of strings",
          });
        }

        updatedSettings.learningPreferences = {
          ...updatedSettings.learningPreferences,
          ...learning,
        };
      }

      if (settings.appearance) {
        const appearance = settings.appearance;

        if (
          appearance.theme !== undefined &&
          !allowedThemes.includes(appearance.theme)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid theme",
          });
        }

        updatedSettings.appearance = {
          ...updatedSettings.appearance,
          ...appearance,
        };
      }

      if (settings.aiPreferences) {
        const ai = settings.aiPreferences;

        if (
          ai.summaryLength !== undefined &&
          !allowedSummaryLengths.includes(ai.summaryLength)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid summary length",
          });
        }

        if (
          ai.quizDifficulty !== undefined &&
          !allowedDifficulties.includes(ai.quizDifficulty)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid quiz difficulty",
          });
        }

        if (
          ai.questionCount !== undefined &&
          !allowedQuestionCounts.includes(ai.questionCount)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid question count",
          });
        }

        updatedSettings.aiPreferences = {
          ...updatedSettings.aiPreferences,
          ...ai,
        };
      }

      if (settings.notifications) {
        const notifications = settings.notifications;

        if (
          Object.values(notifications).some(
            (value) => typeof value !== "boolean",
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Notification preferences must be boolean values",
          });
        }

        updatedSettings.notifications = {
          ...updatedSettings.notifications,
          ...notifications,
        };
      }

      user.settings = updatedSettings;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating settings",
    });
  }
};
