import { NextResponse } from "next/server";

import { getProviderById } from "@/lib/provider-service";
import { providerIdSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = providerIdSchema.safeParse(id);

  if (!parsed.success) {
    return NextResponse.json({ error: { code: "INVALID_ID", message: "Invalid provider identifier." } }, { status: 400 });
  }

  const provider = getProviderById(parsed.data);
  if (!provider) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Provider not found." } }, { status: 404 });
  }

  return NextResponse.json({ provider }, { status: 200 });
}
