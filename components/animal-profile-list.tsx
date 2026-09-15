"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Animal } from "@/lib/types";

interface AnimalProfileListProps {
  initialAnimals: Animal[];
}

export function AnimalProfileList({ initialAnimals }: AnimalProfileListProps) {
  const [animalsList, setAnimalsList] = useState<Animal[]>(initialAnimals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Unknown",
    microchipId: "",
    vaccinationStatus: "Up to date" as "Up to date" | "Due soon" | "Overdue" | "Incomplete",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = animalsList.filter((a) => {
    if (filterSpecies === "all") return true;
    return a.species.toLowerCase() === filterSpecies.toLowerCase();
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.breed.trim() || !formData.age.trim()) {
      setErrorMsg("Please fill in name, breed, and age.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create animal profile.");
      }

      setAnimalsList((prev) => [data.animal, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: "",
        species: "Dog",
        breed: "",
        age: "",
        gender: "Male",
        microchipId: "",
        vaccinationStatus: "Up to date",
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const speciesEmoji = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes("dog") || s.includes("puppy")) return "🐶";
    if (s.includes("cat") || s.includes("kitten")) return "🐱";
    if (s.includes("bird") || s.includes("parrot")) return "🦜";
    if (s.includes("cow") || s.includes("cattle")) return "🐄";
    if (s.includes("rabbit") || s.includes("bunny")) return "🐰";
    return "🐾";
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {["all", "dog", "cat", "other"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterSpecies(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                filterSpecies === type
                  ? "bg-[#a95f32] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {type === "all" ? "All Animals" : `${type}s`}
            </button>
          ))}
        </div>

        {/* Add Animal Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#a95f32] hover:bg-[#8e4922] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all transform hover:scale-105 shadow-md active:scale-95"
        >
          <span>➕</span>
          <span>Add New Animal</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((animal) => {
          const timelineCount = animal.timeline?.length || 0;
          return (
            <article
              key={animal.id}
              className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-inner">
                      {speciesEmoji(animal.species)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#a95f32] transition-colors">
                        {animal.name}
                      </h2>
                      <p className="text-xs font-semibold text-slate-500">{animal.species} • {animal.gender || "Pet"}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      animal.vaccinationStatus === "Up to date"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : animal.vaccinationStatus === "Due soon"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {animal.vaccinationStatus || "Vaccinated"}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Breed:</span>
                    <span className="font-semibold text-slate-900">{animal.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Age:</span>
                    <span className="font-semibold text-slate-900">{animal.age}</span>
                  </div>
                  {animal.microchipId && (
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Tag / Chip:</span>
                      <span className="font-mono text-slate-700 font-semibold">{animal.microchipId}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span className="font-medium text-slate-500">Medical Logs:</span>
                    <span className="font-bold text-[#a95f32]">{timelineCount} recorded</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 flex items-center justify-between border-t border-slate-100">
                <Link
                  href={`/animals/${animal.id}`}
                  className="w-full text-center bg-slate-900 hover:bg-[#a95f32] text-white text-xs font-bold py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  View Full Medical Timeline &rarr;
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-3xl mb-2">🐾</p>
          <p className="text-slate-700 font-bold">No animal profiles found in this category.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-xs font-bold text-white bg-[#a95f32] px-4 py-2 rounded-full"
          >
            Create First Profile
          </button>
        </div>
      )}

      {/* ----------------- CREATE ANIMAL MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <h3 className="text-lg font-bold text-slate-900">Add New Animal Profile</h3>
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

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Animal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bruno / Sheru"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a95f32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Species *</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#a95f32]"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Cow">Cow / Cattle</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Indie / Stray">Indie / Community Animal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indie / Labrador"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a95f32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 years / 6 months"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a95f32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "Male" | "Female" | "Unknown" })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#a95f32]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vaccine Status</label>
                  <select
                    value={formData.vaccinationStatus}
                    onChange={(e) => setFormData({ ...formData, vaccinationStatus: e.target.value as any })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#a95f32]"
                  >
                    <option value="Up to date">Up to date</option>
                    <option value="Due soon">Due soon</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Incomplete">Incomplete / Rescue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Microchip ID / Rescue Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 981020002938192 or ABC-TAG-12"
                  value={formData.microchipId}
                  onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a95f32]"
                />
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
                  {isSubmitting ? "Creating..." : "Save Animal Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
