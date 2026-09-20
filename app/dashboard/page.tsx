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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [quizLoading, setQuizLoading] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState("dashboard");

  const [summaryData, setSummaryData] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);

  // ==========================================
  // REVISION / SAVED SUMMARIES
  // ==========================================
  const [savedSummaries, setSavedSummaries] = useState<any[]>([]);
  const [revisionLoading, setRevisionLoading] = useState(false);

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
  // FETCH SAVED SUMMARIES
  // ==========================================

  const fetchSavedSummaries = async () => {
    try {
      setRevisionLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/ai/summaries", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch saved summaries");
      }

      setSavedSummaries(data.summaries || []);
    } catch (error: any) {
      console.error("FETCH SUMMARIES ERROR:", error);
      setError(error.message || "Failed to load summaries");
    } finally {
      setRevisionLoading(false);
    }
  };

  // ==========================================
  // UPLOAD MATERIAL
  // ==========================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    try {
      setUploadLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      console.log("Upload successful:", data);

      // Clear selected file
      setSelectedFile(null);

      // Reset file input visually
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      // Refresh materials
      await fetchMaterials();
    } catch (error: any) {
      console.error("Upload Error:", error);
      setError(error.message || "Failed to upload file");
    } finally {
      setUploadLoading(false);
    }
  };

  // ==========================================
  // GENERATE SUMMARY
  // ==========================================

  const handleGenerateSummary = async (materialId: string) => {
    try {
      setSummaryLoading(materialId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      if (!materialId) {
        setError("Material ID is missing.");
        return;
      }

      console.log("=================================");
      console.log("Generating Summary");
      console.log("Material ID:", materialId);
      console.log("Token exists:", !!token);
      console.log("=================================");

      const response = await fetch("http://localhost:5000/api/ai/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId: materialId,
        }),
      });

      console.log("Summary Status:", response.status);

      const data = await response.json();

      console.log("Summary Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to generate summary",
        );
      }

      if (!data.summary) {
        console.log("Full backend response:", data);

        throw new Error(
          "Backend responded successfully, but summary was not returned.",
        );
      }

      // Save summary temporarily
      sessionStorage.setItem("reviseAISummary", JSON.stringify(data.summary));

      // Save material ID
      sessionStorage.setItem("reviseAIMaterialId", materialId);

      console.log("Summary generated successfully.");

      // IMPORTANT:
      // Do NOT navigate to another page.
      // Just change the main content.
      setSummaryData(data.summary);
      setActiveSection("summary");
    } catch (error: any) {
      console.error("SUMMARY ERROR:", error);
      setError(error.message || "Failed to generate summary");
    } finally {
      setSummaryLoading(null);
    }
  };
  // ==========================================
  // SAVE SUMMARY
  // ==========================================

  const handleSaveSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const materialId = sessionStorage.getItem("reviseAIMaterialId");
      const summary = sessionStorage.getItem("reviseAISummary");

      if (!materialId) {
        setError("Material ID is missing.");
        return;
      }

      if (!summary) {
        setError("Summary content is missing.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/ai/summaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          materialId: materialId,
          content: summary,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save summary");
      }

      console.log("Summary saved:", data);

      alert("Summary saved successfully!");
    } catch (error: any) {
      console.error("SAVE SUMMARY ERROR:", error);
      setError(error.message || "Failed to save summary");
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

      // Store material ID
      sessionStorage.setItem("reviseAIMaterialId", materialId);

      // IMPORTANT:
      // Do NOT navigate to /dashboard/quiz.
      // Just change the main content.
      setQuizData(data.quiz);
      setActiveSection("quiz");
    } catch (error: any) {
      console.error("Quiz Generation Error:", error);
      setError(error.message || "Failed to generate quiz");
    } finally {
      setQuizLoading(null);
    }
  };

  // ==========================================
  // DELETE MATERIAL
  // ==========================================

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
    sessionStorage.removeItem("reviseAISummary");
    sessionStorage.removeItem("reviseAIMaterialId");

    router.push("/login");
  };

  // ==========================================
  // SIDEBAR BUTTON CLASS
  // ==========================================

  const getSidebarClass = (section: string) => {
    return `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition ${
      activeSection === section
        ? "bg-blue-600 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;
  };
  const cleanSummary = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return typeof parsed === "string" ? parsed : text;
    } catch {
      return text;
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-white">
      <div className="flex h-screen">
        {/* =========================
            SIDEBAR
        ========================== */}

        <aside className="relative hidden h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-900 md:block">
          {/* Logo */}

          <div className="border-b border-slate-800 px-6 py-6">
            <h1 className="text-2xl font-bold">
              Revise
              <span className="text-blue-500">AI</span>
            </h1>
          </div>

          {/* Navigation */}

          <nav className="space-y-2 p-4">
            {/* Dashboard */}

            <button
              onClick={() => setActiveSection("dashboard")}
              className={getSidebarClass("dashboard")}
            >
              <span>Dashboard</span>
            </button>

            {/* Revision */}

            <button
              onClick={() => setActiveSection("revision")}
              className={getSidebarClass("revision")}
            >
              <span>Revision</span>
            </button>

            {/* Materials */}

            <button
              onClick={() => setActiveSection("materials")}
              className={getSidebarClass("materials")}
            >
              <span>Materials</span>
            </button>

            {/* Progress */}

            <button
              onClick={() => setActiveSection("progress")}
              className={getSidebarClass("progress")}
            >
              <span>Progress</span>
            </button>
          </nav>

          {/* Bottom Section */}

          <div className="absolute bottom-0 w-64 border-t border-slate-800 p-4">
            {/* Settings */}

            <button
              onClick={() => setActiveSection("settings")}
              className={getSidebarClass("settings")}
            >
              <span>Settings</span>
            </button>

            {/* Logout */}

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

        <section className="h-screen flex-1 overflow-y-auto">
          {/* HEADER */}

          <div className="border-b border-slate-800 px-8 py-8">
            {activeSection === "dashboard" && (
              <>
                <h2 className="text-3xl font-bold">Dashboard</h2>

                <p className="mt-2 text-slate-400">Your learning workspace</p>
              </>
            )}

            {activeSection === "revision" && (
              <>
                <h2 className="text-3xl font-bold">Revision</h2>

                <p className="mt-2 text-slate-400">
                  Review your saved AI-generated summaries.
                </p>
              </>
            )}

            {activeSection === "materials" && (
              <>
                <h2 className="text-3xl font-bold">Materials</h2>

                <p className="mt-2 text-slate-400">
                  Manage all your study materials.
                </p>
              </>
            )}

            {activeSection === "progress" && (
              <>
                <h2 className="text-3xl font-bold">Progress</h2>

                <p className="mt-2 text-slate-400">
                  Track your learning progress.
                </p>
              </>
            )}

            {activeSection === "settings" && (
              <>
                <h2 className="text-3xl font-bold">Settings</h2>

                <p className="mt-2 text-slate-400">
                  Manage your account settings.
                </p>
              </>
            )}

            {activeSection === "summary" && (
              <>
                <h2 className="text-3xl font-bold">AI Summary</h2>

                <p className="mt-2 text-slate-400">
                  Your AI-generated study summary.
                </p>
              </>
            )}

            {activeSection === "quiz" && (
              <>
                <h2 className="text-3xl font-bold">AI Quiz</h2>

                <p className="mt-2 text-slate-400">
                  Test your knowledge from your study material.
                </p>
              </>
            )}
          </div>

          {/* =========================
              CONTENT
          ========================== */}

          <div className="p-8">
            {/* ERROR */}

            {error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                {error}
              </div>
            )}

            {/* ==================================================
                DASHBOARD
            ================================================== */}

            {activeSection === "dashboard" && (
              <>
                {/* UPLOAD SECTION */}

                <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-xl font-bold">Upload Study Material</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Upload a PDF, JPG or PNG and let Revise AI analyze it.
                  </p>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;

                        setSelectedFile(file);
                        setError("");
                      }}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
                    />

                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploadLoading}
                      className="rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadLoading ? "Uploading..." : "Upload"}
                    </button>
                  </div>

                  {selectedFile && (
                    <p className="mt-3 text-sm text-slate-400">
                      Selected:{" "}
                      <span className="text-slate-200">
                        {selectedFile.name}
                      </span>
                    </p>
                  )}
                </div>

                {/* MATERIALS */}

                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">
                        Your Study Materials
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Generate AI summaries and quizzes from your uploaded
                        material.
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
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
                      <h3 className="text-xl font-bold">
                        No study materials yet
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        Upload your first PDF or image above to get started.
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

                          {/* Summary */}

                          <button
                            onClick={() => handleGenerateSummary(material._id)}
                            disabled={summaryLoading === material._id}
                            className="mt-5 w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 font-medium text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {summaryLoading === material._id
                              ? "Generating Summary..."
                              : "Generate Summary"}
                          </button>

                          {/* Quiz */}

                          <button
                            onClick={() => handleGenerateQuiz(material._id)}
                            disabled={quizLoading === material._id}
                            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {quizLoading === material._id
                              ? "Generating Quiz..."
                              : "Generate Quiz"}
                          </button>

                          {/* Delete */}

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
              </>
            )}

            {/* ==================================================
                REVISION
            ================================================== */}

            {activeSection === "revision" && (
              <div>
                {revisionLoading && (
                  <p className="text-slate-400">Loading saved summaries...</p>
                )}

                {!revisionLoading && savedSummaries.length === 0 && !error && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
                    <h3 className="text-xl font-bold">
                      No saved summaries yet
                    </h3>
                    <p className="mt-2 text-slate-400">
                      Generate a summary and click Save Summary to see it here.
                    </p>
                  </div>
                )}

                <div className="grid gap-5 lg:grid-cols-2">
                  {savedSummaries.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                    >
                      <h4 className="font-semibold">
                        {typeof s.materialId === "object"
                          ? s.materialId?.originalName
                          : "Study Material"}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Saved on {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {cleanSummary(s.content)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================================================
                MATERIALS
            ================================================== */}

            {activeSection === "materials" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold">All Study Materials</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    View and manage your uploaded materials.
                  </p>
                </div>

                {!loading && materials.length === 0 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
                    <h3 className="text-xl font-bold">No materials found</h3>

                    <p className="mt-2 text-slate-400">
                      Upload study material from the Dashboard.
                    </p>
                  </div>
                )}

                {!loading && materials.length > 0 && (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {materials.map((material) => (
                      <div
                        key={material._id}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                      >
                        <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-400">
                          {material.mimeType === "application/pdf"
                            ? "PDF"
                            : material.mimeType === "image/png"
                              ? "PNG"
                              : material.mimeType === "image/jpeg"
                                ? "JPG"
                                : "FILE"}
                        </div>

                        <h4 className="mt-4 truncate text-lg font-semibold">
                          {material.originalName}
                        </h4>

                        <p className="mt-2 text-sm text-slate-500">
                          {(material.fileSize / 1024).toFixed(1)} KB
                        </p>

                        <button
                          onClick={() => handleDeleteMaterial(material._id)}
                          disabled={deleteLoading === material._id}
                          className="mt-5 w-full rounded-lg border border-red-500/30 px-4 py-3 font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
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
            )}

            {/* ==================================================
                PROGRESS
            ================================================== */}

            {activeSection === "progress" && (
              <div>
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">Study Materials</p>

                    <p className="mt-2 text-3xl font-bold">
                      {materials.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">Summaries</p>

                    <p className="mt-2 text-3xl font-bold">—</p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">Quizzes</p>

                    <p className="mt-2 text-3xl font-bold">—</p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                SETTINGS
            ================================================== */}

            {activeSection === "settings" && (
              <div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-xl font-bold">Account Settings</h3>

                  <p className="mt-2 text-slate-400">
                    Settings and account preferences will be available here.
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
    AI SUMMARY
================================================== */}

            {activeSection === "summary" && summaryData && (
              <div>
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="mb-6 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  ← Back to Dashboard
                </button>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Generated Summary</h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Review your AI-generated summary before saving it.
                      </p>
                    </div>

                    {/* SAVE BUTTON */}
                    <button
                      onClick={handleSaveSummary}
                      className="rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
                    >
                      Save Summary
                    </button>
                  </div>

                  <div className="mt-6 whitespace-pre-wrap leading-7 text-slate-300">
                    {typeof summaryData === "string"
                      ? summaryData
                      : JSON.stringify(summaryData, null, 2)}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                AI QUIZ
            ================================================== */}

            {activeSection === "quiz" && quizData && (
              <div>
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="mb-6 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  ← Back to Dashboard
                </button>

                <div className="space-y-5">
                  {quizData.questions?.map((question: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                    >
                      <h3 className="text-lg font-semibold">
                        {index + 1}. {question.question}
                      </h3>

                      <div className="mt-5 space-y-3">
                        {question.options?.map(
                          (option: any, optionIndex: number) => (
                            <div
                              key={optionIndex}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300"
                            >
                              {typeof option === "string"
                                ? option
                                : option.label ||
                                  option.text ||
                                  JSON.stringify(option)}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
