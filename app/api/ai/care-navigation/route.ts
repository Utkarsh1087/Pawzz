import { NextResponse } from "next/server";

import { getCareNavigation, careNavigationSchema } from "@/lib/ai";
import { careNavigationInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = careNavigationInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Please describe the animal's symptoms in a bit more detail.",
          },
        },
        { status: 400 },
      );
    }

    const response = await getCareNavigation(parsed.data.prompt);
    const validated = careNavigationSchema.safeParse(response);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: {
            code: "AI_VALIDATION_FAILED",
            message: "The AI could not provide a safe recommendation. Please try a different description.",
          },
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ result: validated.data }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Unable to process the care navigation request.",
        },
      },
      { status: 500 },
    );
  }
}
