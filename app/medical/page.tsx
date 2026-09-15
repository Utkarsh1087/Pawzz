import { MedicalSummaryForm } from "@/components/medical-summary-form";

export default function MedicalDocumentPage() {
  return (
    <div className="app-page mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Medical document AI</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Summarize reports and prescriptions</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          The system extracts key observations and follow-ups while making it clear that the result is informational only and not a veterinary diagnosis.
        </p>
      </div>

      <MedicalSummaryForm />
    </div>
  );
}
