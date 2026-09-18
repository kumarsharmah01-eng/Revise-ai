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
  materialId: Material;
  content: string;
  createdAt: string;
};

export default function RevisionPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);

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
        throw new Error(data.message || "Failed to fetch summaries");
      }

      setSummaries(data.summaries || []);
    } catch (error) {
      console.error("Fetch summaries error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to fetch summaries",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD SUMMARIES
  // ==========================================

  useEffect(() => {
    fetchSummaries();
  }, []);

  // ==========================================
  // DELETE SUMMARY
  // ==========================================

  const handleDelete = async (summaryId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this summary?",
    );

    if (!confirmDelete) return;

    try {
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

      // Remove deleted summary from UI
      setSummaries((prev) =>
        prev.filter((summary) => summary._id !== summaryId),
      );

      // Close modal if deleted summary was open
      if (selectedSummary?._id === summaryId) {
        setSelectedSummary(null);
      }
    } catch (error) {
      console.error("Delete summary error:", error);

      alert(
        error instanceof Error ? error.message : "Failed to delete summary",
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-2">Revision</h1>

        <p className="text-slate-400">Loading your saved summaries...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Revision</h1>

        <p className="text-slate-400 mt-2">Review your saved AI summaries.</p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {/* NO SUMMARIES */}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summaries.map((summary) => (
          <div
            key={summary._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition"
          >
            {/* MATERIAL NAME */}

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📄</div>

                <div>
                  <h2 className="font-semibold text-lg">
                    {summary.materialId?.originalName || "Study Material"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Saved on {new Date(summary.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* SUMMARY PREVIEW */}

            <div className="bg-slate-950 rounded-xl p-4 mb-5">
              <p className="text-slate-300 text-sm line-clamp-4 whitespace-pre-wrap">
                {summary.content}
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
                className="px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY MODAL */}

      {selectedSummary && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedSummary.materialId?.originalName || "Summary"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {new Date(selectedSummary.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedSummary(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="p-6 overflow-y-auto max-h-[65vh]">
              <div className="text-slate-200 whitespace-pre-wrap leading-7">
                {selectedSummary.content}
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
