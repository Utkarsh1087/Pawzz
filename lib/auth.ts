import { cookies } from "next/headers";
import { z } from "zod";

import { users } from "./seed-data";
import { verifyPassword } from "./password";
import { createSession, getSessionUserId } from "./session-store";
import type { Role, User } from "./types";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const matchingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

  if (!matchingUser || !verifyPassword(password, matchingUser.passwordHash)) {
    return null;
  }

  const token = await createSession(matchingUser.id);
  return { user: matchingUser, token };
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const sessionStore = await cookies();
  const token = sessionStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const userId = await getSessionUserId(token);
  if (!userId) {
    return null;
  }

  return users.find((user) => user.id === userId) ?? null;
}

export function requireRole(user: User | null, allowed: Role[]): User {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function requireOwnership(user: User | null, ownerId: string): User {
  if (!user || user.id !== ownerId) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
