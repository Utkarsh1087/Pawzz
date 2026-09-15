"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Animal, MedicalRecordEntry } from "@/lib/types";

interface AnimalTimelineViewProps {
  initialAnimal: Animal;
}

export function AnimalTimelineView({ initialAnimal }: AnimalTimelineViewProps) {
  const router = useRouter();
  const [animal, setAnimal] = useState<Animal>(initialAnimal);
  const [timeline, setTimeline] = useState<MedicalRecordEntry[]>(initialAnimal.timeline || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new entry
  const [newEntry, setNewEntry] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    type: "vaccination" as MedicalRecordEntry["type"],
    notes: "",
    vetName: "",
    nextDueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !newEntry.date) {
      setErrorMsg("Please provide a title and date.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/animals/${animal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to add timeline entry.");
      }

      setTimeline((prev) => [data.entry, ...prev]);
      setIsModalOpen(false);
      setNewEntry({
        title: "",
        date: new Date().toISOString().split("T")[0],
        type: "vaccination",
        notes: "",
        vetName: "",
        nextDueDate: "",
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnimal = async () => {
    if (!confirm(`Are you sure you want to delete ${animal.name}'s profile?`)) return;

    try {
      const res = await fetch(`/api/animals/${animal.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/animals");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to delete animal profile.");
    }
  };

  const getTypeBadge = (type: MedicalRecordEntry["type"]) => {
    switch (type) {
      case "vaccination":
        return { label: "Vaccination 💉", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "deworming":
        return { label: "Deworming 💊", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "surgery":
        return { label: "Surgery 🏥", bg: "bg-purple-50 text-purple-800 border-purple-200" };
      case "prescription":
        return { label: "Prescription 📄", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "checkup":
        return { label: "Checkup 🩺", bg: "bg-teal-50 text-teal-800 border-teal-200" };
      default:
        return { label: "Health Note 📋", bg: "bg-slate-50 text-slate-800 border-slate-200" };
    }
  };

  return (
    <div className="space-y-8">
      {/* ----------------- ANIMAL HEADER CARD ----------------- */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shadow-inner">
              {animal.species.toLowerCase().includes("cat") ? "🐱" : "🐶"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">{animal.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {animal.vaccinationStatus || "Active"}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-500 mt-0.5">
                {animal.species} • {animal.breed} • {animal.gender || "Pet"} • {animal.age}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/animals"
              className="text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 px-4 py-2 rounded-full transition-colors"
            >
              &larr; Back to Profiles
            </Link>
            <button
              onClick={handleDeleteAnimal}
              title="Delete animal profile"
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-2 rounded-full transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Species</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{animal.species}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Breed</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{animal.breed}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{animal.age}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Microchip / Tag</p>
            <p className="text-sm font-mono font-bold text-slate-900 mt-1">{animal.microchipId || "Not tagged"}</p>
          </div>
        </div>
      </div>

      {/* ----------------- TIMELINE & MEDICAL HISTORY ----------------- */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Medical & Vaccination Timeline</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {timeline.length} verified clinical records logged
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/medical"
              className="text-xs font-bold text-[#a95f32] hover:bg-amber-50 border border-amber-300 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
            >
              <span>📄</span>
              <span>AI Report Parser</span>
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-white bg-[#a95f32] hover:bg-[#8e4922] px-4 py-2 rounded-full shadow-md transition-all transform hover:scale-105"
            >
              ➕ Log Health Record
            </button>
          </div>
        </div>

        {/* Timeline Items */}
        {timeline.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {timeline.map((entry) => {
              const badge = getTypeBadge(entry.type);
              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-[#a95f32] border-2 border-white shadow-xs"></div>

                  <div className="bg-slate-50 group-hover:bg-[#fffbf6] border border-slate-200 group-hover:border-amber-300 rounded-2xl p-5 transition-colors shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">{entry.title}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        📅 {entry.date}
                      </span>
                    </div>

                    {entry.notes && (
                      <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed">
                        {entry.notes}
                      </p>
                    )}

                    <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {entry.vetName && (
                        <span className="text-slate-600 font-medium">
                          🩺 Clinician / Hospital: <strong className="text-slate-900">{entry.vetName}</strong>
                        </span>
                      )}

                      {entry.nextDueDate && (
                        <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-md text-[11px] ml-auto">
                          🔔 Next Due: {entry.nextDueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm font-bold text-slate-700">No medical records logged yet for {animal.name}.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 text-xs font-bold text-white bg-[#a95f32] px-4 py-2 rounded-full shadow-xs"
            >
              Log First Vaccination
            </button>
          </div>
        )}
      </div>

      {/* ----------------- ADD TIMELINE ENTRY MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💉</span>
                <h3 className="text-lg font-bold text-slate-900">Log Health Record for {animal.name}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Record Title / Treatment *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anti-Rabies Vaccine (ARV) / Deworming / Spay Surgery"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a95f32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Record Type</label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#a95f32]"
                  >
                    <option value="vaccination">Vaccination 💉</option>
                    <option value="deworming">Deworming 💊</option>
                    <option value="checkup">Routine Checkup 🩺</option>
                    <option value="surgery">Surgery / Spay 🏥</option>
                    <option value="prescription">Prescription / Meds 📄</option>
                    <option value="other">Other Note 📋</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Administered *</label>
                  <input
                    type="date"
                    required
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#a95f32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Veterinarian / Clinic (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Meera Nair"
                    value={newEntry.vetName}
                    onChange={(e) => setNewEntry({ ...newEntry, vetName: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a95f32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Next Due Date (Optional)</label>
                  <input
                    type="date"
                    value={newEntry.nextDueDate}
                    onChange={(e) => setNewEntry({ ...newEntry, nextDueDate: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#a95f32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes & Observations</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Brand: Nobivac. Temperature normal (101.5F). Given orally with food."
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a95f32]"
                ></textarea>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#a95f32] hover:bg-[#8e4922] rounded-full shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
