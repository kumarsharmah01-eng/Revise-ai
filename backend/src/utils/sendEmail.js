import nodemailer from "nodemailer";

let transporter;

// Created lazily so process.env is already loaded
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendVerificationEmail = async (email, name, code) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"Revise AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Revise AI - Email Verification Code",
      text: `Hi ${name}, your Revise AI verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
          <h2>Welcome to Revise AI 🚀</h2>

          <p>Hi ${name},</p>

          <p>Your email verification code is:</p>

          <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px;
                      background: #f1f5f9; padding: 16px; text-align: center;
                      border-radius: 8px; color: #0f172a;">
            ${code}
          </div>

          <p>This code will expire in 10 minutes.</p>

          <p>If you didn't create an account, you can ignore this email.</p>

          <p>Thanks,<br>Revise AI Team</p>
        </div>
      `,
    });

    console.log("EMAIL SENT:", info.messageId);
    return info;
  } catch (error) {
    console.error("EMAIL SENDING ERROR:", error);
    throw error;
  }
};
