# 07 — Codebase Structure Specification

## 1. Document Control

* **Document ID:** CODE-001
* **Document Name:** Tejaswini AI English Tutor - Codebase Structure Specification
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Beginner)
* **Owner:** Principal Software Architect
* **Source of Truth:** Authoritative specification for physical repository organization, dependency rules, client/server boundaries, and module architecture.

## 2. Purpose

This document defines exactly how the repository must be structured so that Google Antigravity and future developers can implement the application consistently. It provides a rigid, unambiguous physical architecture preventing spaghetti code, scattered API calls, and leaked secrets.

## 3. Scope

The scope covers the complete Next.js full-stack repository. It includes directory hierarchies, file placement rules, feature boundaries, AI and database isolation, state management location, testing infrastructure, and environment configuration.

## 4. Source Documents and Authority

This structure implements the boundaries and requirements established by:

1. `01_PRODUCT_REQUIREMENTS.md`
2. `02_LEARNING_CURRICULUM.md`
3. `03_UX_SPECIFICATION.md`
4. `04_UI_DESIGN_SYSTEM.md`
5. `05_APPLICATION_ARCHITECTURE.md` (Primary technical authority)
6. `06_DATABASE_SCHEMA.md`

## 5. Codebase Architecture Goals

* **Clear Separation of Concerns:** UI is dumb; Services are smart; Infrastructure is isolated.
* **Server/Client Boundary Clarity:** Absolute physical isolation of server-only secrets and database administrative keys from browser bundles.
* **High Cohesion via Feature Slices:** Code that changes together lives together (Feature-Based Architecture).
* **Discoverability:** A developer or AI agent should guess where a file lives on the first try.
* **Antigravity Consistency:** Strict guardrails preventing AI agents from inventing arbitrary utility folders or REST patterns when Server Actions are mandated.

## 6. Codebase Principles

* **Strict Feature Isolation:** A feature cannot deeply import from another feature's internal directories.
* **Design System Purity:** `components/ui` contains only reusable, domain-agnostic styling components.
* **Zod at the Borders:** Every Server Action and API response is validated via Zod schemas.
* **Dependency Inversion (Lite):** External SDKs (Gemini, Supabase) are wrapped in `src/lib`, not imported directly into React components.

## 7. Repository Architecture Overview

The application uses a **Feature-Sliced Next.js App Router** architecture located entirely within a `src/` directory, supported by isolated `lib/` integrations and a centralized `tests/` directory.

## 8. Canonical Repository Structure

*Decision:* The repository MUST use a `src/` directory rather than placing application code in the repository root.

* *Why:* It clearly separates application source code from configuration files (Tailwind, ESLint, TypeScript, Next.js configs), significantly improving root-level readability and preventing accidental module resolution errors.

## 9. Root-Level Files

The root directory is strictly for repository configuration, package management, and documentation. Application business logic is forbidden in the root.

## 10. Source Directory Strategy

The `src/` directory contains:

* `app/`: Next.js routing and pages.
* `components/`: Global/shared UI design system components.
* `features/`: Domain-specific business logic, UI, and Server Actions.
* `lib/`: Infrastructure wrappers (Gemini, Supabase, Web Speech).
* `config/`: Environment and app-level configurations.
* `types/`: Global and generated TypeScript definitions.

## 11. Next.js App Router Structure

The `src/app/` directory handles routing, layouts, and data pre-fetching. It relies on `features/` for actual UI and business logic implementation. Page components should be thin wrappers.

## 12. Route Groups

The `app/` directory uses route groups to share layouts without affecting the URL path:

* `(auth)`: Contains `/login`. Wraps authentication UI.
* `(app)`: Contains `/dashboard`, `/practice`, `/summary`. Wraps the authenticated application shell, verifying session cookies before rendering.

## 13. Next.js Special Files

* `layout.tsx`: Root and route-group layouts (e.g., App Shell).
* `page.tsx`: Route entry points.
* `loading.tsx`: Suspense fallbacks for server-rendered routes.
* `error.tsx`: Catch-all error boundaries (Client components).
* `not-found.tsx`: 404 handling.

## 14. Server/Client Component Boundaries

