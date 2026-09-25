"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      console.log("Login API:", `${API}/login`);

      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      // ==========================================
      // EMAIL NOT VERIFIED
      // ==========================================

      if (response.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
        const pendingEmail = data.email || email.trim();

        sessionStorage.setItem("pendingEmail", pendingEmail);

        router.push("/verify-email");

        return;
      }

      // ==========================================
      // LOGIN ERROR
      // ==========================================

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ==========================================
      // CHECK TOKEN
      // ==========================================

      if (!data.token) {
        throw new Error(
          "Login successful, but authentication token was not received.",
        );
      }

      // ==========================================
      // SAVE TOKEN
      // ==========================================

      localStorage.setItem("token", data.token);

      // ==========================================
      // GO TO DASHBOARD
      // ==========================================

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login Error:", error);

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setError(
          "Unable to connect to the server. Please make sure the backend is running on http://localhost:5000.",
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">
        {/* ==========================================
            LOGO / HEADER
        ========================================== */}

        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold">
            Revise
            <span className="text-blue-500">AI</span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold">Welcome Back 👋</h1>

          <p className="mt-2 text-slate-400">
            Login to continue your learning journey.
          </p>
        </div>

        {/* ==========================================
            LOGIN CARD
        ========================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          {/* ========================================
              ERROR MESSAGE
          ======================================== */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ========================================
              LOGIN FORM
          ======================================== */}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* ========================================
              SIGNUP
          ======================================== */}

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-500 hover:text-blue-400"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* ==========================================
            BACK TO HOME
        ========================================== */}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-300"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
