import { NextResponse } from "next/server";

import { getDocumentSummary } from "@/lib/ai";
import { medicalSummaryInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = medicalSummaryInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Please provide the animal name and a valid medical document description.",
          },
        },
        { status: 400 },
      );
    }

    const summary = await getDocumentSummary(parsed.data.documentText, parsed.data.animalName);
    return NextResponse.json({ summary }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Unable to process the document summary request.",
        },
      },
      { status: 500 },
    );
  }
}