* **SERVER:** By default, all files in `src/app/` are Server Components. All database reads and Gemini calls occur here or in Server Actions.
* **CLIENT:** Files requiring browser APIs (Web Speech), interactive state (React hooks), or event listeners (onClick) MUST include the `"use client"` directive at the very top.
* **Rule:** Client components must be pushed down the tree as far as possible (leaf nodes). Server components may pass data as props to Client components, but Client components cannot import Server components directly.

## 15. Feature-Based Organization

Business logic is grouped by domain feature inside `src/features/`.
Current Features:

* `auth`: Login and session management.
* `practice`: Core translation loop, voice input, AI evaluation, and session tracking.
* `progress`: XP, mistake history, and dashboard metrics.
* `curriculum`: Static curriculum stage definitions and concepts.

## 16. Domain Organization

Domain logic (pure functions, business rules) lives within the feature's `services/` or `utils/` directory. There is no global `src/domain/` folder, ensuring features remain cohesive.

## 17. Shared UI Architecture

`src/components/ui/` contains domain-agnostic components (Buttons, Inputs, Cards). These are highly reusable and map directly to `04_UI_DESIGN_SYSTEM.md`. They contain zero business logic.

## 18. Design-System Implementation Boundaries

* **Design Tokens:** Defined in `tailwind.config.ts` and `src/styles/globals.css`.
* **Component Variants:** Defined using `class-variance-authority` (CVA) within `src/components/ui/`.
* **Icons:** Managed via `lucide-react` (or similar) within shared components.

## 19. AI Module Architecture

`src/lib/ai/` isolates all external AI dependencies.

* `gemini.ts`: Initializes the `@google/genai` client using the server-only `GEMINI_API_KEY`.
* It exposes wrapper functions (e.g., `evaluateTranslation`) that the feature services call. React components NEVER import `src/lib/ai/`.

## 20. AI Prompt Organization

`src/lib/ai/prompts/` contains TypeScript files exporting string templates or system instruction builders (e.g., `evaluation-prompt.ts`). Prompt logic is separated from API execution logic.

## 21. AI Schema Organization

`src/lib/ai/schemas/` contains the Zod schemas representing the `responseSchema` required by Gemini's structured outputs (e.g., `evaluation-response.schema.ts`).

## 22. Database Module Architecture

`src/lib/db/` abstracts Supabase initialization.

