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
    <div className="app-page mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Veterinary & Emergency Care</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Find verified clinics, animal ambulances, and emergency rescues near you.
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


