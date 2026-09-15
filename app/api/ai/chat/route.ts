import { NextResponse } from "next/server";
import { z } from "zod";

const chatInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1).max(2000),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid message format." } },
        { status: 400 },
      );
    }

    const userMessages = parsed.data.messages;
    const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;

    const systemPrompt = `You are "Pawzz AI", the certified, dedicated animal-care and veterinary triage assistant for AnimalCare (India's platform for pet parents, rescuers, and veterinarians).

### STRICT DOMAIN SCOPE & BOUNDARIES:
- You are EXCLUSIVELY permitted to assist with topics related to animals, veterinary health, pet care, stray/rescue triage, animal nutrition, vaccination, animal ambulances, NGOs, and the AnimalCare platform.
- If the user asks about ANYTHING OUTSIDE animal care (e.g. computer coding, math, general trivia, human illness, politics, entertainment, finance, general writing, or non-animal questions), you MUST POLITELY DECLINE with this exact sentiment:
  "I am Pawzz AI, dedicated exclusively to animal health, pet parenting, and animal rescue on AnimalCare. I cannot assist with non-animal topics. How can I help with your pet or rescue animal today? 🐾"

### ACCURACY & CLINICAL SAFETY RULES:
1. NEVER PRESCRIBE HUMAN MEDICATIONS: Never suggest human painkillers or drugs (Paracetamol, Ibuprofen, Diclofenac, Aspirin, etc. are toxic and fatal to dogs and cats).
2. NO EXACT DRUG DOSAGES: Never prescribe specific prescription drug dosages. Always instruct the user that medications require in-person veterinary prescription.
3. EMERGENCY DETECTION: If the animal is showing signs of life-threatening distress (heavy bleeding, poisoning, seizures, collapse, breathing distress, heatstroke, vehicle accident, pale gums), highlight in bold to take the animal to the nearest 24/7 veterinary clinic or call an animal ambulance immediately.
4. PRACTICAL & ACCURATE GUIDANCE: Provide safe, verified first-aid (e.g., wound cleaning with sterile saline, keeping warm, hydration with oral rehydration solution, gentle monitoring).
5. INDIAN CONTEXT: Be knowledgeable about Indian conditions (parvovirus, tick fever, street dog rescue, rabies prevention, Animal Birth Control / ABC rules).
6. TONE: Empathetic, calm, structured with clear bullet points, and concise.`;

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
            temperature: 0.3,
            max_tokens: 600,
            messages: [
              { role: "system", content: systemPrompt },
              ...userMessages,
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return NextResponse.json({ reply }, { status: 200 });
          }
        }
      } catch (err) {
        console.warn("Groq AI chat call error:", err);
      }
    }

    // Fallback response if API key is not set or network fails
    const lastUserMessage = userMessages[userMessages.length - 1].content.toLowerCase();
    let fallbackReply = "Thank you for reaching out to AnimalCare AI. For general pet health concerns, monitor your pet's hydration, appetite, and body temperature. If symptoms persist for more than 24 hours, please consult a verified nearby veterinarian.";

    if (/vomit|blood|diarrhea|accident|poison|choking|breath/.test(lastUserMessage)) {
      fallbackReply = "🚨 **Urgent Attention Advised**: The symptoms you described require prompt evaluation. Please keep the animal calm, do not administer human medications, and take them to the nearest 24/7 veterinary clinic or contact an animal ambulance immediately.";
    } else if (/food|diet|feed|eat/.test(lastUserMessage)) {
      fallbackReply = "🐾 **Dietary Guidance**: Ensure fresh water is always accessible. Avoid toxic foods like onions, garlic, chocolate, grapes, and cooked bones. For species-specific diet plans, consult our directory of verified nutritionists and clinics.";
    } else if (/vaccin|deworm/.test(lastUserMessage)) {
      fallbackReply = "💉 **Preventive Care**: Puppies and kittens require primary vaccine series (DHPPi/FVRCP + Anti-Rabies) starting at 6–8 weeks, followed by annual boosters and regular 3-month deworming.";
    }

    return NextResponse.json({ reply: fallbackReply }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: { message: "Internal server error during chat processing." } },
      { status: 500 },
    );
  }
}
