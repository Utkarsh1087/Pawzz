import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface SessionRecord {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

const sessionPath = path.join(process.cwd(), "data", "sessions.json");

async function ensureStore(): Promise<Record<string, SessionRecord>> {
  try {
    const content = await readFile(sessionPath, "utf8");
    return JSON.parse(content) as Record<string, SessionRecord>;
  } catch {
    await mkdir(path.dirname(sessionPath), { recursive: true });
    await writeFile(sessionPath, JSON.stringify({}), "utf8");
    return {};
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const sessions = await ensureStore();
  const now = new Date();
  sessions[token] = {
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };
  await writeFile(sessionPath, JSON.stringify(sessions, null, 2), "utf8");
  return token;
}

export async function getSessionUserId(token: string): Promise<string | null> {
  const sessions = await ensureStore();
  const record = sessions[token];
  if (!record) {
    return null;
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    delete sessions[token];
    await writeFile(sessionPath, JSON.stringify(sessions, null, 2), "utf8");
    return null;
  }

  return record.userId;
}

export async function destroySession(token: string): Promise<void> {
  const sessions = await ensureStore();
  delete sessions[token];
  await writeFile(sessionPath, JSON.stringify(sessions, null, 2), "utf8");
}
