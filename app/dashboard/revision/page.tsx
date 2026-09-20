"use client";

import { useEffect, useState } from "react";

type Material = {
  _id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
};

type Summary = {
  _id: string;
  materialId: Material | string | null;
  content: string;
  createdAt: string;
};

export default function RevisionPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ==========================================
  // FETCH SAVED SUMMARIES
  // ==========================================
  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/ai/summaries", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      console.log("REVISION API RESPONSE:", data);
      console.log(
        "TOTAL SUMMARIES:",
        Array.isArray(data.summaries) ? data.summaries.length : 0,
      );

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch summaries");
      }

      if (!Array.isArray(data.summaries)) {
        throw new Error("Invalid summaries data received from server.");
      }

      // IMPORTANT
      setSummaries([...data.summaries]);
    } catch (error) {
      console.error("FETCH SUMMARIES ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Failed to fetch summaries",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH ON PAGE LOAD
  // ==========================================
  useEffect(() => {
    fetchSummaries();
  }, []);

  // ==========================================
  // GET MATERIAL NAME
  // ==========================================
  const getMaterialName = (summary: Summary) => {
    if (
      summary.materialId &&
      typeof summary.materialId === "object" &&
      summary.materialId.originalName
    ) {
      return summary.materialId.originalName;
    }

    return "Study Material";
  };

  // ==========================================
  // CLEAN SUMMARY CONTENT
  // ==========================================
  const getSummaryContent = (content: string) => {
    if (!content) {
      return "No summary content available.";
    }

    // Sometimes content can be stored as a JSON encoded string.
    try {
      const parsed = JSON.parse(content);

      if (typeof parsed === "string") {
        return parsed;
      }

      return content;
    } catch {
      return content;
    }
  };

  // ==========================================
  // DELETE SUMMARY
  // ==========================================
  const handleDelete = async (summaryId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this summary?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(summaryId);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/ai/summaries/${summaryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete summary");
      }

      // Remove immediately from frontend
      setSummaries((previousSummaries) =>
        previousSummaries.filter((summary) => summary._id !== summaryId),
      );

      // Close modal if deleted summary was open
      if (selectedSummary?._id === summaryId) {
        setSelectedSummary(null);
      }
    } catch (error) {
      console.error("DELETE SUMMARY ERROR:", error);

      alert(
        error instanceof Error ? error.message : "Failed to delete summary",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Revision</h1>

          <p className="text-slate-400 mt-2">Loading your saved summaries...</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-5 bg-slate-800 rounded w-1/2 mb-4" />

              <div className="h-3 bg-slate-800 rounded w-1/3 mb-6" />

              <div className="space-y-3">
                <div className="h-3 bg-slate-800 rounded" />
                <div className="h-3 bg-slate-800 rounded" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revision</h1>

          <p className="text-slate-400 mt-2">Review your saved AI summaries.</p>
        </div>

        {/* SUMMARY COUNT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <p className="text-sm text-slate-400">Saved Summaries</p>

          <p className="text-2xl font-bold text-white">{summaries.length}</p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {!error && summaries.length === 0 && (
        <div className="border border-slate-800 bg-slate-900 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">📚</div>

          <h2 className="text-xl font-semibold mb-2">No saved summaries yet</h2>

          <p className="text-slate-400">
            Generate a summary and save it to see it here.
          </p>
        </div>
      )}

      {/* SUMMARY CARDS */}
      {summaries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {summaries.map((summary) => {
            const content = getSummaryContent(summary.content);

            return (
              <div
                key={summary._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition"
              >
                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                      📄
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-lg truncate">
                        {getMaterialName(summary)}
                      </h2>

                      <p className="text-sm text-slate-500">
                        Saved on{" "}
                        {summary.createdAt
                          ? new Date(summary.createdAt).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUMMARY PREVIEW */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5">
                  <p className="text-slate-300 text-sm leading-6 whitespace-pre-wrap line-clamp-5">
                    {content}
                  </p>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedSummary(summary)}
                    className="flex-1 bg-white text-slate-950 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition"
                  >
                    View Summary
                  </button>

                  <button
                    onClick={() => handleDelete(summary._id)}
                    disabled={deletingId === summary._id}
                    className="px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                  >
                    {deletingId === summary._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          VIEW SUMMARY MODAL
      ========================================== */}
      {selectedSummary && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">
                  {getMaterialName(selectedSummary)}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedSummary.createdAt
                    ? new Date(selectedSummary.createdAt).toLocaleString()
                    : ""}
                </p>
              </div>

              <button
                onClick={() => setSelectedSummary(null)}
                className="text-slate-400 hover:text-white text-3xl ml-4"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <div className="text-slate-200 whitespace-pre-wrap leading-7">
                  {getSummaryContent(selectedSummary.content)}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSummary(null)}
                className="px-5 py-2.5 bg-white text-slate-950 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
