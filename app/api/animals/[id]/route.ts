import { NextResponse } from "next/server";
import { z } from "zod";

import { getAnimalById, addTimelineEntry, deleteAnimal } from "@/lib/animal-store";

const timelineEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  title: z.string().min(2, "Title is required").max(100),
  type: z.enum(["vaccination", "deworming", "checkup", "surgery", "prescription", "other"]),
  notes: z.string().max(500).default(""),
  vetName: z.string().max(100).optional(),
  nextDueDate: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const animal = await getAnimalById(id);

  if (!animal) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Animal record not found." } }, { status: 404 });
  }

  return NextResponse.json({ animal }, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = timelineEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message || "Invalid input." } },
        { status: 400 },
      );
    }

    const newEntry = await addTimelineEntry(id, parsed.data);
    if (!newEntry) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Animal not found." } }, { status: 404 });
    }

    return NextResponse.json({ entry: newEntry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to add timeline record." } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = await deleteAnimal(id);
  if (!deleted) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Animal not found." } }, { status: 404 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
