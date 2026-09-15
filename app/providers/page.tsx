import { providers } from "@/lib/seed-data";
import { ProviderSearchView } from "@/components/provider-search-view";

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const service = typeof params.service === "string" ? params.service : "";
  const city = typeof params.city === "string" ? params.city : "";

  return (
    <div className="app-page mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a95f32]">Provider directory</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Veterinary Clinics, Ambulances & Rescues</h1>
        <p className="mt-2 text-sm text-slate-600">
          Find verified veterinary services, animal ambulances, and emergency clinics with live distance calculation and emergency SOS dispatch.
        </p>
      </div>

      <ProviderSearchView
        initialProviders={providers}
        defaultCity={city}
        defaultService={service}
      />
    </div>
  );
}

