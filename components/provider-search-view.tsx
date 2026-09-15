"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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

export function ProviderSearchView({
  initialProviders,
  defaultCity = "",
  defaultService = "",
}: ProviderSearchViewProps) {
  const [searchCity, setSearchCity] = useState(defaultCity);
  const [selectedService, setSelectedService] = useState(defaultService);
  const [radiusKm, setRadiusKm] = useState(50);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [sosModalProvider, setSosModalProvider] = useState<Provider | null>(null);
  const [sosPetDetails, setSosPetDetails] = useState({ petName: "", notes: "" });

  // Handle GPS location request
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Current GPS Location",
        });
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        setGeoError("Could not retrieve your location. Showing default city results.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Base reference coords for distance calculation
  const referenceCoords = useMemo(() => {
    if (userLocation) return { lat: userLocation.lat, lng: userLocation.lng };
    const cityKey = searchCity.trim().toLowerCase();
    if (cityKey && CITY_COORDINATES[cityKey]) return CITY_COORDINATES[cityKey];
    return CITY_COORDINATES.delhi; // Default fallback to Delhi
  }, [userLocation, searchCity]);

  // Compute distances & filter providers
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
        // City match
        if (searchCity.trim() && !userLocation) {
          const matchCity = provider.city.toLowerCase().includes(searchCity.trim().toLowerCase());
          if (!matchCity) return false;
        }
        // Service match
        if (selectedService && provider.type !== selectedService) {
          return false;
        }
        // Verified match
        if (onlyVerified && !provider.verified) {
          return false;
        }
        // Open now match
        if (onlyOpenNow && !provider.isOpen) {
          return false;
        }
        // Radius filter
        if (radiusKm && provider.distanceKm > radiusKm) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [initialProviders, referenceCoords, searchCity, selectedService, onlyVerified, onlyOpenNow, radiusKm, userLocation]);

  const serviceLabels: Record<string, string> = {
    veterinary_clinic: "🏥 Veterinary Clinic",
    emergency_vet: "🚨 Emergency Vet",
    animal_ambulance: "🚑 Animal Ambulance",
    ngo: "🤝 NGO & Rescue",
    rescuer: "🦸 Rescuer Volunteer",
    boarding: "🏡 Pet Boarding",
  };

  return (
    <div className="space-y-8">
      {/* ----------------- SEARCH & CONTROLS CARD ----------------- */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Discover Nearby Care & Emergency Services</h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Locate verified veterinary hospitals, emergency ambulances, and rescue NGOs with live distance calculation.
            </p>
          </div>

          {/* GPS Location Button */}
          <div>
            <button
              onClick={handleGetLocation}
              disabled={geoLoading}
              className={`flex items-center gap-2 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm ${
                userLocation
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-[#a95f32] text-white hover:bg-[#8e4922]"
              }`}
            >
              {geoLoading ? (
                <>
                  <span className="animate-spin text-sm">🔄</span>
                  <span>Detecting GPS...</span>
                </>
              ) : userLocation ? (
                <>
                  <span>📍</span>
                  <span>Using Your GPS Location</span>
                </>
              ) : (
                <>
                  <span>📍</span>
                  <span>Use My Live Location</span>
                </>
              )}
            </button>
            {geoError && <p className="text-[11px] text-rose-600 mt-1">{geoError}</p>}
          </div>
        </div>

        {/* Filters Form */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* City / Location Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Region</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Delhi, Mumbai, Bengaluru"
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  if (userLocation) setUserLocation(null); // Switch to manual city
                }}
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-[#a95f32]"
              />
              {searchCity && (
                <button
                  onClick={() => setSearchCity("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Service Type</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#a95f32]"
            >
              <option value="">All Services & Rescues</option>
              <option value="veterinary_clinic">🏥 Veterinary Clinic</option>
              <option value="emergency_vet">🚨 24/7 Emergency Vet</option>
              <option value="animal_ambulance">🚑 Animal Ambulance</option>
              <option value="ngo">🤝 NGO / Shelter</option>
              <option value="rescuer">🦸 Animal Rescuer</option>
              <option value="boarding">🏡 Pet Boarding</option>
            </select>
          </div>

          {/* Distance Radius Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Search Radius</label>
              <span className="text-xs font-bold text-[#a95f32]">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min={2}
              max={150}
              step={2}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[#a95f32] cursor-pointer"
            />
          </div>

          {/* Checkbox Toggles */}
          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded accent-[#a95f32] w-4 h-4"
              />
              <span>Verified Only 🛡️</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={(e) => setOnlyOpenNow(e.target.checked)}
                className="rounded accent-[#a95f32] w-4 h-4"
              />
              <span>Open Now 🟢</span>
            </label>
          </div>
        </div>
      </div>

      {/* ----------------- PROVIDER RESULTS COUNT & HEADER ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <p className="text-sm font-semibold text-slate-700">
          Showing <span className="font-bold text-[#a95f32]">{filteredProviders.length}</span> animal care providers
          {userLocation ? " sorted by distance from your current location" : " in this area"}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Sort: Proximity (Nearest First)</span>
        </div>
      </div>

      {/* ----------------- PROVIDER CARDS GRID ----------------- */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredProviders.map((provider) => {
          const isEmergency =
            provider.type === "emergency_vet" ||
            provider.type === "animal_ambulance" ||
            provider.emergencyAvailable;

          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${provider.coordinates.lat},${provider.coordinates.lng}`;

          return (
            <article
              key={provider.id}
              className={`group relative rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isEmergency ? "border-amber-300 ring-1 ring-amber-200/60" : "border-slate-200"
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#a95f32]">
                        {serviceLabels[provider.type] || provider.type}
                      </span>
                      {provider.emergencyAvailable && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                          24/7 SOS 🚨
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-xl font-bold text-slate-900 group-hover:text-[#a95f32] transition-colors">
                      {provider.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      provider.verified
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {provider.verified ? "Verified 🛡️" : "Unverified"}
                  </span>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2">{provider.description}</p>

                {/* Status & Distance badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-[#a95f32] bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                    📍 {provider.distanceKm} km away
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full font-semibold ${
                      provider.isOpen
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {provider.isOpen ? "🟢 Open Now" : "⚪ Closed"}
                  </span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
                    🏙️ {provider.city}
                  </span>
                </div>

                {/* Animal Types and Services */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {provider.animalsTreated?.map((item) => (
                    <span key={item} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      🐾 {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  <div className="font-semibold text-slate-800">⭐ {provider.rating} ({provider.reviews} reviews)</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">📍 {provider.address}</div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Emergency WhatsApp SOS Button */}
                  <button
                    onClick={() => setSosModalProvider(provider)}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-sm transition-all transform active:scale-95"
                    title="1-Click Emergency SOS / WhatsApp Dispatch"
                  >
                    <span>🚨</span>
                    <span>1-Click SOS</span>
                  </button>

                  {/* Google Maps link */}
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
                    title="Navigate in Google Maps"
                  >
                    🗺️
                  </a>

                  {/* Direct Call Link */}
                  <a
                    href={`tel:${provider.phone}`}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
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
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-4xl mb-2">🔍</p>
          <h3 className="text-lg font-bold text-slate-900">No Providers Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try expanding the search radius slider, selecting "All Services", or resetting city filters.
          </p>
          <button
            onClick={() => {
              setSearchCity("");
              setSelectedService("");
              setRadiusKm(100);
              setOnlyVerified(false);
              setOnlyOpenNow(false);
            }}
            className="mt-4 text-xs font-bold text-white bg-[#a95f32] px-5 py-2.5 rounded-full shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ----------------- 1-CLICK SOS EMERGENCY DISPATCH MODAL ----------------- */}
      {sosModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-300 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-rose-100 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce">🚨</span>
                <div>
                  <h3 className="text-lg font-bold text-rose-900">Emergency Animal Dispatch</h3>
                  <p className="text-xs text-rose-700">Contacting {sosModalProvider.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSosModalProvider(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Send an instant pre-formatted emergency dispatch alert via WhatsApp or initiate a direct emergency phone call.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pet / Animal Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bruno (or Stray Pup)"
                  value={sosPetDetails.petName}
                  onChange={(e) => setSosPetDetails({ ...sosPetDetails, petName: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Condition / Symptoms</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Hit by car / Severe bleeding / Unconscious / Ingested toxic substance"
                  value={sosPetDetails.notes}
                  onChange={(e) => setSosPetDetails({ ...sosPetDetails, notes: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* WhatsApp SOS Button */}
              <a
                href={`https://wa.me/${sosModalProvider.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `🚨 EMERGENCY ANIMAL CARE REQUEST 🚨\n\nProvider: ${sosModalProvider.name}\nAnimal: ${
                    sosPetDetails.petName || "Animal in distress"
                  }\nCondition: ${sosPetDetails.notes || "Urgent emergency medical attention required!"}\n\nPlease confirm availability and dispatch guidance immediately!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>Send WhatsApp SOS</span>
              </a>

              {/* Direct Call Button */}
              <a
                href={`tel:${sosModalProvider.phone}`}
                className="flex-1 text-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>📞</span>
                <span>Direct Emergency Call</span>
              </a>
            </div>

            <button
              onClick={() => setSosModalProvider(null)}
              className="w-full mt-3 text-center text-xs font-medium text-slate-500 hover:text-slate-800 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
