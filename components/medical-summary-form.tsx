"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Animal, MedicalSummary } from "@/lib/types";

export function MedicalSummaryForm() {
  const [animalName, setAnimalName] = useState("Bruno");
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [documentText, setDocumentText] = useState(
    "Bruno was brought in with vomiting and reduced appetite. Blood work showed mild dehydration. Temperature was 102.1F. Administered anti-emetic injection (Cerenia) and recommended 250ml IV fluids. Prescribed oral probiotics and gastrointestinal wet food for 5 days. Re-check in 48 hours.",
  );
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSavingTimeline, setIsSavingTimeline] = useState(false);

  useEffect(() => {
    fetch("/api/animals")
      .then((res) => res.json())
      .then((data) => {
        if (data.animals && Array.isArray(data.animals)) {
          setAnimals(data.animals);
          if (data.animals.length > 0) {
            setSelectedAnimalId(data.animals[0].id);
            setAnimalName(data.animals[0].name);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectAnimal = (id: string) => {
    setSelectedAnimalId(id);
    const found = animals.find((a) => a.id === id);
    if (found) {
      setAnimalName(found.name);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/medical-documents/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalName, documentText }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to generate the summary.");
      }

      setSummary(payload.summary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveToTimeline() {
    if (!summary) return;
    const targetId = selectedAnimalId || animals.find((a) => a.name.toLowerCase() === animalName.toLowerCase())?.id;

    if (!targetId) {
      setError("Please select or create an animal profile to save this record.");
      return;
    }

    setIsSavingTimeline(true);
    setError("");

    try {
      const notes = [
        summary.keyObservations?.length ? `Observations: ${summary.keyObservations.join(", ")}` : "",
        summary.tests?.length ? `Tests: ${summary.tests.join(", ")}` : "",
        summary.medications?.length ? `Medications: ${summary.medications.join(", ")}` : "",
        summary.followUpInstructions?.length ? `Follow-up: ${summary.followUpInstructions.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await fetch(`/api/animals/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `AI Clinical Summary (${summary.reportDate || "Recent"})`,
          date: summary.reportDate || new Date().toISOString().split("T")[0],
          type: "checkup",
          notes: notes.slice(0, 480),
          vetName: "AI Document Parser",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message || "Could not save to timeline.");
      }

      setSaveSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save record");
    } finally {
      setIsSavingTimeline(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      {/* ----------------- FORM ----------------- */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Choose Registered Animal</label>
            {animals.length > 0 ? (
              <select
                value={selectedAnimalId}
                onChange={(e) => handleSelectAnimal(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm bg-white outline-none focus:border-[#a95f32]"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    🐾 {a.name} ({a.species} - {a.breed})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-500 mb-2">No profiles registered yet.</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Animal Name</label>
            <input
              value={animalName}
              onChange={(event) => setAnimalName(event.target.value)}
              placeholder="e.g. Bruno"
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#a95f32]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Clinical Notes / Discharge Summary</label>
              <button
                type="button"
                onClick={() =>
                  setDocumentText(
                    "Annual wellness examination for Bruno. Weight: 28.5 kg. Normal vital signs. Received Rabies & DHLPP booster vaccines. Administered Bravecto oral flea & tick chew. Dental prophylaxis advised within 6 months. Stool sample negative for parasites.",
                  )
                }
                className="text-[11px] font-bold text-[#a95f32] hover:underline"
              >
                Load Sample Discharge 📄
              </button>
            </div>
            <textarea
              value={documentText}
              onChange={(event) => setDocumentText(event.target.value)}
              rows={9}
              placeholder="Paste vet prescriptions, discharge summaries, or clinical diagnosis text..."
              className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs sm:text-sm outline-none focus:border-[#a95f32] leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !documentText.trim()}
            className="w-full rounded-full bg-[#a95f32] hover:bg-[#8e4922] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">🔄</span>
                <span>Extracting Medical Insights...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate AI Clinical Summary</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-700">
            ⚠️ {error}
          </div>
        )}
      </form>

      {/* ----------------- SUMMARY OUTPUT ----------------- */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
        {summary ? (
          <div className="space-y-5 text-xs sm:text-sm text-slate-700">
            {/* Disclaimer pill */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs font-medium text-amber-900 leading-relaxed">
              ⚠️ <strong>Clinical Notice:</strong> {summary.disclaimer}
            </div>

            {/* Title row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#a95f32]">Summary for</p>
                <h3 className="text-xl font-bold text-slate-900">{summary.animalName}</h3>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                📅 {summary.reportDate}
              </span>
            </div>

            {/* Key Observations */}
            {summary.keyObservations?.length > 0 && (
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <span>🩺</span>
                  <span>Key Observations</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {summary.keyObservations.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tests */}
            {summary.tests?.length > 0 && (
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <span>🔬</span>
                  <span>Diagnostic Tests & Labs</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {summary.tests.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medications */}
            {summary.medications?.length > 0 && (
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <span>💊</span>
                  <span>Medications & Dosages</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {summary.medications.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up */}
            {summary.followUpInstructions?.length > 0 && (
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <span>📋</span>
                  <span>Follow-Up Care</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {summary.followUpInstructions.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Save to Timeline Action */}
            <div className="pt-4 border-t border-slate-100">
              {saveSuccess ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                  <p className="text-xs font-bold text-emerald-800">
                    ✅ Summary saved to {summary.animalName}&apos;s Medical Timeline!
                  </p>
                  {selectedAnimalId && (
                    <Link
                      href={`/animals/${selectedAnimalId}`}
                      className="mt-2 inline-block text-xs font-bold text-[#a95f32] hover:underline"
                    >
                      View in Animal Timeline &rarr;
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveToTimeline}
                  disabled={isSavingTimeline}
                  className="w-full bg-slate-900 hover:bg-[#a95f32] text-white text-xs sm:text-sm font-bold py-3 px-5 rounded-full transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSavingTimeline ? (
                    <>
                      <span className="animate-spin">🔄</span>
                      <span>Saving to Timeline...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Summary to {summary.animalName}&apos;s Medical Timeline</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="my-auto text-center py-16 px-4">
            <span className="text-4xl">📄</span>
            <h4 className="mt-3 text-base font-bold text-slate-800">No Summary Generated Yet</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Paste veterinary clinical notes on the left and click &quot;Generate AI Clinical Summary&quot; to parse key observations, diagnostics, medications, and care instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

