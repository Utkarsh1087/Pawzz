import { getAllAnimals } from "@/lib/animal-store";
import { AnimalProfileList } from "@/components/animal-profile-list";

export const dynamic = "force-dynamic";

export default async function AnimalsPage() {
  const animals = await getAllAnimals();

  return (
    <div className="app-page mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a95f32]">Animal Profiles & Health Records</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Manage Animal Profiles & Medical Timelines</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track vaccinations, medical history, deworming, and clinical notes for domestic and rescue animals.
        </p>
      </div>

      <AnimalProfileList initialAnimals={animals} />
    </div>
  );
}

