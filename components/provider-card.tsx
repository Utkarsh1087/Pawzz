import Link from "next/link";

import type { Provider } from "@/lib/types";

export function ProviderCard({ provider }: { provider: Provider & { distanceKm?: number } }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            {provider.type.replace("_", " ")}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{provider.name}</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            provider.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {provider.verified ? "Verified" : "Pending verification"}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-600">{provider.description}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-slate-100 px-2 py-1">{provider.city}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1">{provider.status === "open" ? "Open now" : "Closed"}</span>
        {provider.distanceKm !== undefined ? (
          <span className="rounded-full bg-slate-100 px-2 py-1">{provider.distanceKm} km away</span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          <div>⭐ {provider.rating} ({provider.reviews} reviews)</div>
          <div className="mt-1">📞 {provider.phone}</div>
        </div>
        <Link href={`/providers/${provider.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          View profile
        </Link>
      </div>
    </article>
  );
}
