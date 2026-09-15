"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("aisha@animalcare.app");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "Login failed.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-900"
          placeholder="name@example.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-900"
          placeholder="••••••••"
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-xs text-slate-500">
        Demo login: aisha@animalcare.app / Password123!
      </p>
    </form>
  );
}
