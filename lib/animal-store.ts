import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Animal, MedicalRecordEntry } from "./types";

const animalsFilePath = path.join(process.cwd(), "data", "animals.json");

const initialAnimals: Animal[] = [
  {
    id: "animal-bruno",
    name: "Bruno",
    species: "Dog",
    breed: "Golden Retriever",
    age: "4 years",
    ownerId: "user-pet-parent",
    gender: "Male",
    microchipId: "981020002938192",
    vaccinationStatus: "Up to date",
    timeline: [
      {
        id: "rec-1",
        date: "2026-08-15",
        title: "Annual 7-in-1 Booster (DHPPi+L)",
        type: "vaccination",
        notes: "Routine vaccination completed with Nobivac DHPPi. No adverse reaction observed.",
        vetName: "Dr. Meera Nair (Paws & Claws)",
        nextDueDate: "2027-08-15",
      },
      {
        id: "rec-2",
        date: "2026-07-10",
        title: "Anti-Rabies Vaccine (ARV)",
        type: "vaccination",
        notes: "Annual rabies prophylaxis shot administered.",
        vetName: "Dr. Meera Nair",
        nextDueDate: "2027-07-10",
      },
      {
        id: "rec-3",
        date: "2026-06-02",
        title: "Broad-Spectrum Deworming",
        type: "deworming",
        notes: "Administered Drontal Plus (1.5 tablets per weight 32kg).",
        vetName: "Dr. R. Sharma",
        nextDueDate: "2026-09-02",
      },
    ],
  },
  {
    id: "animal-milo",
    name: "Milo",
    species: "Cat",
    breed: "Persian Tabby",
    age: "2 years",
    ownerId: "user-pet-parent",
    gender: "Male",
    microchipId: "981020008821034",
    vaccinationStatus: "Due soon",
    timeline: [
      {
        id: "rec-4",
        date: "2026-05-20",
        title: "Tricat Trio (FVRCP Vaccine)",
        type: "vaccination",
        notes: "Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia vaccine administered.",
        vetName: "Dr. Meera Nair",
        nextDueDate: "2026-09-20",
      },
      {
        id: "rec-5",
        date: "2026-04-12",
        title: "Routine Dental Scaling & Checkup",
        type: "checkup",
        notes: "Mild plaque buildup cleaned. Gums healthy.",
        vetName: "Pet Care Clinic",
      },
    ],
  },
  {
    id: "animal-luna",
    name: "Luna",
    species: "Dog",
    breed: "Indian Indie",
    age: "1.5 years",
    ownerId: "user-rescuer",
    gender: "Female",
    microchipId: "INDIE-DEL-4921",
    vaccinationStatus: "Up to date",
    timeline: [
      {
        id: "rec-6",
        date: "2026-08-01",
        title: "Animal Birth Control (ABC) Spay Surgery",
        type: "surgery",
        notes: "Successful laparoscopic spay surgery by NGO veterinary team. Ear notched for identification.",
        vetName: "Delhi Street Pet Foundation",
      },
      {
        id: "rec-7",
        date: "2026-08-01",
        title: "Anti-Rabies Vaccine & 9-in-1 Primary",
        type: "vaccination",
        notes: "Community dog primary immunisation series.",
        vetName: "Dr. Ananya Ray",
        nextDueDate: "2027-08-01",
      },
    ],
  },
];

async function ensureStore(): Promise<Animal[]> {
  try {
    const content = await readFile(animalsFilePath, "utf8");
    const data = JSON.parse(content);
    if (Array.isArray(data) && data.length > 0) {
      return data as Animal[];
    }
    throw new Error("Empty store");
  } catch {
    await mkdir(path.dirname(animalsFilePath), { recursive: true });
    await writeFile(animalsFilePath, JSON.stringify(initialAnimals, null, 2), "utf8");
    return initialAnimals;
  }
}

export async function getAllAnimals(): Promise<Animal[]> {
  return await ensureStore();
}

export async function getAnimalById(id: string): Promise<Animal | null> {
  const all = await ensureStore();
  return all.find((a) => a.id === id) || null;
}

export async function createAnimal(
  data: Omit<Animal, "id">,
): Promise<Animal> {
  const all = await ensureStore();
  const newAnimal: Animal = {
    ...data,
    id: `animal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timeline: data.timeline || [],
  };
  all.unshift(newAnimal);
  await writeFile(animalsFilePath, JSON.stringify(all, null, 2), "utf8");
  return newAnimal;
}

export async function addTimelineEntry(
  animalId: string,
  entry: Omit<MedicalRecordEntry, "id">,
): Promise<MedicalRecordEntry | null> {
  const all = await ensureStore();
  const animalIndex = all.findIndex((a) => a.id === animalId);
  if (animalIndex === -1) return null;

  const newEntry: MedicalRecordEntry = {
    ...entry,
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };

  if (!all[animalIndex].timeline) {
    all[animalIndex].timeline = [];
  }
  all[animalIndex].timeline!.unshift(newEntry);

  await writeFile(animalsFilePath, JSON.stringify(all, null, 2), "utf8");
  return newEntry;
}

export async function deleteAnimal(id: string): Promise<boolean> {
  const all = await ensureStore();
  const filtered = all.filter((a) => a.id !== id);
  if (filtered.length === all.length) return false;
  await writeFile(animalsFilePath, JSON.stringify(filtered, null, 2), "utf8");
  return true;
}
