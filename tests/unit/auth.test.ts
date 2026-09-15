import { describe, expect, it } from "vitest";

import { loginSchema } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("authentication utilities", () => {
  it("hashes and validates a password securely", () => {
    const plainText = "Password123!";
    const stored = hashPassword(plainText);

    expect(verifyPassword(plainText, stored)).toBe(true);
    expect(verifyPassword("WrongPassword!", stored)).toBe(false);
  });

  it("validates login inputs", () => {
    expect(loginSchema.safeParse({ email: "aisha@animalcare.app", password: "Password123!" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "short" }).success).toBe(false);
  });
});