* `client.ts`: Initializes the Supabase client using `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Browser safe).
* `server.ts`: Initializes the Supabase client using cookies for Server Components.
* `admin.ts`: Initializes the Supabase client using `SUPABASE_SERVICE_ROLE_KEY` (Strictly Server-Only, bypasses RLS).

## 23. Supabase Boundaries

* UI components may ONLY import `src/lib/db/client.ts`.
* Server Actions and API Routes may import `server.ts` or `admin.ts`.
* A strict linting rule or architectural convention must prevent `admin.ts` from being imported into any file marked `"use client"`.

## 24. Database Type Organization

Generated database types from the Supabase CLI live exclusively in `src/types/database.types.ts`. All feature services import these canonical types.

## 25. Runtime Validation Schema Organization

Zod schemas are colocated with their features in `src/features/[feature]/schemas/`.

* Example: `submit-answer.schema.ts` ensures the client payload matches expected types before the Server Action processes it.

## 26. Application-Service Architecture

Services encapsulate business orchestration. They live in `src/features/[feature]/services/`.

* A service (e.g., `evaluation.service.ts`) imports the DB admin client, the AI client, and orchestrates the transaction. Server Actions are thin wrappers around these services.

## 27. Use-Case Organization

Use cases map 1:1 with Server Actions in `src/features/[feature]/actions/`.
Examples: `submitAttemptAction`, `startSessionAction`, `completeSessionAction`.

## 28. Practice Session Code Organization

The `practice` feature is the core of the app:

* `components/`: `chat-interface.tsx`, `transcription-editor.tsx`, `evaluation-card.tsx`.
* `hooks/`: `use-practice-session.ts` (manages local React state and `localStorage` recovery).
* `actions/`: Server actions for DB/AI mutations.
* `services/`: Domain logic for parsing evaluation JSON.

## 29. Voice Module Architecture

`src/lib/speech/` isolates browser native APIs.

* `recognition.ts`: Wraps `webkitSpeechRecognition`.
* `synthesis.ts`: Wraps `window.speechSynthesis`.
* This module is imported entirely by Client Components (e.g., `use-voice.ts` hook in the practice feature). It must NEVER be imported by Server Components.

## 30. React Hooks Architecture

* **Global Hooks:** (e.g., `use-media-query.ts`) live in `src/hooks/`.
* **Feature Hooks:** (e.g., `use-practice-session.ts`) live in `src/features/[feature]/hooks/`.
* Hooks must focus on UI state and browser APIs, delegating heavy logic to Server Actions.

## 31. Utility Architecture

* **Global Utils:** `src/lib/utils/` (e.g., Tailwind `cn()` merger, date formatting).
* **Feature Utils:** `src/features/[feature]/utils/` (e.g., `calculate-xp.ts`).
* **Anti-pattern:** Do not create a giant `utils.ts` file. Split by responsibility (e.g., `date.utils.ts`).

## 32. Type Architecture

* `src/types/`: Global types (`database.types.ts`, `env.types.ts`).
* `src/features/[feature]/types/`: Feature-specific interfaces that extend or pick from database types to provide strict business models.

## 33. Constants Architecture

* **Global Constants:** `src/config/constants.ts` (e.g., `MAX_SESSION_QUESTIONS = 15`).
* **Feature Constants:** `src/features/[feature]/constants.ts` (e.g., `EVALUATION_CATEGORIES`).

## 34. Configuration Architecture

`src/config/` holds all application-wide configuration setups.

* `env.ts`: Zod schema validating `process.env` at startup.

## 35. Environment Variable Architecture

Validated via `src/config/env.ts`.

| Variable | Public/Private | Used By | Purpose | Security Requirement |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Client/Server | API Endpoint | Safe to expose in browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Client | Client Supabase Access | Safe to expose (RLS protected) |
| `GEMINI_API_KEY` | **PRIVATE** | Server Only | AI Evaluator | MUST NOT enter client bundle |
| `SUPABASE_SERVICE_ROLE_KEY` | **PRIVATE** | Server Only | Admin DB Writes | MUST NOT enter client bundle |

## 36. Authentication Code Organization

* `src/features/auth/`: Contains login UI, Auth server actions, and Supabase Auth listeners.
* `middleware.ts` (Root): Protects `/practice` and `/dashboard` routes at the edge.

## 37. Authorization Code Organization

Authorization is enforced primarily via Supabase Row Level Security (RLS) in the database. In the codebase, Server Actions check `await supabase.auth.getUser()` before executing mutations via the service role key.

## 38. API and Route-Handler Organization

* **Standard:** The application uses Next.js Server Actions for internal mutations.
* **Route Handlers:** `src/app/api/` is ONLY used for external webhooks (e.g., future Stripe integrations) or specific streaming architectures if required. Not used for general app data fetching.

## 39. Server Actions

Located in `src/features/[feature]/actions/`.

* Must explicitly declare `"use server"` at the top.
* Must validate inputs using Zod.
* Must return a standard `{ data, error }` object (avoiding unhandled exceptions crashing the client).

## 40. External Integration Architecture

External APIs (Supabase, Gemini) are strictly contained within `src/lib/`. The rest of the application imports the wrapper functions, ensuring the underlying provider can be swapped or tested easily.

## 41. Error Architecture

* `src/lib/utils/errors.ts`: Defines custom error classes (e.g., `AIValidationError`, `SpeechRecognitionError`).
* Server actions catch exceptions and return safe user-facing error strings to the UI.

## 42. Logging Architecture

* Standard `console.error` and `console.info` are used for MVP Vercel logging.
* AI latency and token usage are logged securely without exposing the `GEMINI_API_KEY` or sensitive PII.

## 43. Testing Architecture

Tests are colocated near the code they test where possible, with integration/e2e tests in a dedicated root folder.

* Unit/Component: `[filename].test.tsx` next to the source file.
* Integration/E2E: `tests/` at the repository root.

## 44. AI Evaluation Testing

`tests/integration/ai/`: Contains deterministic fixtures for Gemini outputs. Tests verify that the Zod schemas correctly parse varied JSON responses and handle hallucinations safely without relying on live API calls during standard CI.

## 45. Voice Testing

`src/features/practice/hooks/use-speech.test.ts`: Mocks the `window.webkitSpeechRecognition` API to verify state transitions (Recording $\rightarrow$ Transcribed $\rightarrow$ Error) without needing real microphone hardware.

## 46. Database Testing

`tests/integration/db/`: Tests service-role Server Actions against a local Supabase Docker instance to verify correct updates to `attempts` and `mastery` tables.

## 47. End-to-End Testing

`tests/e2e/`: Playwright tests covering the critical user journey: Login $\rightarrow$ Start Session $\rightarrow$ Submit Text $\rightarrow$ View Feedback $\rightarrow$ Complete Session.

## 48. Mock and Fake Architecture

`tests/mocks/`: Contains mock implementations of `@google/genai` and `@supabase/supabase-js` for unit testing.

## 49. Fixture Architecture

`tests/fixtures/`: Contains JSON files representing mock curriculum concepts, exercises, and evaluation JSON responses used across multiple tests.

## 50. Seed and Script Architecture

`scripts/`: Contains `seed.ts` (populates Supabase with Stage 1-10 curriculum) and `db-types.sh` (generates `database.types.ts` from Supabase CLI).

## 51. Documentation Architecture

* Project documentation (PRD, UX, Architecture, etc.) lives in the `docs/` directory at the repository root.
* `README.md` serves as the developer entry point.

## 52. Public and Static Assets

`public/`: Contains `favicon.ico`, manifest files, and static audio assets (if any UI sound effects are implemented).

## 53. Dependency Rules

| Module/Layer | May Import | Must Not Import | Reason |
| --- | --- | --- | --- |
| UI Components | React, `lib/utils` | `features/`, `lib/db/admin` | UI must remain domain-agnostic and client-safe. |
| Features | UI Components, `lib/` | Other features' internals | Maintain high cohesion, low coupling. |
| `lib/ai` | `config/env`, schemas | UI, Next.js routing | Keep AI infrastructure pure and portable. |
| Server Actions | `features/services`, `lib/` | Browser APIs (`lib/speech`) | Server cannot execute browser APIs. |

## 54. Import-Boundary Rules

* Use TypeScript path aliases configured in `tsconfig.json`.
* `@/components/...`
* `@/features/...`
* `@/lib/...`
* Relative imports (`../`) are only allowed for intra-feature files (e.g., a component importing a sibling hook).

## 55. Dependency-Inversion Rules

While strict Dependency Injection (DI) containers are overkill for this MVP, provider logic (Gemini, Supabase) must be exported as functions from `lib/` rather than instantiated directly inside Server Actions.

## 56. Naming Conventions

| Artifact | Naming Convention | Example |
| --- | --- | --- |
| Files / Directories | kebab-case | `evaluation-card.tsx` |
| React Components | PascalCase | `EvaluationCard` |
| Hooks | camelCase, `use` prefix | `usePracticeSession` |
| Server Actions | camelCase, `Action` suffix | `submitAnswerAction` |
| Zod Schemas | camelCase, `Schema` suffix | `evaluationSchema` |
| Types/Interfaces | PascalCase | `SessionSummary` |

## 57. Module Naming Conventions

Modules specify their role in the extension:

* `.component.tsx` (optional, usually implied by `.tsx`)
* `.service.ts`
* `.schema.ts`
* `.types.ts`
* `.test.ts`
* `.actions.ts`

## 58. Barrel-Export Policy

* **Allowed:** `src/components/ui/index.ts` to export design system components.
* **Forbidden:** `src/features/practice/index.ts`. Do not use barrel files for complex features, as they often cause circular dependency resolution issues in Next.js. Import specifically (e.g., `@/features/practice/components/chat-interface`).

## 59. Circular-Dependency Prevention

Enforced by the directional dependency graph: UI $\rightarrow$ Features $\rightarrow$ Services $\rightarrow$ Infrastructure (`lib`). Infrastructure cannot import Features.

## 60. Shared vs Feature-Specific Code

* If a component is used in *only one feature*, it lives in `features/[name]/components/`.
* If it is used in *three or more features*, it is promoted to `src/components/shared/` or `src/components/ui/`.

## 61. Code Ownership Boundaries

| Directory | Purpose | Allowed Contents | Forbidden Contents | Dependencies |
| --- | --- | --- | --- | --- |
| `src/app` | Routing | Page, Layout, Error UI | Business logic | Features, Components |
| `src/features` | Domain Logic | Services, Actions, Feature UI | Global DB connections | UI, Lib |
| `src/components` | Shared UI | Dumb React components | Server Actions, Data Fetching | Utils |
| `src/lib` | Infrastructure | Supabase, Gemini SDK clients | React Components | Env config |

## 62. Client/Server Boundary Matrix

| Module | Client | Server | Both | Reason |
| --- | --- | --- | --- | --- |
| `app/practice/page.tsx` |  | X |  | Fetches initial session state securely |
| `features/practice/components/` | X |  |  | Handles DOM events, Speech API |
| `features/practice/actions/` |  | X |  | Next.js Server Actions for mutations |
| `lib/db/admin.ts` |  | X |  | Uses Service Role Key (Admin writes) |
| `lib/db/client.ts` | X |  |  | Uses Anon Key for public/RLS reads |

## 63. Secret-Safety Matrix

| Resource | Client-Safe | Server-Only | Secret | Location/Rule |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |  | No | Configured in `.env` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |  | No | Safe for browser (RLS enforced) |
| `GEMINI_API_KEY` |  | Yes | Yes | `process.env` on server only |
| `SUPABASE_SERVICE_ROLE_KEY` |  | Yes | Yes | Isolated in `lib/db/admin.ts` |

## 64. Feature-Level Directory Specifications

Every directory in `src/features/[feature]/` contains:

* `actions/`: Next.js Server Actions.
* `components/`: React components specific to the feature.
* `hooks/`: Custom React hooks.
* `services/`: Pure TypeScript business logic and orchestration.
* `schemas/`: Zod validation schemas.
* `types/`: TypeScript definitions.

## 65. Practice Feature Structure

`src/features/practice/`

* Responsible for the active translation session.
* Includes `chat-interface.tsx`, `use-practice-session.ts`, `evaluate-answer.action.ts`.

## 66. Evaluation Feature Structure

Integrated into `src/features/practice/services/evaluation.service.ts`.

* Separates the raw Gemini API call (`lib/ai`) from the application logic (mapping grade 'A' to UI states and updating database attempts).

## 67. Voice Feature Structure

`src/features/practice/components/voice-recorder.tsx`

* Handles UI state (Recording/Processing).
* Delegates actual API interaction to `src/lib/speech/recognition.ts`.

## 68. Progress Feature Structure

`src/features/progress/`

* Responsible for the Dashboard stats, XP, and Mistake History list.
* Includes `progress.service.ts` for aggregating mastery data from Supabase.

## 69. Curriculum Feature/Data Structure

`src/features/curriculum/`

* Contains types and schemas for Curriculum Stages and Concepts.
* Actual curriculum *data* is stored in the Supabase database (seeded via `scripts/seed.ts`), not hardcoded in the repository.

## 70. Configuration Files

* `.env.local`: Local developer variables. (Ignored in Git).
* `.env.example`: Template for CI/CD and onboarding. Contains dummy values.

## 71. Root Configuration Files

* `package.json`
* `tsconfig.json` (TypeScript strict mode required)
* `next.config.ts`
* `tailwind.config.ts`
* `postcss.config.mjs`
* `components.json` (shadcn/ui configuration, if used)
* `middleware.ts` (Next.js route protection)

## 72. Generated Files

* `src/types/database.types.ts`: Generated by Supabase CLI. MUST be committed to version control so Vercel builds pass without needing a live database connection during the build step.
* `.next/`: Next.js build output. (Ignored).

## 73. Files That Must Not Be Committed

* `.env.local`
* `.env`
* `.next/`
* `node_modules/`
* Coverage reports.

## 74. Dependency Boundaries

* **Core:** `next`, `react`, `react-dom`.
* **UI:** `tailwindcss`, `lucide-react`, UI primitives (e.g., Radix).
* **State:** `zustand` (Optional, if React Context is insufficient).
* **Validation:** `zod`.
* **DB:** `@supabase/supabase-js`, `@supabase/ssr`.
* **AI:** `@google/genai`.

## 75. Provider-Abstraction Strategy

External services are wrapped in `src/lib/[provider]/`.
If we switch from Web Speech API to an external TTS/STT provider, only `src/lib/speech/` is rewritten. The UI in `features/practice` remains unchanged.

## 76. Feature-Flag Strategy

Not required for this MVP. MVP scope is clearly defined and linear.

## 77. Migration and Script Organization

* `supabase/migrations/`: Contains raw SQL files generated by Supabase CLI.
* `scripts/seed.ts`: A Node script to populate initial curriculum data into the local/production database.

## 78. Developer Workflow Structure

1. `npm install`
2. `supabase start` (Starts local Postgres)
3. `npm run dev` (Starts Next.js)
4. `npm run test` (Vitest)
5. `npm run typecheck` (tsc --noEmit)

## 79. CI/CD Codebase Requirements

The Vercel deployment pipeline automatically runs:

1. Linting (`next lint`).
2. Typechecking.
3. Build.
Environment variables must be manually injected into the Vercel project settings.

## 80. Documentation-to-Code Traceability

| Requirement | UX | Architecture | Database | Codebase Location | Test |
| --- | --- | --- | --- | --- | --- |
| Translation Eval | Eval Flow | Server Action | `evaluations` | `features/practice/actions` | `tests/integration/ai` |
| Editable STT | Review UX | Client API | `attempts` | `features/practice/components` | `use-speech.test.ts` |
| Mistake Review | Progress UX | Progress Svc | `mastery` | `features/progress/services` | `progress.test.ts` |

## 81. Google Antigravity Implementation Rules

* **Inspect First:** Check for existing shared components in `src/components/ui` before building new ones.
* **Canonical Structure Only:** Do not create `src/controllers`, `src/models`, or Express.js patterns. Next.js Server Actions are the law.
* **No DB in UI:** Never instantiate `@supabase/supabase-js` directly inside a `.tsx` file unless it is using the browser-safe client for a public read.
* **Secret Safety:** Never import `lib/db/admin.ts` or `lib/ai/gemini.ts` into any file marked `"use client"`.

## 82. Codebase Quality Rules

* **Strong Typing:** No `any`. Use Zod inferred types (`z.infer<typeof Schema>`).
* **Single Responsibility:** Files should generally not exceed 300 lines. Split complex Server Actions from complex React UI.
* **Error Handling:** Server Actions must catch all errors and return `{ error: string }`. They must not throw raw HTTP 500s to the client browser.

## 83. Codebase Anti-Patterns

* **Prohibited:** `src/utils.ts` (A dumping ground). Use specific files like `src/lib/utils/formatting.ts`.
* **Prohibited:** Passing `GEMINI_API_KEY` as a prop from Server to Client component.
* **Prohibited:** Copy-pasting Tailwind class strings wildly. Use `cn()` utility to merge classes safely.
* **Prohibited:** Direct SQL queries in Next.js. Use the Supabase JS client.

## 84. File and Module Complexity Guidelines

* If a React component has more than 3 `useState` hooks and handles API calls, refactor the logic into a custom hook (e.g., `usePracticeSession`).
* If an AI orchestration function exceeds 100 lines, separate the prompt generation logic into `lib/ai/prompts/`.

## 85. Testing Ownership

| Layer | Test Type | Location | Main Responsibility |
| --- | --- | --- | --- |
| AI Evaluator | Integration | `tests/integration/ai` | Verifies Zod schemas parse varied Gemini outputs. |
| Server Actions | Integration | `tests/integration/db` | Verifies correct inserts into Supabase. |
| Core UI | Unit/Component | Next to source `.test.tsx` | Verifies UI state changes (e.g., mic pulsing). |
| Core Journey | E2E | `tests/e2e` | Playwright tests login $\rightarrow$ translate $\rightarrow$ complete. |

## 86. Security Boundaries

* **Browser (Client):** Untrusted. Can only read data permitted by RLS.
* **Server Actions (Server):** Trusted. Verifies JWT session cookie before executing admin database writes.
* **Gemini API:** Untrusted output. JSON responses are strictly validated by Zod before being saved to the database.

## 87. Complete Canonical Repository Tree

```text
project-root/
├── .env.example
├── .gitignore
├── components.json
├── middleware.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── docs/
│   ├── 01_PRODUCT_REQUIREMENTS.md
│   └── (other architecture docs)
├── scripts/
│   ├── seed.ts
│   └── update-types.sh
├── supabase/
│   └── migrations/
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   ├── integration/
│   └── mocks/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/page.tsx
    │   ├── (app)/
    │   │   ├── dashboard/page.tsx
    │   │   ├── practice/page.tsx
    │   │   └── summary/page.tsx
    │   ├── layout.tsx
    │   ├── error.tsx
    │   └── not-found.tsx
    ├── components/
    │   ├── ui/
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   └── input.tsx
    │   └── layout/
    │       └── header.tsx
    ├── config/
    │   ├── constants.ts
    │   └── env.ts
    ├── features/
    │   ├── auth/
    │   │   └── actions/auth.actions.ts
    │   ├── practice/
    │   │   ├── actions/
    │   │   │   ├── evaluate-answer.action.ts
    │   │   │   └── complete-session.action.ts
    │   │   ├── components/
    │   │   │   ├── chat-interface.tsx
    │   │   │   ├── transcription-editor.tsx
    │   │   │   ├── evaluation-card.tsx
    │   │   │   └── voice-recorder.tsx
    │   │   ├── hooks/
    │   │   │   ├── use-practice-session.ts
    │   │   │   └── use-voice.ts
    │   │   ├── schemas/
    │   │   │   └── answer-submission.schema.ts
    │   │   ├── services/
    │   │   │   └── evaluation.service.ts
    │   │   └── types/
    │   │       └── practice.types.ts
    │   ├── progress/
    │   │   ├── components/
    │   │   │   └── mistake-history.tsx
    │   │   └── services/
    │   │       └── progress.service.ts
    │   └── curriculum/
    │       └── types/
    │           └── curriculum.types.ts
    ├── lib/
    │   ├── ai/
    │   │   ├── gemini.ts
    │   │   ├── prompts/
    │   │   │   └── evaluation.prompt.ts
    │   │   └── schemas/
    │   │       └── gemini-response.schema.ts
    │   ├── db/
    │   │   ├── admin.ts
    │   │   ├── client.ts
    │   │   └── server.ts
    │   ├── speech/
    │   │   └── recognition.ts
    │   └── utils/
    │       ├── cn.ts
    │       └── errors.ts
    └── types/
        └── database.types.ts

