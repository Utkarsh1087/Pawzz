export type Role = "PET_PARENT" | "RESCUER" | "PROVIDER" | "ADMIN";
export type ProviderType =
  | "veterinary_clinic"
  | "emergency_vet"
  | "animal_ambulance"
  | "ngo"
  | "rescuer"
  | "boarding";

export type ServiceUrgency = "low" | "medium" | "high" | "emergency";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  city: string;
  phone: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  city: string;
  address: string;
  phone: string;
  verified: boolean;
  status: "open" | "closed";
  emergencyAvailable: boolean;
  description: string;
  animalsTreated: string[];
  services: string[];
  operatingHours: { day: string; open: string; close: string }[];
  coordinates: { lat: number; lng: number };
  rating: number;
  reviews: number;
}

export interface MedicalRecordEntry {
  id: string;
  date: string;
  title: string;
  type: "vaccination" | "deworming" | "checkup" | "surgery" | "prescription" | "other";
  notes: string;
  vetName?: string;
  nextDueDate?: string;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  ownerId: string;
  gender?: "Male" | "Female" | "Unknown";
  microchipId?: string;
  vaccinationStatus?: "Up to date" | "Due soon" | "Overdue" | "Incomplete";
  timeline?: MedicalRecordEntry[];
}

export interface SearchCriteria {
  service?: string;
  city?: string;
  radiusKm?: number;
  verifiedOnly?: boolean;
  openNow?: boolean;
}

export interface CareNavigationResult {
  species: string;
  recommended_service: ProviderType;
  urgency: ServiceUrgency;
  reason: string;
  recommended_action: string;
  missing_information: string[];
}

export interface MedicalSummary {
  animalName: string;
  reportDate: string;
  keyObservations: string[];
  tests: string[];
  medications: string[];
  followUpInstructions: string[];
  disclaimer: string;
}
