"use client";

import { useState } from "react";

import type { CareNavigationResult } from "@/lib/types";

export function AICareForm() {
  const [prompt, setPrompt] = useState("My dog has been vomiting since morning and seems very weak.");
  const [result, setResult] = useState<CareNavigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/ai/care-navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, location: "Delhi" }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "The AI navigator could not help yet.");
      return;
    }

    setResult(payload.result);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-3 block text-sm font-medium text-slate-700">Describe the issue</label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none transition focus:border-slate-900"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking symptoms..." : "Get AI guidance"}
        </button>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </form>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Suggested response</h3>
        {result ? (
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Species:</span> {result.species}</p>
            <p><span className="font-semibold text-slate-900">Service:</span> {result.recommended_service}</p>
            <p><span className="font-semibold text-slate-900">Urgency:</span> {result.urgency}</p>
            <p><span className="font-semibold text-slate-900">Reason:</span> {result.reason}</p>
            <p><span className="font-semibold text-slate-900">Action:</span> {result.recommended_action}</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
              {result.missing_information.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            AI output will appear here. The system never diagnoses and always recommends professional veterinary care.
          </p>
        )}
      </div>
    </div>
  );
}
