import { describe, expect, it } from "vitest";

import { loginUser } from "@/lib/auth";

describe("authentication flow", () => {
  it("allows a valid pet parent to sign in and returns the user role", async () => {
    const result = await loginUser("aisha@animalcare.app", "Password123!");

    expect(result).not.toBeNull();
    expect(result?.user.email).toBe("aisha@animalcare.app");
    expect(result?.user.role).toBe("PET_PARENT");
  });

  it("rejects an invalid password", async () => {
    const result = await loginUser("aisha@animalcare.app", "incorrect-password");
    expect(result).toBeNull();
  });
});
