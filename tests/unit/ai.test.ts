import { describe, expect, it } from "vitest";

import { buildCareNavigationResponse, careNavigationSchema } from "@/lib/ai";
import { medicalSummaryInputSchema } from "@/lib/validation";

describe("AI safety and validation", () => {
  it("creates a safe care navigation payload", () => {
    const payload = buildCareNavigationResponse("My dog has been vomiting since morning and seems very weak.");
    const parsed = careNavigationSchema.safeParse(payload);

    expect(parsed.success).toBe(true);
    expect(payload.urgency).toMatch(/high|medium|emergency/);
    expect(payload.reason).toContain("may require veterinary evaluation");
  });

  it("accepts a valid medical summary request and rejects unsafe input", () => {
    expect(
      medicalSummaryInputSchema.safeParse({
        animalName: "Bruno",
        documentText: "Blood report shows mild dehydration and reduced appetite. Follow-up with vet in 48 hours.",
      }).success,
    ).toBe(true);

    expect(
      medicalSummaryInputSchema.safeParse({
        animalName: "B",
        documentText: "short",
      }).success,
    ).toBe(false);
  });
});
