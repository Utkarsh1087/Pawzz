import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="app-page mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Secure sign in</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Your animal care dashboard</h1>
          <p className="mt-3 max-w-lg text-slate-600">
            Stay in control of your animal profiles, medical summaries, and provider interactions with secure access.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
