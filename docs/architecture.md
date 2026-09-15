# AnimalCare MVP architecture

## Product decisions

The prototype centers on the primary user need: helping a pet parent or rescuer identify an appropriate nearby provider quickly. The MVP prioritizes discovery, AI-guided triage, provider verification, and private medical document handling without expanding into payments, telemedicine, or pharmacy flows.

## Frontend architecture

- Next.js App Router with TypeScript
- Server render for purchase-critical views and page-level data
- Client components only for interactive forms such as login and AI navigator
- Tailwind for a responsive, mobile-first layout

## Backend architecture

The application follows a layered pattern:

- Route handlers / controllers
- Services
- Validation and authorization helpers
- Seed data / repository layer

This keeps UI code separate from business logic and makes it easier to replace the mock storage layer with PostgreSQL/PostGIS later.

## Security and data protection

- Password hashing uses secure password-based key derivation
- Sessions are stored as opaque cookies rather than exposing JWTs to the frontend
- All requests validate input with Zod schemas
- Object-level checks protect user-owned animal records
- AI outputs are validated against a strict schema before being used by the application

## Concurrency and reliability

- Provider and animal operations are designed around request-level validation and consistent data access
- The prototype avoids shared in-memory global state for sessions by storing session records on disk in the local data directory
- Long AI processing is modeled as an async queue pattern, even though the prototype uses synchronous mock responses for speed

## Resilience

- The AI request path fails closed: invalid or unsafe output is rejected and the app falls back to a normal recommendation flow
- All API routes return safe error payloads without exposing stack traces or internal data
