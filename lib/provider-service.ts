import { providers } from "./seed-data";
import type { Provider, SearchCriteria } from "./types";

const earthRadiusKm = 6371;

export function calculateDistanceKm(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isProviderOpenNow(provider: Provider): boolean {
  const day = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const time = new Date();
  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  const todayHours = provider.operatingHours.find((slot) => slot.day === day);

  if (!todayHours) {
    return provider.status === "open";
  }

  const openMinutes = Number.parseInt(todayHours.open.slice(0, 2), 10) * 60 + Number.parseInt(todayHours.open.slice(3, 5), 10);
  const closeMinutes = Number.parseInt(todayHours.close.slice(0, 2), 10) * 60 + Number.parseInt(todayHours.close.slice(3, 5), 10);

  return provider.status === "open" && currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export function filterProviders(list: Provider[], criteria: SearchCriteria) {
  const city = criteria.city?.trim().toLowerCase();
  const service = criteria.service?.trim();
  const radiusKm = criteria.radiusKm ?? 10;
  const verifiedOnly = criteria.verifiedOnly ?? true;
  const openNow = criteria.openNow ?? false;

  return list
    .filter((provider) => {
      if (city && !provider.city.toLowerCase().includes(city)) {
        return false;
      }

      if (service && provider.type !== service) {
        return false;
      }

      if (verifiedOnly && !provider.verified) {
        return false;
      }

      if (openNow && !isProviderOpenNow(provider)) {
        return false;
      }

      return true;
    })
    .map((provider) => ({
      ...provider,
      distanceKm: Number(
        calculateDistanceKm(
          { lat: 28.6139, lng: 77.209 },
          provider.coordinates,
        ).toFixed(1),
      ),
    }))
    .filter((provider) => provider.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getProviderById(id: string) {
  return providers.find((provider) => provider.id === id) ?? null;
}
