import { NextResponse } from "next/server";

import { filterProviders } from "@/lib/provider-service";
import { providers } from "@/lib/seed-data";
import { providerSearchParamsSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = providerSearchParamsSchema.safeParse({
    service: searchParams.get("service") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    radiusKm: searchParams.get("radiusKm") ?? undefined,
    verifiedOnly: searchParams.get("verifiedOnly") ?? undefined,
    openNow: searchParams.get("openNow") ?? undefined,
  });

  const criteria = parsed.success ? parsed.data : { radiusKm: 10, verifiedOnly: true, openNow: false };
  const results = filterProviders(providers, criteria);

  return NextResponse.json(
    {
      count: results.length,
      results,
      criteria,
    },
    { status: 200 },
  );
}