```

## 88. Directory-by-Directory Specification

| Directory | Purpose | Allowed Contents | Forbidden Contents | Dependencies |
| --- | --- | --- | --- | --- |
| `src/app` | Next.js Routing | `page.tsx`, `layout.tsx` | Heavy business logic | `features/` |
| `src/components/ui` | Reusable generic UI | Radix/Tailwind components | Domain logic, API calls | `lib/utils` |
| `src/features/*` | Vertical domain slices | Components, Actions, Hooks | Global config | `components/ui`, `lib/` |
| `src/lib/ai` | Gemini Integration | SDK initialization, Prompts | React components | `config/env` |
| `src/lib/db` | Supabase Clients | Client/Server/Admin inits | UI, Feature logic | `config/env` |
| `src/config` | Global settings | Environment validation (Zod) | Secrets | `zod` |

## 89. Module Dependency Graph

```text
src/app (Pages)
  │
  ├──► src/features (Domain Logic & Feature UI)
  │      │
  │      ├──► src/components/ui (Design System)
  │      │
  │      ├──► src/lib/db (Persistence)
  │      │
  │      ├──► src/lib/ai (Evaluation)
  │      │
  │      └──► src/lib/speech (Browser Native Voice)
  │
  └──► src/types (Global Types)

```

## 90. Import-Boundary Matrix

| Source Layer | May Import | Must Not Import |
| --- | --- | --- |
| `app/` | `features/`, `components/`, `types/` | `lib/ai/`, `lib/db/admin` directly |
| `features/[name]/components/` | `components/ui/`, `features/[name]/hooks/` | `lib/db/admin`, `lib/ai/` |
| `features/[name]/actions/` | `lib/db/admin`, `lib/ai/`, `features/[name]/services/` | `components/ui/`, `app/` |
| `lib/` | `config/`, `types/` | `features/`, `components/` |

## 91. Test Architecture Matrix

| Layer | Test Type | Location | Main Responsibility |
| --- | --- | --- | --- |
| UI Components | Unit | `features/[name]/components/` | Visual states, callbacks |
| AI Integration | Integration | `tests/integration/ai/` | Zod parsing of Gemini JSON |
| Server Actions | Integration | `tests/integration/db/` | Supabase insertion validation |
| Core Flow | E2E | `tests/e2e/` | Happy path practice session |

## 92. Configuration Matrix

| Configuration | Location | Environment | Client/Server | Secret? |
| --- | --- | --- | --- | --- |
| DB URL | `.env` | Dev/Prod | Both | No |
| DB Anon Key | `.env` | Dev/Prod | Both | No |
| DB Service Key | `.env` | Dev/Prod | Server Only | **Yes** |
| Gemini Key | `.env` | Dev/Prod | Server Only | **Yes** |
| Tailwind | `tailwind.config.ts` | Build | N/A | No |

## 93. Implementation Sequence

For Google Antigravity to build this application correctly:

1. **Phase 1:** Repository Initialization (Next.js, Tailwind, tsconfig, env validation).
2. **Phase 2:** Database & Types (Supabase client setups, `database.types.ts`).
3. **Phase 3:** Design System (Populate `src/components/ui` based on Document 04).
4. **Phase 4:** Authentication & Routing (Middleware, Login page).
5. **Phase 5:** AI Infrastructure (`src/lib/ai` and prompts).
6. **Phase 6:** Practice Feature (The core loop, Server Actions, Voice hooks).
7. **Phase 7:** Progress Feature (Dashboard stats, Mistake review).
8. **Phase 8:** Testing & Hardening.

## 94. Empty/Partially Initialized Repository Strategy

If starting from an empty repository, Antigravity MUST run `npx create-next-app@latest` ensuring `src/` directory and App Router are selected. It must NOT manually scaffold internal `.next` or Webpack configurations. Generate `src/config/env.ts` immediately to establish strict type safety for credentials.

## 95. Codebase Acceptance Criteria

| ID | Requirement | Verification Method |
| --- | --- | --- |
| CODE-AC-01 | No secrets in client | Inspect client components for `process.env.GEMINI_API_KEY`. (Must fail). |
| CODE-AC-02 | Admin DB isolation | Inspect `admin.ts` imports. Must only be imported by Server Actions/API. |
| CODE-AC-03 | Feature Isolation | Inspect `features/practice` for imports from `features/progress/components`. (Should not exist). |
| CODE-AC-04 | Zod Validation | Check Server Actions for schema parsing before execution. |

## 96. Codebase Traceability

| Requirement | UX | Architecture | Database | Codebase Location | Test |
| --- | --- | --- | --- | --- | --- |
| Translation Eval | Eval Flow | AI Orchestrator | `evaluations` | `features/practice/services/evaluation.service.ts` | `tests/integration/ai/eval.test.ts` |
| Voice Review | Review State | Browser Speech | `attempts` | `features/practice/components/transcription-editor.tsx` | `use-speech.test.ts` |

## 97. Assumptions

* The chosen Next.js version is >= 14, fully supporting stable Server Actions.
* The UI relies heavily on a Tailwind/shadcn-ui-like component library mapped to `src/components/ui/`.

## 98. Open Codebase Questions

| ID | Question | Why It Matters | Status |
| --- | --- | --- | --- |
| CB-OQ-01 | Should we use a monorepo structure (e.g., Turborepo)? | Overkill for a 1-student MVP, but standard for enterprise Next.js scaling. | Resolved: No. Stick to standard Next.js single-repo. |

## 99. Final Codebase Specification

This specification provides a rigid, secure, and highly maintainable repository structure. By strictly isolating Server Actions, AI logic, and infrastructure from the React UI, it ensures the application remains stable and scalable while eliminating the risk of accidental secret exposure in the browser.

## 100. Codebase Completion Checklist

* [x] Defined strict `src/` directory usage.
* [x] Established Feature-Sliced architecture (`src/features`).
* [x] Isolated external infrastructure in `src/lib`.
* [x] Secured API keys via `src/config/env.ts`.
* [x] Mapped Server/Client component boundaries explicitly.
* [x] Provided a canonical, explicit repository tree.
* [x] Established dependency flow and forbidden imports.
* [x] Defined phased implementation instructions for Antigravity.