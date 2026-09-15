# 🐾 Pawzz (AnimalCare) — Practo for Animals & Rescues

**Pawzz** is a modern, unified healthcare and emergency response platform for domestic pets and community rescue animals. Built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Groq-powered AI, Pawzz connects pet parents and rescuers with nearby veterinary hospitals, 24/7 emergency ambulances, and verified NGOs across India.

---

## ✨ Features & Capabilities

### 1. 📍 Live GPS Provider Discovery & 1-Click SOS Dispatch
- **Live GPS Proximity**: Uses browser geolocation and the Haversine formula to compute exact distance (e.g. `2.4 km away`) and sort providers nearest-first.
- **Radius & Filter Controls**: Search by city (Delhi, Mumbai, Bengaluru, Hyderabad, Chandigarh), service type, radius slider (2 km – 150 km), and Open Now / Verified status.
- **1-Click WhatsApp SOS**: Instant pre-formatted emergency dispatch modal for urgent veterinary ambulance requests and direct calling (`tel:`).
- **Google Maps Integration**: Direct one-tap navigation route linking.

### 2. 📋 Animal Profiles & Medical Timeline
- **Profile Management**: Register domestic and community animals with species, breed, age, gender, microchip tags, and vaccination badges.
- **Chronological Clinical Timeline**: Record vaccinations, deworming cycles, routine checkups, surgeries, and prescriptions with doctor names and next due date alerts.
- **Persistent Storage**: Backed by a disk-persisted data layer for profile CRUD operations.

### 3. 📄 AI Veterinary Medical Document Parser
- **Discharge & Prescription Parsing**: Extracts key clinical observations, lab tests, medications, and follow-up care instructions from raw vet notes.
- **Timeline Integration**: Save generated clinical insights directly into any registered animal's medical timeline with 1 click.

### 4. 🤖 Guardrailed AI Care Navigator & Assistant
- **Live Groq LLM Integration**: Powered by `openai/gpt-oss-120b` for ultra-fast, contextual triage and first-aid recommendations.
- **Strict Safety Guardrails**: Restricted strictly to animal healthcare, veterinary navigation, and pet welfare. Refuses non-animal queries and strictly prohibits advising human medications for pets.
- **Interactive Assistant Mascot**: Compact floating cat assistant with speech bubble and cursor-tracking pet trio in the footer.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **AI / LLM Engine**: [Groq Cloud](https://groq.com/) (`openai/gpt-oss-120b`)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pawzz.git
   cd pawzz/pawzz
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add your Groq API key in `.env.local`:
   ```env
   GROQ_API_KEY="gsk_your_groq_api_key_here"
   GROQ_MODEL="openai/gpt-oss-120b"
   SESSION_SECRET="your-random-32-char-secret"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests & Build

```bash
# Run unit & integration test suite
npm test

# Build for production
npm run build
```

---

## 📂 Project Structure

```text
pawzz/
├── app/
│   ├── ai/                 # AI Care Navigator consultation view
│   ├── animals/            # Animal profiles & [id] medical timeline
│   ├── api/                # API endpoints (AI chat, animals, auth, providers)
│   ├── login/              # Authentication & user session view
│   ├── medical/            # AI Medical document parser
│   ├── providers/          # GPS provider discovery & SOS dispatch
│   ├── layout.tsx          # Root layout with floating AI widget & navbar
│   └── page.tsx            # Home landing page
├── components/             # Reusable UI components
├── data/                   # Persistent JSON storage for animals & sessions
├── lib/                    # Business logic (AI service, provider math, auth)
└── tests/                  # Vitest unit & integration tests
```

---

## 🛡️ License

MIT License. Designed for pet parents, veterinary professionals, and animal rescuers.

