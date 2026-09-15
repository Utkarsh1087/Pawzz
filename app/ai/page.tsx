import { AICareForm } from "@/components/ai-care-form";

export default function AINavigatorPage() {
  return (
    <div className="app-page mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">AI Care Navigator</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Describe what the animal is experiencing</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          The AI supports with urgency assessment and service recommendations. It never diagnoses and always recommends professional veterinary care.
        </p>
      </div>

      <AICareForm />
    </div>
  );
}
