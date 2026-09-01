# 22 — Google Antigravity Implementation Guide

## 1. Document Control

* **Document ID:** IMP-001
* **Document Name:** Tejaswini AI English Tutor - Implementation Guide
* **Version:** 1.0.0
* **Status:** APPROVED FOR EXECUTION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Beginner)
* **Owner:** Principal Software Architect
* **Source of Truth:** Authoritative execution manual for Google Antigravity to build the application according to specifications 01–21.

## 2. Purpose

This document translates the approved project specifications into a rigorous, ordered, dependency-aware implementation workflow. It provides Google Antigravity with the exact steps, boundaries, guardrails, and verification gates required to build a secure, pedagogically accurate, and production-ready application.

## 3. Scope

The scope covers the complete end-to-end implementation of the single-student MVP, including repository initialization, database provisioning, API development, AI integration, voice handling, state management, testing, and deployment readiness.

## 4. Intended Execution Environment

* **Agent:** Google Antigravity (or equivalent autonomous AI coding agent).
* **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL/Auth), Google Gemini API (`@google/genai`), Web Speech API, Zod, Vitest, Playwright, Vercel.

## 5. Source Documents and Authority

This guide relies strictly on documents `01_PRODUCT_REQUIREMENTS.md` through `21_ACCEPTANCE_CRITERIA.md`. This document organizes the work; the preceding documents define the work.

## 6. Source-of-Truth Hierarchy

1. `01_PRODUCT_REQUIREMENTS.md` (Product rules)
2. `02_LEARNING_CURRICULUM.md` (Learning logic)
3. `03_UX_SPECIFICATION.md` (User interaction)
4. `04_UI_DESIGN_SYSTEM.md` (Visual design)
5. `05_APPLICATION_ARCHITECTURE.md` (System architecture)
6. `06_DATABASE_SCHEMA.md` (Persistence)
7. `07_CODEBASE_STRUCTURE.md` (Code organization)
8. `08_TYPES_AND_SCHEMAS.md` (Data contracts)
9. `09_API_CONTRACTS.md` (API boundaries)
10. `10_SUPABASE_SECURITY.md` (DB security)
11. `11_EVALUATION_SPECIFICATION.md` (AI evaluation)
12. `12_AI_PROMPT_ARCHITECTURE.md` (AI instructions)
13. `13_GEMINI_INTEGRATION.md` (Provider integration)
14. `14_ADAPTIVE_LEARNING.md` (Mastery/Progression)
15. `15_SCORING_AND_PROGRESS.md` (XP/Scoring)
16. `16_VOICE_SPEECH_SPECIFICATION.md` (Audio/Voice)
17. `17_STATE_MANAGEMENT.md` (State authority)
18. `18_ERROR_AND_FAILURE_HANDLING.md` (Resilience)
19. `19_SECURITY_SPECIFICATION.md` (App security)
20. `20_TESTING_STRATEGY.md` (Verification)
21. `21_ACCEPTANCE_CRITERIA.md` (Definition of Done)

## 7. Implementation Philosophy

Measure twice, cut once. The agent must read specifications, audit existing code, implement incrementally, and test exhaustively before proceeding to the next phase.

## 8. Core Implementation Principles

1. Specifications are authoritative. Do not invent product behavior.
2. Technical failures must not automatically become learner-performance failures.
3. Treat Gemini output as untrusted external input.
4. Server-only secrets (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) must never touch the client.
5. Critical operations must be idempotent and race-condition protected.

## 9. Application Overview

A private Next.js application where a Marathi-speaking beginner (Tejaswini) practices English translation via text/voice, receiving Zod-validated, Gemini-powered semantic evaluation and targeted remediation.

## 10. System Implementation Model

READ THE SPECIFICATIONS $\rightarrow$ AUDIT THE REPOSITORY $\rightarrow$ BUILD THE DEPENDENCY PLAN $\rightarrow$ IMPLEMENT ONE PHASE $\rightarrow$ RUN STATIC CHECKS $\rightarrow$ RUN RELEVANT TESTS $\rightarrow$ VERIFY SECURITY $\rightarrow$ VERIFY ACCEPTANCE CRITERIA $\rightarrow$ CREATE CHECKPOINT $\rightarrow$ ONLY THEN CONTINUE.

