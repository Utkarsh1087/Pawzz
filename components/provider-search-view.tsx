"use client";

import React, { useState, useMemo } from "react";
import type { Provider } from "@/lib/types";
import { calculateDistanceKm, isProviderOpenNow } from "@/lib/provider-service";

interface ProviderSearchViewProps {
  initialProviders: Provider[];
  defaultCity?: string;
  defaultService?: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
};

const CATEGORIES = [
  { id: "", label: "All Services" },
  { id: "veterinary_clinic", label: "Vet Clinics" },
  { id: "emergency_vet", label: "24/7 Emergency" },
  { id: "animal_ambulance", label: "Ambulance" },
  { id: "ngo", label: "NGOs & Rescues" },
  { id: "boarding", label: "Boarding" },
];

export function ProviderSearchView({
  initialProviders,
  defaultCity = "",
  defaultService = "",
}: ProviderSearchViewProps) {
  const [searchCity, setSearchCity] = useState(defaultCity);
  const [selectedService, setSelectedService] = useState(defaultService);
  const [radiusKm, setRadiusKm] = useState(50);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [sosModalProvider, setSosModalProvider] = useState<Provider | null>(null);
  const [sosPetDetails, setSosPetDetails] = useState({ petName: "", notes: "" });

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Live Location",
        });
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const referenceCoords = useMemo(() => {
    if (userLocation) return { lat: userLocation.lat, lng: userLocation.lng };
    const cityKey = searchCity.trim().toLowerCase();
    if (cityKey && CITY_COORDINATES[cityKey]) return CITY_COORDINATES[cityKey];
    return CITY_COORDINATES.delhi;
  }, [userLocation, searchCity]);

  const filteredProviders = useMemo(() => {
    return initialProviders
      .map((provider) => {
        const distanceKm = Number(
          calculateDistanceKm(referenceCoords, provider.coordinates).toFixed(1)
        );
        return {
          ...provider,
          distanceKm,
          isOpen: isProviderOpenNow(provider),
        };
      })
      .filter((provider) => {
        if (searchCity.trim() && !userLocation) {
          const matchCity = provider.city.toLowerCase().includes(searchCity.trim().toLowerCase());
          if (!matchCity) return false;
        }
        if (selectedService && provider.type !== selectedService) return false;
        if (onlyVerified && !provider.verified) return false;
        if (onlyOpenNow && !provider.isOpen) return false;
        if (radiusKm && provider.distanceKm > radiusKm) return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [initialProviders, referenceCoords, searchCity, selectedService, onlyVerified, onlyOpenNow, radiusKm, userLocation]);

  const typeLabels: Record<string, string> = {
    veterinary_clinic: "Clinic",
    emergency_vet: "24/7 Emergency",
    animal_ambulance: "Ambulance",
    ngo: "NGO & Rescue",
    rescuer: "Volunteer Rescuer",
    boarding: "Boarding",
  };

  return (
    <div className="space-y-6">
      {/* ----------------- CLEAN SEARCH & FILTER BAR ----------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-3 text-slate-400 text-sm">📍</span>
            <input
              type="text"
              placeholder="Search by city (e.g. Delhi, Mumbai, Bengaluru)..."
              value={searchCity}
              onChange={(e) => {
                setSearchCity(e.target.value);
                if (userLocation) setUserLocation(null);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#a95f32] transition-colors"
            />
            {searchCity && (
              <button
                onClick={() => setSearchCity("")}
                className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleGetLocation}
            disabled={geoLoading}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              userLocation
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
          >
            {geoLoading ? (
              <span className="animate-spin text-xs">🔄 Locating...</span>
            ) : userLocation ? (
              <span>✓ Live GPS Active</span>
            ) : (
              <span>🎯 Use My Location</span>
            )}
          </button>
        </div>

        {/* Category Pills & Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedService(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedService === cat.id
                    ? "bg-[#a95f32] text-white shadow-xs font-semibold"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Inline Toggles */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={(e) => setOnlyOpenNow(e.target.checked)}
                className="accent-[#a95f32] rounded w-3.5 h-3.5"
              />
              <span>Open now</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="accent-[#a95f32] rounded w-3.5 h-3.5"
              />
              <span>Verified only</span>
            </label>

            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none"
            >
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
              <option value={150}>Within 150 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* ----------------- RESULTS META ----------------- */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <p>
          <strong className="text-slate-800 font-semibold">{filteredProviders.length}</strong> providers found
          {userLocation ? " near your GPS location" : searchCity ? ` in ${searchCity}` : ""}
        </p>
        <span>Sorted by proximity</span>
      </div>

      {/* ----------------- CLEAN PROVIDER CARDS ----------------- */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredProviders.map((provider) => {
          const isEmergency =
            provider.type === "emergency_vet" ||
            provider.type === "animal_ambulance" ||
            provider.emergencyAvailable;

          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${provider.coordinates.lat},${provider.coordinates.lng}`;

          return (
            <article
              key={provider.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Type & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isEmergency
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {typeLabels[provider.type] || provider.type}
                    </span>

                    {provider.verified && (
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-0.5">
                        <svg className="w-3 h-3 text-emerald-600 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-[#a95f32] bg-amber-50/80 px-2 py-0.5 rounded-md">
                    {provider.distanceKm} km away
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {provider.name}
                </h3>

                {/* Address */}
                <p className="text-xs text-slate-500 mt-1">
                  {provider.address}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>

                {/* Info row: Open status & rating */}
                <div className="mt-3.5 flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span className={`inline-flex items-center gap-1 font-medium ${provider.isOpen ? "text-emerald-700" : "text-slate-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${provider.isOpen ? "bg-emerald-500" : "bg-slate-300"}`} />
                    {provider.isOpen ? "Open now" : "Closed"}
                  </span>
                  <span>•</span>
                  <span>★ {provider.rating} ({provider.reviews})</span>
                  <span>•</span>
                  <span className="truncate">{provider.animalsTreated?.slice(0, 3).join(", ")}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSosModalProvider(provider)}
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                    isEmergency
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      : "bg-[#a95f32] hover:bg-[#8e4922] text-white shadow-xs"
                  }`}
                >
                  <span>🚨</span>
                  <span>1-Click SOS</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors text-xs font-medium flex items-center gap-1"
                    title="Get Directions"
                  >
                    <span>Maps ↗</span>
                  </a>

                  <a
                    href={`tel:${provider.phone}`}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors text-xs"
                    title={`Call ${provider.phone}`}
                  >
                    📞
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-2xl mb-1">🔍</p>
          <h4 className="text-sm font-bold text-slate-800">No matching providers found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filters or widening the search radius.</p>
          <button
            onClick={() => {
              setSearchCity("");
              setSelectedService("");
              setRadiusKm(150);
              setOnlyOpenNow(false);
              setOnlyVerified(false);
            }}
            className="mt-3 text-xs font-semibold text-[#a95f32] hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* ----------------- 1-CLICK SOS MODAL ----------------- */}
      {sosModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>Emergency SOS Dispatch</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Contacting {sosModalProvider.name}</p>
              </div>
              <button
                onClick={() => setSosModalProvider(null)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Animal Name / Type (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Stray puppy / Dog Bruno"
                  value={sosPetDetails.petName}
                  onChange={(e) => setSosPetDetails({ ...sosPetDetails, petName: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#a95f32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Condition & Location</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hit by vehicle / Severe bleeding near Saket Metro"
                  value={sosPetDetails.notes}
                  onChange={(e) => setSosPetDetails({ ...sosPetDetails, notes: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#a95f32]"
                />
              </div>
            </div>

            <div className="flex gap-2.5">
              <a
                href={`https://wa.me/${sosModalProvider.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `🚨 EMERGENCY ANIMAL CARE REQUEST 🚨\n\nProvider: ${sosModalProvider.name}\nAnimal: ${
                    sosPetDetails.petName || "Animal in distress"
                  }\nCondition: ${sosPetDetails.notes || "Urgent medical attention required!"}\n\nPlease confirm availability!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>💬</span>
                <span>WhatsApp SOS</span>
              </a>

              <a
                href={`tel:${sosModalProvider.phone}`}
                className="flex-1 text-center bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>📞</span>
                <span>Direct Call</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
