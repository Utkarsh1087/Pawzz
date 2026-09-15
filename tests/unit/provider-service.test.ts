import { describe, expect, it } from "vitest";

import { calculateDistanceKm, filterProviders } from "@/lib/provider-service";
import { providers } from "@/lib/seed-data";

describe("provider service utilities", () => {
  it("calculates distance accurately in kilometers", () => {
    const distance = calculateDistanceKm({ lat: 28.6139, lng: 77.209 }, { lat: 28.5244, lng: 77.2063 });
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(20);
  });

  it("filters providers by service and city", () => {
    const matches = filterProviders(providers, {
      city: "Delhi",
      service: "veterinary_clinic",
      verifiedOnly: true,
      radiusKm: 10,
      openNow: false,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((provider) => provider.city === "Delhi")).toBe(true);
    expect(matches.every((provider) => provider.type === "veterinary_clinic")).toBe(true);
  });
});
