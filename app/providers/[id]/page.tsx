import Link from "next/link";

import { getProviderById } from "@/lib/provider-service";

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = getProviderById(id);

  if (!provider) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-lg font-medium text-slate-700">Provider not found.</p>
      </div>
    );
  }

  return (
    <div className="app-page mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">{provider.type}</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">{provider.name}</h1>
            <p className="mt-3 text-slate-600">{provider.description}</p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {provider.verified ? "Verified provider" : "Pending verification"}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p><span className="font-semibold text-slate-900">City:</span> {provider.city}</p>
            <p><span className="font-semibold text-slate-900">Address:</span> {provider.address}</p>
            <p><span className="font-semibold text-slate-900">Phone:</span> {provider.phone}</p>
            <p><span className="font-semibold text-slate-900">Status:</span> {provider.status}</p>
            <p><span className="font-semibold text-slate-900">Emergency:</span> {provider.emergencyAvailable ? "Available" : "Not available"}</p>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p><span className="font-semibold text-slate-900">Animals treated:</span> {provider.animalsTreated.join(", ")}</p>
            <p><span className="font-semibold text-slate-900">Services:</span> {provider.services.join(", ")}</p>
            <p><span className="font-semibold text-slate-900">Operating hours:</span></p>
            <ul className="space-y-1 text-sm text-slate-600">
              {provider.operatingHours.map((slot) => (
                <li key={slot.day}>{slot.day}: {slot.open} - {slot.close}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/providers" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
            Back to results
          </Link>
          <a href={`tel:${provider.phone}`} className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">
            Call provider
          </a>
        </div>
      </div>
    </div>
  );
}
