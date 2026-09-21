"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(60);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // ====================================================
  // GET EMAIL FROM SESSION STORAGE
  // ====================================================

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("verificationEmail");

    if (!savedEmail) {
      router.replace("/signup");
      return;
    }

    setEmail(savedEmail);
  }, [router]);

  // ====================================================
  // RESEND COOLDOWN
  // ====================================================

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  // ====================================================
  // VERIFY OTP
  // ====================================================

  const submit = async (code: string) => {
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/verify-email`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Verification failed");

        setDigits(Array(6).fill(""));

        setTimeout(() => {
          inputs.current[0]?.focus();
        }, 0);

        return;
      }

      // Email successfully verified
      setSuccess(data.message || "Email verified successfully!");

      // Remove pending email
      sessionStorage.removeItem("verificationEmail");

      /*
        IMPORTANT:

        /verify-email does NOT return a JWT token.
        JWT is generated during LOGIN.

        Therefore we DO NOT save data.token here.
      */

      // Redirect to login
      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } catch (error) {
      console.error("VERIFY EMAIL ERROR:", error);

      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // OTP INPUT CHANGE
  // ====================================================

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const next = [...digits];

    next[index] = value;

    setDigits(next);

    // Move to next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Automatically submit when all 6 digits entered
    if (next.length === 6 && next.every((digit) => digit !== "")) {
      submit(next.join(""));
    }
  };

  // ====================================================
  // BACKSPACE
  // ====================================================

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // ====================================================
  // PASTE OTP
  // ====================================================

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length === 6) {
      event.preventDefault();

      setDigits(pasted.split(""));

      submit(pasted);
    }
  };

  // ====================================================
  // RESEND OTP
  // ====================================================

  const resend = async () => {
    if (cooldown > 0 || loading) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/resend-code`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to resend code");

        return;
      }

      setSuccess(data.message || "New verification code sent!");

      setCooldown(60);

      setDigits(Array(6).fill(""));

      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 0);
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);

      setError("Unable to connect to server.");
    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">
        {/* Header */}

        <div className="mb-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-3xl font-bold"
          >
            Revise
            <span className="text-blue-500">AI</span>
          </button>

          <h1 className="mt-8 text-3xl font-bold">Verify Your Email 📩</h1>

          <p className="mt-3 text-slate-400">
            We sent a 6-digit verification code to
          </p>

          <p className="mt-1 font-medium text-white">{email}</p>
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          {/* OTP Inputs */}

          <div className="flex justify-center gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                value={digit}
                inputMode="numeric"
                maxLength={1}
                autoFocus={index === 0}
                disabled={loading}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="h-14 w-12 rounded-lg border border-slate-700 bg-slate-950 text-center text-2xl font-bold text-white outline-none focus:border-blue-500"
              />
            ))}
          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="mt-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center text-sm text-green-400">
              {success}
            </div>
          )}

          {/* Loading */}

          {loading && (
            <p className="mt-5 text-center text-sm text-slate-400">
              Verifying your email...
            </p>
          )}

          {/* Resend */}

          <div className="mt-6 text-center">
            {cooldown > 0 ? (
              <p className="text-sm text-slate-500">
                Resend code in{" "}
                <span className="text-slate-300">{cooldown}s</span>
              </p>
            ) : (
              <button
                onClick={resend}
                disabled={loading}
                className="text-sm font-medium text-blue-500 hover:text-blue-400 disabled:opacity-50"
              >
                Resend verification code
              </button>
            )}
          </div>
        </div>

        {/* Back to signup */}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/signup")}
            className="text-sm text-slate-500 hover:text-slate-300"
          >
            ← Back to signup
          </button>
        </div>
      </div>
    </main>
  );
}