## 11. Requirements Dependency Map

Auth $\rightarrow$ Database $\rightarrow$ UI Shell $\rightarrow$ Practice Loop $\rightarrow$ Gemini Integration $\rightarrow$ Voice $\rightarrow$ Progress $\rightarrow$ E2E Tests.

## 12. Architecture Dependency Map

Database Schema $\rightarrow$ Zod Schemas $\rightarrow$ Server Actions $\rightarrow$ Client Hooks $\rightarrow$ React Components.

## 13. External Dependency Map

* **Supabase:** Requires Auth, Postgres, and local CLI for migrations.
* **Gemini:** Requires `@google/genai` and `GEMINI_API_KEY`.
* **Browser:** Requires Web Speech API (No external npm package required).

## 14. Environment Configuration

Create `.env.example` mapping all required configurations. Use `src/config/env.ts` for startup validation.

## 15. Secret Management

* **Public:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* **Secret:** `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## 16. Repository Audit

Before generating files, Antigravity must execute `ls -la` and read `package.json` to understand current state and avoid overwriting existing valid architecture.

## 17. Repository Safety Rules

* Do not delete files without explicit justification.
* Do not overwrite working CI/CD pipelines.

## 18. Project Initialization

If empty, `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`.

## 19. Dependency Management

Install only approved packages: `zod`, `@supabase/supabase-js`, `@supabase/ssr`, `@google/genai`, `lucide-react`, `zustand` (if required), `vitest`, `@playwright/test`.

## 20. Build and Tooling Foundation

Configure `tsconfig.json` with strict mode. Configure ESLint. Set up Husky/Lint-staged if required by environment.

## 21. Database Implementation Strategy

Use Supabase CLI to create local migrations. Do not apply schemas manually via UI.

## 22. Database Migration Order

1. `users`/`students` (Auth triggers).
2. Curriculum reference tables (`stages`, `concepts`, `exercises`).
3. Practice tables (`sessions`, `session_exercises`, `attempts`, `evaluations`).
4. `mastery`.

## 23. Supabase Implementation

Implement `src/lib/db/server.ts`, `client.ts`, and `admin.ts`.

## 24. RLS Implementation

Append `ALTER TABLE x ENABLE ROW LEVEL SECURITY;` and corresponding `CREATE POLICY` to every migration script.

## 25. Storage Implementation

Out of Scope (Audio is not stored per `16_VOICE_SPEECH_SPECIFICATION.md`).

## 26. Database Verification

Run `supabase start` and execute integration tests ensuring RLS blocks anon writes.

## 27. Types and Schemas Implementation

Generate `database.types.ts` from CLI. Manually create domain and Zod schemas in `src/features/*/schemas`.

## 28. Runtime Validation

Implement `AiEvaluationSchema` and `SubmitAnswerSchema` using Zod.

## 29. Core Domain Implementation

Implement pure TS functions (e.g., `calculateXp`) in `src/features/*/utils`.

## 30. Learning Domain Implementation

Seed local DB with Curriculum Stages 1-2 based on `02_LEARNING_CURRICULUM.md`.

## 31. Daily Plan Implementation

Implement Streak calculation logic in `ProgressService`.

## 32. Learning Session Implementation

Implement `startSessionAction` initializing 10-15 exercises.

## 33. Exercise Engine Implementation

Implement deterministic DB queries for exercise selection (warmup, core, review).

## 34. Attempt Lifecycle Implementation

Implement `SubmitAnswerReq` logic mapping input to the `attempts` table.

## 35. Evaluation Engine Implementation

Implement `EvaluationService` orchestrating Context Builder $\rightarrow$ Gemini $\rightarrow$ DB.

## 36. Scoring Implementation

Implement 10/5/1 XP assignments based on Grade A-F.

## 37. Progress Implementation

Implement `CompleteSessionAction` aggregating XP.

## 38. Mastery Implementation

Implement logic transitioning `INTRODUCED` $\rightarrow$ `PROFICIENT` upon 6 net correct.

## 39. Adaptive-Learning Implementation

Implement 3-error trigger dropping difficulty to Level 1.

## 40. Authentication Implementation

Implement `/login` page and Supabase SSR Middleware.

## 41. Authorization Implementation

Wrap Server Actions in `await supabase.auth.getUser()`. Validate ownership.

## 42. API Implementation

Implement all Server Actions specified in `09_API_CONTRACTS.md`.

## 43. API Contract Verification

Write tests calling Server Actions with mocked Zod payloads.

## 44. Service Layer Implementation

Build `src/features/*/services/*.service.ts` to isolate logic from Next.js routing.

## 45. AI Context Construction

Implement `buildEvaluationContext()` assembling prompt, target concept, and student text.

## 46. Prompt Architecture Implementation

Implement `src/lib/ai/prompts/evaluation.prompt.ts`.

## 47. Gemini Integration Implementation

Implement `src/lib/ai/gemini.ts` using `@google/genai`.

## 48. Gemini Response Validation

Apply `AiEvaluationSchema.safeParse()`.

## 49. Gemini Failure Handling

Implement 1x auto-retry on 503/JSON parse failure. Return `PROVIDER_ERROR`.

## 50. AI Provider Abstraction

Keep `@google/genai` types isolated from domain types.

## 51. AI Security Implementation

Strip extra JSON keys. Do not evaluate if input > 500 chars.

## 52. State-Management Implementation

Implement `usePracticeSession` hook.

## 53. State-Transition Implementation

Enforce Discriminated Unions (`EXERCISE_READY` $\rightarrow$ `EVALUATING`).

## 54. Persistence and Synchronization

Implement `localStorage` syncing for unsubmitted `draftText`.

## 55. Concurrency and Idempotency

Enforce `sessionExerciseId` checks in Server Actions.

## 56. Stale-Response Protection

UI ignores evaluations returning for old exercise IDs.

## 57. UI Implementation Strategy

Mobile-first, Tailwind CSS, Radix UI primitives.

## 58. Route and Page Implementation

Implement `/login`, `/dashboard`, `/practice`, `/summary`.

## 59. Component Implementation

Implement `ChatBubble`, `EvaluationCard`, `MicButton`.

## 60. Form Implementation

Implement controlled `<textarea>` for answer input.

## 61. Loading-State Implementation

`isPending` locks UI, shows spinner.

## 62. Empty-State Implementation

"No mistakes to review" dashboard card.

## 63. Error-State Implementation

Toast notifications for `ActionError` payloads.

## 64. Success-State Implementation

Green styling for Grade A/B.

## 65. Accessibility Implementation

`aria-live="polite"` for evaluation results. Minimum 44px touch targets.

## 66. Responsive Implementation

Max-width 768px centered container for desktop; 100% width for mobile.

## 67. Voice Implementation Strategy

Native `window.SpeechRecognition` and `window.speechSynthesis`.

## 68. Microphone Permissions

Handled natively by browser prompt.

## 69. Recording Lifecycle

`IDLE` $\rightarrow$ `RECORDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `TRANSCRIBED`.

## 70. Audio Processing

N/A (Browser handled).

## 71. Audio Upload

N/A (Browser handled, text only uploaded).

## 72. Speech-to-Text Integration

Implement `useSpeech()` hook.

## 73. Transcription Validation

Ensure text > 0 chars before moving to `TRANSCRIBED`.

## 74. Text-to-Speech

Implement `playAudio()` util for Marathi/English prompts.

## 75. Playback

Add Play button to Chat Bubbles.

## 76. Voice Failure Recovery

`onerror` reverts UI to Text Input.

## 77. Voice Fallback

Always render Text Input alongside Voice.

## 78. Voice-Learning Isolation

If STT produces gibberish, student edits it manually; no XP penalty.

## 79. Error Architecture

Standardized `ActionError` envelope.

## 80. Error Classification

Validation, Auth, Provider, Internal.

## 81. Error Propagation

Catch in Service $\rightarrow$ Return from Action $\rightarrow$ Render in UI.

## 82. User-Safe Error Handling

Map `GoogleGenerativeAIError` to "Connection issue. Please retry."

## 83. Logging and Observability

`console.error` server-side (Vercel catches these).

## 84. Security Hardening

Verify RLS and `src/config/env.ts`.

## 85. Client/Server Trust Boundaries

Client provides strings; Server provides evaluations.

## 86. Input Validation

Zod on every API request.

## 87. Output Validation

Zod on every AI response.

## 88. Client-Tampering Protection

Ignore `{ grade: "A" }` if passed in payload.

## 89. IDOR/BOLA Protection

`auth.uid()` checks in Server Actions.

## 90. Prompt-Injection Protection

System instructions explicitly isolate `<student_answer>`.

## 91. Malicious-AI-Output Protection

Zod stripping.

## 92. Secret Protection

`admin.ts` never imported in `"use client"`.

## 93. Storage and Audio Security

N/A (No storage).

## 94. Rate Limiting

Next.js Edge configuration (Optional for MVP).

## 95. Dependency Security

`npm audit`.

## 96. Testing Implementation Strategy

Vitest (Unit), Supabase Local (Integration), Playwright (E2E).

## 97. Unit Test Implementation

Test `calculateXp`, Zod schemas.

## 98. Component Test Implementation

Test `EvaluationCard` rendering correctly for Grade A vs Grade E.

## 99. Integration Test Implementation

Test Server Actions against local DB.

## 100. API Test Implementation

N/A (Using Server Actions).

## 101. Contract Test Implementation

Verify Gemini JSON matches `AiEvaluationSchema`.

## 102. Database Test Implementation

Verify RLS policies block anonymous inserts.

## 103. RLS Test Implementation

Same as 102.

## 104. State Test Implementation

Verify `PracticeSessionState` transitions.

## 105. AI Test Implementation

Golden Dataset regression script.

## 106. Voice Test Implementation

Mock `window.SpeechRecognition`.

## 107. Security Test Implementation

Ensure missing cookies throw `UNAUTHORIZED`.

## 108. End-to-End Test Implementation

Playwright: Login $\rightarrow$ Answer $\rightarrow$ Grade $\rightarrow$ Next.

## 109. Regression Test Implementation

Run Golden Dataset on CI.

## 110. Smoke Test Implementation

Playwright basic load test.

## 111. Failure-Injection Test Implementation

Mock 503 from Gemini $\rightarrow$ Assert safe UI recovery.

## 112. Concurrency Test Implementation

N/A.

## 113. Recovery Test Implementation

Playwright page reload mid-session.

## 114. Test Fixtures

`tests/fixtures/evaluations.json`.

## 115. Mock Providers

MSW or `vi.mock` for Gemini.

## 116. Gemini Test Doubles

Stub returning `{"grade": "A"}`.

## 117. Voice Test Doubles

Stub firing `onresult` with "hello".

## 118. AI Golden Dataset

10-20 canonical translation scenarios.

## 119. Production Smoke Tests

Verified against Vercel deployment.

## 120. Implementation Phase Architecture

Strict 22-phase pipeline.

## 121. Phase Dependency Graph

Phase `N` must pass all tests before Phase `N+1` begins.

## 122. Phase 0 — Specification and Repository Audit

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-0
**Objective:** Establish context and prevent overwrites.
**Entry Conditions:** Agent activated.
**Dependencies:** None.
**Source Documents:** 01-21.
**Scope:** File system read.
**Tasks:** `ls -la`, read `package.json`.
**Files/Modules:** All.
**Tests:** N/A.
**Acceptance Criteria:** Agent outputs understanding of current state.
**Exit Criteria:** Audit complete.
**Failure Conditions:** Cannot read file system.
**Checkpoint:** CHECKPOINT-0

## 123. Phase 1 — Project and Environment Foundation

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-1
**Objective:** Scaffold Next.js and configuration.
**Entry Conditions:** Audit complete.
**Tasks:** Run `create-next-app`, setup `env.ts` with Zod, configure Tailwind.
**Files/Modules:** `package.json`, `tsconfig.json`, `src/config/env.ts`.
**Tests:** Unit test `env.ts`.
**Acceptance Criteria:** App compiles, env vars validated.
**Exit Criteria:** `npm run build` succeeds.
**Checkpoint:** CHECKPOINT-1

## 124. Phase 2 — Application Skeleton

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-2
**Objective:** Define folder structure.
**Tasks:** Create `src/features`, `src/components`, `src/lib`.

## 125. Phase 3 — Database and Supabase Foundation

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-3
**Objective:** Local DB and RLS.
**Tasks:** `supabase init`, create migration `001_initial_schema.sql` based on `06_DATABASE_SCHEMA.md`. Implement RLS.
**Database:** `students`, `sessions`, `exercises`, etc.
**Tests:** Verify RLS blocks `anon` writes.
**Checkpoint:** CHECKPOINT-3

## 126. Phase 4 — Types, Schemas, and Validation

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-4
**Objective:** Strong typing.
**Tasks:** Run `supabase gen types`. Create `SubmitAnswerSchema` and `AiEvaluationSchema`.

## 127. Phase 5 — Core Domain and Learning Logic

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-5
**Objective:** Non-React business logic.
**Tasks:** Implement `calculateXp`, `determineMasteryState`.

## 128. Phase 6 — Authentication and Authorization

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-6
**Objective:** Secure app access.
**Tasks:** Next.js Middleware, `/login` page, Supabase SSR client.

## 129. Phase 7 — API and Server Services

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-7
**Objective:** Server Actions scaffolding.
**Tasks:** Stub `submitAnswerAction`.

## 130. Phase 8 — Learning Session and Exercise Engine

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-8
**Objective:** Session generation.
**Tasks:** Implement `startSessionAction`, pulling exercises from DB.

## 131. Phase 9 — Evaluation Engine

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-9
**Objective:** Orchestrate evaluation (Mocked AI).
**Tasks:** Implement `EvaluationService` using a stubbed Gemini adapter.

## 132. Phase 10 — Scoring, Progress, and Mastery

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-10
**Objective:** End session logic.
**Tasks:** Implement `completeSessionAction`, updating `total_xp` and `mastery`.

## 133. Phase 11 — Adaptive Learning

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-11
**Objective:** Next exercise selection.
**Tasks:** Implement `REMEDIATE` trigger on 3 errors.

## 134. Phase 12 — AI Prompt Architecture

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-12
**Objective:** System instructions.
**Tasks:** Author `src/lib/ai/prompts/evaluation.prompt.ts`.

## 135. Phase 13 — Gemini Integration

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-13
**Objective:** Live AI.
**Tasks:** Implement `@google/genai` adapter, enforce JSON output.
**Tests:** Golden Dataset integration tests.

## 136. Phase 14 — State Management

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-14
**Objective:** Client state.
**Tasks:** Implement `usePracticeSession` hook and `localStorage` recovery.

## 137. Phase 15 — UI/UX Implementation

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-15
**Objective:** Presentation layer.
**Tasks:** Build `ChatInterface`, `EvaluationCard`, `Dashboard`.

## 138. Phase 16 — Voice and Speech

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-16
**Objective:** Audio interaction.
**Tasks:** Implement `useSpeech` hook for STT/TTS. Fallbacks to text.

## 139. Phase 17 — Error Handling and Recovery

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-17
**Objective:** Resilience.
**Tasks:** Implement `ActionError` mapping, UI Toasts for 503s.

## 140. Phase 18 — Security Hardening

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-18
**Objective:** Final lock down.
**Tasks:** Verify Service Role is isolated. Ensure Zod `.strict()` is used.

## 141. Phase 19 — Automated Testing

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-19
**Objective:** Quality assurance.
**Tasks:** Write Playwright E2E suites.

## 142. Phase 20 — End-to-End Integration

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-20
**Objective:** System harmony.
**Tasks:** Run full suite. Fix bugs.

## 143. Phase 21 — Acceptance Verification

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-21
**Objective:** Sign-off.
**Tasks:** Verify all `21_ACCEPTANCE_CRITERIA.md` pass.

## 144. Phase 22 — Production Readiness

### [IMPLEMENTATION_PHASE]

**Phase ID:** PHASE-22
**Objective:** Deployment.
**Tasks:** Vercel deployment, Production ENV vars, Smoke test.

## 145. Phase Completion Gates

Antigravity must explicitly output `CHECKPOINT-[N] PASSED` before moving to Phase N+1.

## 146. Implementation Task ID System

Format: `IMP-[PHASE]-[00N]`. (e.g., `IMP-13-001`).

## 147. File-Level Implementation Mapping

| File/Directory | Purpose | Source Specification | Implementation Phase | Dependencies |
| --- | --- | --- | --- | --- |
| `src/lib/ai/gemini.ts` | Gemini Adapter | 13_GEMINI | PHASE-13 | `@google/genai` |
| `src/lib/db/admin.ts` | Service DB Client | 10_SECURITY | PHASE-3 | `@supabase/ssr` |
| `supabase/migrations/*` | Postgres Schema | 06_DB_SCHEMA | PHASE-3 | None |

## 148. Database-Object Mapping

| Database Object | Purpose | Source | Migration Phase | Dependent Modules | Tests |
| --- | --- | --- | --- | --- | --- |
| `evaluations` | Persist AI grades | 06_DB_SCHEMA | PHASE-3 | `EvaluationService` | RLS isolation |

## 149. API Mapping

| API | Purpose | Contract | Implementation Module | Dependencies | Tests |
| --- | --- | --- | --- | --- | --- |
| `submitAnswerAction` | Process translation | 09_API | `features/practice/actions` | `AiService`, `Db` | Unit, Integration |

## 150. Service Mapping

| Service | Responsibility | Dependencies | Input | Output | Failure Modes | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| `EvaluationService` | Orchestrate Gemini | `lib/ai`, `lib/db` | `Attempt` | `Evaluation` | Schema Fail | Parse tests |

## 151. State-Machine Mapping

| State Machine | States | Events | Guards | Persistence | Implementation Module | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| `PracticeSession` | READY, EVAL, FEEDBACK | Submit, Next | Is Valid | LocalStorage | `usePracticeSession` | UI unit tests |

## 152. AI Capability Mapping

| AI Capability | Prompt | Input | Output Schema | Validation | Gemini Integration | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| Evaluator | `EVAL_V1` | Marathi + English | `AiEvalSchema` | Zod | `gemini-1.5-flash` | Golden DB |

## 153. Voice Capability Mapping

| Voice Capability | Input | Processing | Output | Failure Modes | Implementation Module | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| STT | Mic Stream | Web Speech API | Text String | Mic Denied | `lib/speech/recognition` | Mock hook tests |

## 154. Security-Control Mapping

| Security Control | Implementation Location | Verification | Acceptance Criterion |
| --- | --- | --- | --- |
| RLS Deny Write | Supabase Migrations | DB Test | AC-SUPA-001 |

## 155. Error Mapping

| Error Type | Origin | Detection | Handling | User Experience | Persistence Impact | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| `PROVIDER_ERROR` | Gemini | Adapter `catch` | `ActionError` | "Connection Issue" | None | Mock 503 |

## 156. Requirements-to-Implementation Traceability

All implementation tasks trace back to `01_PRODUCT_REQUIREMENTS.md`.

## 157. Implementation-to-Test Traceability

Code without tests is considered incomplete. Every Service has a corresponding `*.test.ts`.

## 158. Implementation-to-Acceptance Traceability

Phase 21 verifies `21_ACCEPTANCE_CRITERIA.md`.

## 159. Checkpoint Strategy

Antigravity summarizes files created, tests passed, and issues resolved at the end of each Phase.

## 160. Implementation Log

Antigravity must maintain an internal execution log to prevent looping.

## 161. Change Summary

Provide a diff summary at checkpoints.

## 162. Version-Control Strategy

Commit locally after every Phase completion.

## 163. Commit Boundaries

Message format: `feat(phase-[N]): [Description]`.

## 164. Rollback Strategy

If tests fail persistently, `git reset --hard HEAD` to previous phase.

## 165. Migration Rollback

Use `supabase migration down`.

## 166. Deployment Strategy

Vercel GitHub integration.

## 167. Staging Verification

Test against Vercel Preview URLs.

## 168. Production Deployment Prerequisites

All Phase 21 Acceptance Criteria passed. Environment variables verified in Vercel UI.

## 169. Production Smoke Verification

Login, start session, submit "test", verify evaluation, complete session.

## 170. Implementation Stop Conditions

Antigravity MUST HALT AND REQUEST HUMAN INPUT if:

* A specification contradiction is found.
* Supabase or Gemini documentation contradicts the architecture (e.g., deprecated SDK).
* A destructive action (dropping tables with data) is required.

## 171. Ambiguity-Resolution Rules

Check specifications 01-21 strictly in hierarchy order.

## 172. Specification Conflict Handling

Document under "Open Questions" and halt.

## 173. Change-Control Rules

Do not rewrite specifications.

## 174. Incremental Implementation Strategy

Write code $\rightarrow$ Typecheck $\rightarrow$ Unit Test $\rightarrow$ Proceed. Do not write the whole app blindly.

## 175. Implementation Review Process

Run `npm run lint` and `npm run test` constantly.

## 176. Security Review Process

Verify `SUPABASE_SERVICE_ROLE_KEY` is not in `use client` files.

## 177. Testing Review Process

Ensure test coverage on core loop.

## 178. Acceptance Review Process

Validate against Phase 21.

## 179. MVP Implementation Boundary

Only implement 1 student, text/voice, translation evaluation.

## 180. Future Implementation

Do not build multi-tenant dashboards or pronunciation phoneme scoring.

## 181. Technical Debt

Document any shortcuts required for MVP.

## 182. Known Limitations

Firefox STT fallback.

## 183. Residual Risks

Gemini hallucinations.

## 184. Implementation Invariants

* IMP-INV-001: No server-only secret exposed to browser.
* IMP-INV-002: Gemini output is untrusted until Zod validated.
* IMP-INV-003: Technical failures do not alter mastery.

## 185. Implementation Anti-Patterns

* Putting DB queries in React Components.
* Exposing internal Gemini stack traces to the UI.

## 186. Final Architecture-Conformance Audit

Verify against `05_APPLICATION_ARCHITECTURE.md`.

## 187. Final Security Audit

Verify against `19_SECURITY_SPECIFICATION.md`.

## 188. Final Testing Audit

Verify against `20_TESTING_STRATEGY.md`.

## 189. Final Acceptance Audit

Verify against `21_ACCEPTANCE_CRITERIA.md`.

## 190. Final Documentation Audit

Ensure README is generated.

## 191. Production-Readiness Audit

Verify Vercel builds pass.

## 192. Implementation Completion Criteria

All 22 Phases marked `PASSED`.

## 193. Final Google Antigravity Execution Protocol

**READ $\rightarrow$ UNDERSTAND $\rightarrow$ PLAN $\rightarrow$ IMPLEMENT $\rightarrow$ VERIFY $\rightarrow$ TEST $\rightarrow$ REVIEW $\rightarrow$ ACCEPT $\rightarrow$ CHECKPOINT $\rightarrow$ CONTINUE.**

## 194. Final Implementation Checklist

* [x] All phases defined.
* [x] Security constraints explicitly bounded.
* [x] Testing requirements mandated.
* [x] Strict dependency order established.