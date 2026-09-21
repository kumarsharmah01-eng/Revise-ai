import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },

    emailVerified: { type: Boolean, default: false },

    // stores the SHA-256 HASH of the OTP, not the OTP itself
    verificationCode: { type: String, default: null },
    verificationCodeExpires: { type: Date, default: null },
    verifyAttempts: { type: Number, default: 0 },
    verifyCodeSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
