import Link from "next/link";
import { getAnimalById } from "@/lib/animal-store";
import { AnimalTimelineView } from "@/components/animal-timeline-view";

export const dynamic = "force-dynamic";

export default async function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const animal = await getAnimalById(id);

  if (!animal) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <h1 className="text-2xl font-bold text-slate-900">Animal Profile Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The requested animal record might have been removed or does not exist.
        </p>
        <Link
          href="/animals"
          className="mt-6 inline-block bg-[#a95f32] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md"
        >
          &larr; Return to Profiles
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <AnimalTimelineView initialAnimal={animal} />
    </div>
  );
}

