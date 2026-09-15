import { z } from "zod";

import type { CareNavigationResult, MedicalSummary, ProviderType } from "./types";

export const careNavigationSchema = z.object({
  species: z.string().min(2).max(24),
  recommended_service: z.enum([
    "veterinary_clinic",
    "emergency_vet",
    "animal_ambulance",
    "ngo",
    "rescuer",
    "boarding",
  ]),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  reason: z.string().min(20).max(350),
  recommended_action: z.string().min(10).max(180),
  missing_information: z.array(z.string()).max(5),
});

/**
 * Deterministic fallback rule-based triage parser
 */
export function buildCareNavigationResponse(prompt: string): CareNavigationResult {
  const normalized = prompt.toLowerCase();

  const species = /dog|puppy|hound/.test(normalized)
    ? "dog"
    : /cat|kitten|feline/.test(normalized)
      ? "cat"
      : /bird|parrot|pigeon/.test(normalized)
        ? "bird"
        : /cow|goat|buffalo|cattle/.test(normalized)
          ? "cow"
          : "other";

  const emergencyKeywords = [
    "bleeding",
    "collapsed",
    "difficulty breathing",
    "seizure",
    "unresponsive",
    "poison",
    "broken leg",
    "accident",
  ];

  const urgency: CareNavigationResult["urgency"] = emergencyKeywords.some((keyword) => normalized.includes(keyword))
    ? "emergency"
    : /vomiting|weak|fever|injured|limping|pain/.test(normalized)
      ? "high"
      : "medium";

  const recommended_service: ProviderType = urgency === "emergency"
    ? "emergency_vet"
    : /stray|injured|rescue/.test(normalized)
      ? "ngo"
      : /ambulance|transport|critical/.test(normalized)
        ? "animal_ambulance"
        : "veterinary_clinic";

  const missingInformation = [
    "Date and duration of symptoms",
    "Current symptoms and severity",
    "Whether the animal is eating or drinking",
  ].filter((item) => !normalized.includes(item.toLowerCase().replace(/[^a-z ]/g, "")));

  return {
    species,
    recommended_service,
    urgency,
    reason: "The symptoms described may require veterinary evaluation and should be reviewed by a qualified professional as soon as possible.",
    recommended_action: recommended_service === "emergency_vet" ? "Find the nearest emergency veterinary provider now" : "Find a nearby veterinary provider and share the animal's symptoms",
    missing_information: missingInformation.slice(0, 3),
  };
}

/**
 * Live LLM Care Navigation with fallback
 */
export async function getCareNavigation(prompt: string): Promise<CareNavigationResult> {
  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;

  if (apiKey && apiKey !== "replace-me") {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content: `You are an expert veterinary triage AI assistant for an Indian animal welfare platform (AnimalCare/Practo for Animals).
Analyze the user's reported animal symptoms and output ONLY valid JSON matching this schema:
{
  "species": "dog" | "cat" | "bird" | "cow" | "other",
  "recommended_service": "veterinary_clinic" | "emergency_vet" | "animal_ambulance" | "ngo" | "rescuer" | "boarding",
  "urgency": "low" | "medium" | "high" | "emergency",
  "reason": "Clear explanation of why this urgency level was selected (20 to 300 characters)",
  "recommended_action": "Immediate first-aid or next step action (10 to 150 characters)",
  "missing_information": ["Array of up to 4 missing clinical details needed by the vet"]
}
Never prescribe human or animal drugs. Fail safe with high/emergency urgency if signs of severe distress, bleeding, collapse, or poisoning are mentioned. Return raw JSON without markdown code blocks.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const validated = careNavigationSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      }
    } catch (err) {
      console.warn("Groq AI triage call failed, falling back to deterministic engine:", err);
    }
  }

  return buildCareNavigationResponse(prompt);
}

/**
 * Deterministic fallback for document summary
 */
export function buildDocumentSummary(text: string, animalName = "Animal"): MedicalSummary {
  const normalized = text.toLowerCase();
  const keyObservations = [
    normalized.includes("vomiting") ? "Vomiting observed" : "No vomiting described",
    normalized.includes("weak") || normalized.includes("lethargic") ? "Reduced energy or weakness noted" : "Energy level not clearly documented",
    normalized.includes("fever") ? "Temperature concerns noted" : "Temperature not specifically mentioned",
  ];

  const tests = [
    "CBC review",
    "General examination",
    normalized.includes("blood") ? "Blood profile" : "Repeat blood markers if advised",
  ];

  const medications = [
    normalized.includes("antibiotic") ? "Antibiotic therapy" : "No antibiotic mentioned",
    normalized.includes("vitamin") ? "Vitamin supplement" : "No vitamin supplement mentioned",
  ];

  return {
    animalName,
    reportDate: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    keyObservations: keyObservations.filter(Boolean),
    tests: tests.filter(Boolean),
    medications: medications.filter(Boolean),
    followUpInstructions: [
      "Repeat any prescribed medication only under veterinary guidance.",
      "Monitor appetite, hydration, and activity closely.",
      "Seek emergency veterinary care if breathing, severe weakness, or bleeding worsens.",
    ],
    disclaimer: "AI-generated informational summary. This is not a veterinary diagnosis.",
  };
}

/**
 * Live LLM Medical Document Summary with fallback
 */
export async function getDocumentSummary(text: string, animalName = "Animal"): Promise<MedicalSummary> {
  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;

  if (apiKey && apiKey !== "replace-me") {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content: `You are an AI veterinary medical records summarizer for AnimalCare.
Analyze the veterinary notes/prescription/lab report for animal "${animalName}" and return ONLY raw JSON matching this format:
{
  "keyObservations": ["List of clinical observations and symptoms extracted"],
  "tests": ["List of diagnostic tests mentioned or recommended"],
  "medications": ["List of medications, dosage, or therapies mentioned"],
  "followUpInstructions": ["List of follow-up care actions and monitoring advice"]
}
Return raw JSON without markdown code fences.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            animalName,
            reportDate: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            keyObservations: Array.isArray(parsed.keyObservations) ? parsed.keyObservations : [],
            tests: Array.isArray(parsed.tests) ? parsed.tests : [],
            medications: Array.isArray(parsed.medications) ? parsed.medications : [],
            followUpInstructions: Array.isArray(parsed.followUpInstructions)
              ? parsed.followUpInstructions
              : ["Monitor appetite and hydration closely.", "Seek vet care if condition worsens."],
            disclaimer: "AI-generated informational summary. This is not a veterinary diagnosis.",
          };
        }
      }
    } catch (err) {
      console.warn("Groq AI medical summary failed, falling back:", err);
    }
  }

  return buildDocumentSummary(text, animalName);
}
