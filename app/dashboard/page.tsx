"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Material = {
  _id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MATERIALS
  // ==========================================

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/materials", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch materials");
      }

      setMaterials(data.materials || []);
    } catch (error: any) {
      console.error("Fetch Materials Error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GENERATE QUIZ
  // ==========================================

  const handleGenerateQuiz = async (materialId: string) => {
    try {
      setQuizLoading(materialId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/ai/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate quiz");
      }

      console.log("Quiz generated:", data);

      // Store quiz temporarily
      sessionStorage.setItem("reviseAIQuiz", JSON.stringify(data.quiz));

      // Store material name/id
      sessionStorage.setItem("reviseAIMaterialId", materialId);

      // Go to quiz page
      router.push("/dashboard/quiz");
    } catch (error: any) {
      console.error("Quiz Generation Error:", error);
      setError(error.message || "Failed to generate quiz");
    } finally {
      setQuizLoading(null);
    }
  };
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const handleDeleteMaterial = async (materialId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study material?",
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(materialId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/upload/${materialId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete material");
      }

      // Remove deleted material from UI immediately
      setMaterials((prevMaterials) =>
        prevMaterials.filter((material) => material._id !== materialId),
      );
    } catch (error: any) {
      console.error("Delete Material Error:", error);
      setError(error.message || "Failed to delete material");
    } finally {
      setDeleteLoading(null);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("reviseAIQuiz");
    sessionStorage.removeItem("reviseAIMaterialId");

    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* =========================
            SIDEBAR
        ========================== */}

        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 md:block">
          {/* Logo */}

          <div className="border-b border-slate-800 px-6 py-6">
            <h1 className="text-2xl font-bold">
              Revise
              <span className="text-blue-500">AI</span>
            </h1>
          </div>

          {/* Navigation */}

          <nav className="space-y-2 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-left font-medium">
              <span>Dashboard</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>Revision</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>AI Quiz</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>Interview Prep</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>Materials</span>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>Progress</span>
            </button>
          </nav>

          {/* Bottom Section */}

          <div className="absolute bottom-0 w-64 border-t border-slate-800 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* =========================
            MAIN AREA
        ========================== */}

        <section className="flex-1">
          {/* Header */}

          <div className="border-b border-slate-800 px-8 py-8">
            <h2 className="text-3xl font-bold">Dashboard</h2>

            <p className="mt-2 text-slate-400">Your learning workspace</p>
          </div>

          {/* Content */}

          <div className="p-8">
            {/* Error */}

            {error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                {error}
              </div>
            )}

            {/* Materials Section */}

            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Your Study Materials</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Generate AI quizzes from your uploaded material.
                  </p>
                </div>

                <button
                  onClick={fetchMaterials}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Refresh
                </button>
              </div>

              {/* Loading */}

              {loading && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
                  <p className="text-slate-400">Loading materials...</p>
                </div>
              )}

              {/* No Materials */}

              {!loading && materials.length === 0 && !error && (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
                  <h4 className="text-lg font-semibold">
                    No study materials yet
                  </h4>

                  <p className="mt-2 text-sm text-slate-400">
                    Upload a PDF, JPG or PNG to start learning.
                  </p>
                </div>
              )}

              {/* Material Cards */}

              {!loading && materials.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {materials.map((material) => (
                    <div
                      key={material._id}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
                    >
                      {/* File Type */}

                      <div className="mb-4 flex items-center justify-between">
                        <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-400">
                          {material.mimeType === "application/pdf"
                            ? "PDF"
                            : material.mimeType === "image/png"
                              ? "PNG"
                              : material.mimeType === "image/jpeg"
                                ? "JPG"
                                : "FILE"}
                        </div>
                      </div>

                      {/* File Name */}

                      <h4 className="truncate text-lg font-semibold">
                        {material.originalName}
                      </h4>

                      <p className="mt-2 text-sm text-slate-500">
                        {(material.fileSize / 1024).toFixed(1)} KB
                      </p>

                      {/* Generate Quiz */}

                      <button
                        onClick={() => handleGenerateQuiz(material._id)}
                        disabled={quizLoading === material._id}
                        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {quizLoading === material._id
                          ? "Generating Quiz..."
                          : "Generate Quiz"}
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material._id)}
                        disabled={deleteLoading === material._id}
                        className="mt-3 w-full rounded-lg border border-red-500/30 px-4 py-3 font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleteLoading === material._id
                          ? "Deleting..."
                          : "Delete Material"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
