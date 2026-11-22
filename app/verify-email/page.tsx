"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth"
).replace(/\/$/, "");

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [countdown, setCountdown] = useState(0);
  const [emailReady, setEmailReady] = useState(false);

  // Retrieve email from URL or sessionStorage
  useEffect(() => {
    const emailFromURL = searchParams.get("email");
    const emailFromStorage = sessionStorage.getItem("pendingEmail");

    const pendingEmail = emailFromURL || emailFromStorage;

    if (pendingEmail) {
      const normalizedEmail = pendingEmail.trim().toLowerCase();

      setEmail(normalizedEmail);
      sessionStorage.setItem("pendingEmail", normalizedEmail);
    }

    setEmailReady(true);
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Verify OTP
  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address not found. Please sign up again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      console.log("VERIFY OTP RESPONSE:", data);

      if (!response.ok) {
        setError(data.message || "OTP verification failed.");
        return;
      }

      setSuccess("Email verified successfully!");

      sessionStorage.removeItem("pendingEmail");

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err) {
      console.error("VERIFY OTP ERROR:", err);

      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resending || countdown > 0 || !email) return;

    setError("");
    setSuccess("");

    setResending(true);

    try {
      const response = await fetch(`${API}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      console.log("RESEND OTP RESPONSE:", data);

      if (!response.ok) {
        setError(data.message || "Unable to resend OTP.");
        return;
      }

      setSuccess("A new OTP has been sent to your email.");

      setOtp("");
      setCountdown(60);
    } catch (err) {
      console.error("RESEND OTP ERROR:", err);

      setError("Unable to connect to server. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold">
            Revise<span className="text-blue-500">AI</span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold">Verify Your Email ✉️</h1>

          <p className="mt-3 text-slate-400">
            Enter the verification code sent to your email.
          </p>
        </div>

        {/* Verification Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-400">Verification code sent to</p>

            <p className="mt-2 break-all font-semibold text-blue-400">
              {emailReady ? email || "Email not found" : "Loading email..."}
            </p>
          </div>

          {!emailReady ? (
            <p className="text-center text-sm text-slate-400">
              Loading verification details...
            </p>
          ) : !email ? (
            <div className="text-center">
              <p className="mb-5 text-sm text-red-400">
                We couldn't find your email address.
              </p>

              <Link
                href="/signup"
                className="font-medium text-blue-500 hover:text-blue-400"
              >
                Go to Signup
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleVerify} className="space-y-5">
                {/* OTP Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Enter Verification Code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                    {success}
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending || countdown > 0}
                  className="mt-2 font-medium text-blue-500 transition hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resending
                    ? "Sending..."
                    : countdown > 0
                      ? `Resend code in ${countdown}s`
                      : "Resend Verification Code"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Back to Signup */}
        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="text-sm text-slate-500 transition hover:text-slate-300"
          >
            ← Back to Signup
          </Link>
        </div>
      </div>
    </main>
  );
}
