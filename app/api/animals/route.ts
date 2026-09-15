import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUser } from "@/lib/auth";
import { getAllAnimals, createAnimal } from "@/lib/animal-store";

const createAnimalSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  species: z.string().min(1, "Species is required").max(40),
  breed: z.string().min(1, "Breed is required").max(60),
  age: z.string().min(1, "Age is required").max(30),
  gender: z.enum(["Male", "Female", "Unknown"]).optional(),
  microchipId: z.string().max(40).optional(),
  vaccinationStatus: z.enum(["Up to date", "Due soon", "Overdue", "Incomplete"]).optional(),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  const all = await getAllAnimals();

  // If user is authenticated, prioritize user-owned animals + public rescues
  if (user) {
    const userAnimals = all.filter((a) => a.ownerId === user.id || a.ownerId.startsWith("user-"));
    return NextResponse.json({ animals: userAnimals }, { status: 200 });
  }

  return NextResponse.json({ animals: all }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const ownerId = user ? user.id : "user-pet-parent";

    const body = await request.json();
    const parsed = createAnimalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message || "Invalid input." } },
        { status: 400 },
      );
    }

    const created = await createAnimal({
      ...parsed.data,
      ownerId,
      gender: parsed.data.gender || "Unknown",
      vaccinationStatus: parsed.data.vaccinationStatus || "Up to date",
      timeline: [],
    });

    return NextResponse.json({ animal: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create animal profile." } },
      { status: 500 },
    );
  }
}
