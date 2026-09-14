"use client";

import { useEffect, useState } from "react";

export default function SummaryPage() {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const savedSummary = sessionStorage.getItem("reviseAISummary");

    if (savedSummary) {
      try {
        const parsedSummary = JSON.parse(savedSummary);

        if (typeof parsedSummary === "string") {
          setSummary(parsedSummary);
        } else {
          setSummary(JSON.stringify(parsedSummary, null, 2));
        }
      } catch (error) {
        console.error("Failed to parse summary:", error);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">AI Summary</h1>

      {summary ? (
        <div className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900 p-6 leading-7 text-slate-300">
          {summary}
        </div>
      ) : (
        <p className="text-slate-400">No summary found.</p>
      )}
    </main>
  );
}
