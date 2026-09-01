# 09 — API Contracts Specification

## 1. Document Control

* **Document ID:** API-001
* **Document Name:** Tejaswini AI English Tutor - API Contracts Specification
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Beginner)
* **Owner:** Principal API Architect
* **Source of Truth:** Authoritative HTTP and Server Action contract specification between the browser client and the Next.js server.

## 2. Purpose

This document defines exactly how the web client communicates with the application server. It establishes the canonical contracts, inputs, outputs, error handling, and state transitions for all remote operations. It guarantees that Google Antigravity can implement the client-server boundaries predictably without guessing routing, payloads, or failure behaviors.

## 3. Scope

The scope includes all remote procedure calls (Server Actions / HTTP POST endpoints) required for the core MVP learning loop, progress tracking, and session management. It explicitly excludes third-party API contracts (e.g., Supabase internal APIs, Gemini API definitions) except where they dictate application-level error handling.

## 4. Source Documents and Authority

This contract enforces requirements defined in:

1. `01_PRODUCT_REQUIREMENTS.md` (Product rules)
2. `02_LEARNING_CURRICULUM.md` (Curriculum logic)
3. `03_UX_SPECIFICATION.md` (Interaction states needing API support)
4. `04_UI_DESIGN_SYSTEM.md` (UI-facing data requirements)
5. `05_APPLICATION_ARCHITECTURE.md` (Backend architecture and Server Actions)
6. `06_DATABASE_SCHEMA.md` (Persistence boundaries)
7. `07_CODEBASE_STRUCTURE.md` (Code organization)
8. `08_TYPES_AND_SCHEMAS.md` (Canonical runtime schemas)

## 5. API Architecture Overview

Per `05_APPLICATION_ARCHITECTURE.md`, the application primarily utilizes Next.js Server Actions functioning as an RPC-style HTTP JSON API. For standard specification purposes, this document models these interactions as strictly typed HTTP POST operations, utilizing a consistent `ActionResult<T>` envelope.

## 6. API Design Goals

* **Predictability:** Consistent request and response envelopes across all endpoints.
* **Type Safety:** End-to-end type safety mapping directly to `08_TYPES_AND_SCHEMAS.md`.
* **Idempotency:** Safe retries for unstable networks without duplicate database writes.
* **Resilience:** Graceful handling of AI or Database failures with typed error codes.
* **Beginner-Flow Compatibility:** Synchronous, fast evaluation responses (< 3s target) supporting a seamless chat UX.

## 7. API Design Principles

* **Client is Untrusted:** The API never trusts client-provided evaluation grades, correctness flags, mastery scores, or identity impersonations.
* **Semantic Validation:** The API passes answers to Gemini for semantic validation, explicitly prohibiting exact-string-match logic.
* **Historical Immutability:** Submissions never overwrite previous attempts.
* **Opaque Infrastructure Errors:** Raw stack traces, Gemini errors, and Supabase PostgREST errors are never returned to the client.

## 8. API Style

* **Style:** RPC over HTTP JSON (Implemented natively via Next.js Server Actions).
* **Method:** Exclusively `POST` for mutations and complex session queries (as per Server Action defaults).
* **Format:** `application/json`.
* **Envelope:** All responses use a discriminated union envelope (`success: true | false`).

## 9. Base Path

* **Logical Base Path:** `/actions/`
* *(Note: Next.js Server Actions abstract the exact URL path, but for contract specification, we treat the domain functions as living under this logical path).*

## 10. Versioning Strategy

* **Version:** v1 (Implicit).
* **Strategy:** No explicit URL versioning (e.g., `/v1/`) is used for the private single-student MVP.
* **Evolution:** Breaking changes are handled by deploying coordinated client/server updates, as the frontend and backend are tightly coupled in the same Vercel deployment.

## 11. Authentication Contract

* **Mechanism:** Supabase Auth Session Cookie.
* **State:** Automatically appended by the browser to every request.
* **Missing Cookie:** Returns `401 Unauthorized` / `UNAUTHORIZED` error code.
* **Expiry:** The server verifies the JWT signature on every invocation. Expired tokens are rejected.

## 12. Authorization Contract

* **Actor:** Tejaswini (Auth ID maps to Student ID).
* **Rule:** Every endpoint extracts the `studentId` from the verified session cookie. The API explicitly checks that the requested `sessionId` or `exerciseId` belongs to that `studentId` via Supabase RLS or server-side checks.
* **Violation:** Returns `403 Forbidden` / `FORBIDDEN` error code.

## 13. API Trust Boundaries

```text
Browser (Untrusted Client) 
    ↓ JSON Payload
[Zod Schema Validation Boundary]
    ↓ Validated Payload
[Authentication/Authorization Boundary]
    ↓ Trusted Payload & User Identity
Application Service (Trusted Server)
    ↓
Database / Gemini (Infrastructure)

```

## 14. Request Conventions

* **Content-Type:** `application/json` (or Next.js multipart form-data abstraction).
* **Structure:** Standard JSON objects. No query parameters are used for stateful RPC actions.
* **Idempotency:** Mutations mutating session state require a `sessionExerciseId` to prevent duplicate submissions.

## 15. Response Conventions

**Canonical Envelope:** `ActionResult<T>` from `08_TYPES_AND_SCHEMAS.md`.

*Success:*

```json
{
  "success": true,
  "data": { ... } 
}

```

*Failure:*

```json
{
  "success": false,
  "error": { "code": "...", "message": "..." }
}

```

## 16. Error Response Contract

Errors use the `ActionError` structure.

* `code`: Controlled string enum (e.g., `INVALID_INPUT`, `AI_SERVICE_UNAVAILABLE`).
* `message`: Safe, beginner-friendly human-readable string.
* *Note: Stack traces and provider secrets are explicitly stripped.*

## 17. HTTP Status Code Policy

While Next.js Server Actions primarily return `200 OK` at the HTTP layer (managing errors within the JSON envelope), the logical mapping is:

* `200 OK`: Request succeeded.
* `400 Bad Request`: Validation failed (`INVALID_INPUT`).
* `401 Unauthorized`: Missing or invalid session cookie.
* `403 Forbidden`: Attempting to access another user's session.
* `409 Conflict`: Duplicate submission detected.
* `500 Internal Server Error`: Unhandled server exception.
* `503 Service Unavailable`: Gemini API failed or timed out.

## 18. Validation Contract

* All incoming payloads are strictly validated against Zod schemas from `08_TYPES_AND_SCHEMAS.md`.
* Unknown fields are stripped (`.object()`).
* Invalid types, missing required fields, or failing regex constraints immediately short-circuit and return `INVALID_INPUT` without reaching application services.

## 19. Session API

Manages the lifecycle of a 10-15 minute practice block. Includes starting, resuming, and completing sessions.

## 20. Start Session Contract

* **Request:** Empty body (Student ID inferred from Auth).
* **Server Behavior:** Queries DB for student's current stage, generates a session, sequences 10-15 exercises (warm-up, core, review), and persists to `sessions` and `session_exercises`.
* **Response:** Returns `PracticeSessionState` (status `EXERCISE_READY`).

## 21. Resume Session Contract

* **Request:** Empty body.
* **Server Behavior:** Locates the most recent `IN_PROGRESS` session for the user. If none exists, returns a specific application code indicating a new session is needed.
* **Response:** `PracticeSessionState`.

## 22. Current Exercise Contract

* Implicitly handled by the Session responses (Start/Resume/Next). The API does not expose a standalone "get current exercise" endpoint to avoid state fragmentation. The Session State object always contains the `currentExercise`.

## 23. Answer Submission Contract

* **Endpoint:** `[POST] /actions/practice/submit`
* **Modality:** Supports `TEXT` or `VOICE`.
* **Voice Rule:** If voice is used, the client must pass the reviewed, edited text as `submittedAnswer`, alongside `rawTranscription` and `wasEdited` boolean. The API does *not* accept raw audio files.
* **Trust:** The API does NOT accept a `grade` or `isCorrect` flag from the client.

## 24. Answer Immutability

Every successful call to the Submit endpoint creates a new, immutable `Attempt` record in the database. If the user clicks "Retry" later, a *new* attempt is created. Old attempts are never overwritten.

## 25. Voice and Transcription Contract

* The API expects the browser to have already performed Speech-to-Text.
* The API contract for voice submissions is identical to text submissions, with the addition of transcription metadata used purely for analytics and UX tracking, not for evaluation penalization.

## 26. Evaluation Contract

* Evaluation is **Synchronous**.
* Because Gemini 1.5 Flash evaluates sentences in < 2 seconds, asynchronous polling is unnecessary and would over-complicate the MVP architecture.

## 27. Evaluation Flow

1. Validate `SubmitAnswerReq`.
2. Check idempotency (Does an attempt already exist for this exact interaction?).
3. Persist `Attempt` to DB.
4. Invoke Gemini with `marathiPrompt`, `studentAnswer`, and `targetConcept`.
5. Validate Gemini JSON output against `AiEvaluationSchema`.
6. Persist `Evaluation` and `EvaluationErrors` to DB.
7. Return `EvaluationResponse`.

## 28. Evaluation Response Contract

Returns the parsed `Evaluation` object, containing the `grade` (A-F), `correctedText`, `explanationMarathi`, and array of `EvaluationError`s. Excludes raw Gemini prompts.

## 29. Multiple-Valid-Answer Contract

The API relies on the AI evaluation schema to determine correctness. If the AI returns grade `A` (Fully correct) but notes an `alternativeValidTranslation`, the API passes this back to the client. The API does NOT do a direct string comparison against the database reference translation.

## 30. Retry Contract

* **Endpoint:** `[POST] /actions/practice/retry`
* **Server Behavior:** Updates the session state to allow a new attempt for the same exercise.
* **Response:** Returns `PracticeSessionState` (status `EXERCISE_READY`).

## 31. Next Exercise Contract

* **Endpoint:** `[POST] /actions/practice/next`
* **Server Behavior:** Advances the `session_exercises` sequence. If it is the last exercise, transitions state to `SESSION_COMPLETING`.
* **Response:** Returns the updated `PracticeSessionState`.

## 32. Session Completion Contract

* **Endpoint:** `[POST] /actions/session/complete`
* **Server Behavior:** Calculates total XP, updates `mastery` tables, aggregates `SessionSummaryData`, marks session `COMPLETED`, and clears active session state.
* **Response:** Returns `SessionSummaryData`.

## 33. Progress API

* **Endpoint:** `[POST] /actions/progress/summary`
* **Response:** Aggregated top-level XP, streak data, and current curriculum stage.

## 34. Mastery API

* Aggregated and returned alongside the Progress API or Session Summary. Direct client mutation is forbidden.

## 35. Mistake History API

* **Endpoint:** `[POST] /actions/progress/mistakes`
* **Response:** List of recent `EvaluationError` combined with the original `marathiPrompt` and `correctedText`. Limited to the last 20 mistakes.

## 36. Review API

* Mistake review is embedded into the core practice session generation (Session API). No standalone API is exposed.

## 37. Profile and Settings API

* Not required for MVP. Profile data (name, stage) is returned in the auth/session context.

## 38. Endpoint Inventory

| ID | Method | Path | Purpose | Auth | Request Schema | Response Schema | Main Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-01 | POST | `/actions/session/start` | Initiates new session | Yes | *Empty* | `PracticeSessionState` | `INTERNAL_ERROR` |
| EP-02 | POST | `/actions/session/resume` | Loads active session | Yes | *Empty* | `PracticeSessionState` | `NOT_FOUND` |
| EP-03 | POST | `/actions/practice/submit` | Submits translation | Yes | `SubmitAnswerReq` | `EvaluationResponse` | `INVALID_INPUT`, `AI_SERVICE_UNAVAILABLE` |
| EP-04 | POST | `/actions/practice/retry` | Resets current exercise | Yes | `SessionActionReq` | `PracticeSessionState` | `INVALID_STATE` |
| EP-05 | POST | `/actions/practice/next` | Advances sequence | Yes | `SessionActionReq` | `PracticeSessionState` | `INVALID_STATE` |
| EP-06 | POST | `/actions/session/complete` | Finalizes session | Yes | `SessionActionReq` | `SessionSummaryData` | `INVALID_STATE` |
| EP-07 | POST | `/actions/progress/mistakes` | Loads recent errors | Yes | *Empty* | `MistakeHistoryRes` | `INTERNAL_ERROR` |

## 39. Detailed Endpoint Contracts

### [POST] `/actions/practice/submit`

**Purpose:**
Submits the student's text or transcribed voice answer for AI evaluation and persistence.

**Authentication:**
Required (Supabase Auth Cookie).

**Authorization:**
Server verifies `sessionExerciseId` belongs to the authenticated `studentId`.

**Idempotency:**
Yes. If an attempt already exists for this `sessionExerciseId`, returns `409 Conflict` equivalent (`DUPLICATE_SUBMISSION`).

**Path Parameters:**
None.

**Query Parameters:**
None.

**Request Headers:**

| Header | Required | Description |
| --- | --- | --- |
| `Content-Type` | Yes | `application/json` |

**Request Schema:**
`SubmitAnswerReq` (from `08_TYPES_AND_SCHEMAS.md`)

**Validation:**

* `submittedAnswer` must be a non-empty string.
* `modality` must be `'TEXT' | 'VOICE'`.

**Processing Flow:**

1. Verify Auth and Ownership.
2. Check Idempotency.
3. Save `Attempt` to database via Service Role.
4. Call Gemini AI Orchestrator.
5. Validate AI output against `AiEvaluationSchema`.
6. Save `Evaluation` and `EvaluationErrors` to database.
7. Return `EvaluationResponse`.

**Success Status:**
`200 OK` (Inside `success: true` envelope)

**Response Schema:**
`EvaluationResponse`

**Example Request:**

```json
{
  "sessionExerciseId": "uuid-placeholder-1234",
  "modality": "VOICE",
  "rawTranscription": "I want to by an apple",
  "submittedAnswer": "I want to buy an apple",
  "wasEdited": true
}

```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "evaluation": {
      "id": "eval-uuid-placeholder",
      "attemptId": "attempt-uuid-placeholder",
      "grade": "C",
      "correctedText": "I want to buy an apple.",
      "explanationMarathi": "वाक्य बरोबर आहे, पण 'buy' वापरताना स्पेलिंग आणि व्याकरणाकडे लक्ष द्या.",
      "alternativeValidTranslations": null
    },
    "errors": [
      {
        "id": "err-uuid-placeholder",
        "category": "SPELLING"
      }
    ]
  }
}

```

**Error Responses:**

| HTTP Status | Error Code | Meaning | Retryable |
| --- | --- | --- | --- |
| 400 | `INVALID_INPUT` | Payload failed Zod validation | No |
| 403 | `FORBIDDEN` | Session belongs to another user | No |
| 409 | `DUPLICATE_SUBMISSION` | Answer already submitted | No |
| 503 | `AI_SERVICE_UNAVAILABLE` | Gemini timeout or 5xx | Yes |
| 502 | `AI_VALIDATION_FAILED` | Gemini returned invalid JSON | Yes |

**Side Effects:**
None outside database writes.

**Database Effects:**
Inserts row in `attempts`, `evaluations`, and `evaluation_errors`.

**AI Effects:**
Consumes Gemini tokens.

**State Transition:**
`AWAITING_RESPONSE` $\rightarrow$ `EVALUATING` $\rightarrow$ `FEEDBACK_READY`.

---

### [POST] `/actions/session/complete`

**Purpose:**
Finalizes a practice session, updates mastery, and calculates XP.

**Authentication:**
Required.

**Authorization:**
Must own `sessionId`.

**Idempotency:**
Yes. If session status is already `COMPLETED`, returns existing `SessionSummaryData`.

**Request Schema:**
`SessionActionReq`

**Processing Flow:**

1. Verify Auth and Ownership.
2. Check if all required exercises have attempts.
3. Calculate XP and update `mastery` table.
4. Update `sessions` status to `COMPLETED` and cache `summary_data`.
5. Return summary.

**Success Status:**
`200 OK`

**Response Schema:**
`SessionSummaryData`

**Error Responses:**

| HTTP Status | Error Code | Meaning | Retryable |
| --- | --- | --- | --- |
| 422 | `INVALID_STATE` | Not all exercises completed | No |

## 40. Request/Response Schema References

All Request and Response objects reference the exact TypeScript compilation targets defined in `08_TYPES_AND_SCHEMAS.md`. No inline redefinitions are permitted in the application code.

## 41. Serialization Contract

* **UUIDs:** Sent as strings.
* **Dates:** Sent as ISO 8601 strings (e.g., `"2026-09-01T12:00:00Z"`).
* **Enums:** Sent as uppercase string literals (e.g., `"TEXT"`, `"GRAMMAR"`).

## 42. API State Transitions

| Endpoint | Current State | Event | Next State | Invalid State Response |
| --- | --- | --- | --- | --- |
| `/submit` | `EXERCISE_READY` | Valid Submit | `FEEDBACK_READY` | `INVALID_STATE` |
| `/retry` | `FEEDBACK_READY` | Retry Click | `EXERCISE_READY` | `INVALID_STATE` |
| `/next` | `FEEDBACK_READY` | Next Click | `EXERCISE_READY` | `INVALID_STATE` |

## 43. Idempotency Strategy

* Mutations modifying session flow use `sessionExerciseId` as the idempotency key.
* The server queries the DB for existing attempts linked to the `sessionExerciseId`. If found, a duplicate submission is blocked, preventing double-billing of AI tokens and corrupting mastery stats.

## 44. Concurrency Strategy

* Single-student MVP limits concurrency risks.
* If the student opens two tabs and submits simultaneously, the database's unique constraints on `(session_exercise_id)` will cause the second transaction to fail safely, returning `DUPLICATE_SUBMISSION`.

## 45. Optimistic Concurrency

Not required. The client relies entirely on the server as the source of truth for evaluations and state progression.

## 46. Pagination Strategy

* Not required for MVP core loops.
* `/actions/progress/mistakes` returns a fixed hard limit of the last 20 mistakes.

## 47. Filtering and Sorting

* `/actions/progress/mistakes` automatically filters by `evaluation_errors` sorted by `created_at DESC`. No client-provided filter parameters are permitted in the MVP to maintain simplicity.

## 48. Rate Limiting

* **Mechanism:** Implemented via Vercel Edge Middleware or Next.js layout configuration if necessary.
* **Policy:** Max 10 `/submit` requests per minute per user to prevent AI abuse.
* **Response:** `429 Too Many Requests` with error code `RATE_LIMITED`.

## 49. Timeout Strategy

* **Client Timeout:** UI will abort and show an error toast if `/submit` takes longer than 8000ms.
* **Server Timeout:** Gemini API calls are wrapped in a 5000ms `AbortController` timeout to prevent hanging Server Actions. Returns `AI_SERVICE_UNAVAILABLE`.

## 50. Retry Strategy

* **Client:** Safe to retry `503` and `502` errors manually via the UI "Retry" button.
* **Server:** Automatically retries Gemini API calls exactly once if they fail with a `500` or JSON parse error before returning an error to the client.

## 51. AI Failure Handling

* If Gemini fails, the `SubmitAnswerReq` attempt is still logged (so the user's text isn't lost), but the evaluation is marked as failed/pending. The UI remains in `EXERCISE_READY` or `ERROR` state, allowing the user to click "Retry Evaluation" without retyping.

## 52. Database Failure Handling

* If Supabase is unreachable, Server Actions fail instantly and return `INTERNAL_ERROR`. The UI instructs the student to check their connection.

## 53. Partial-Failure Handling

* AI evaluation and Database insertions are wrapped in a single logical server operation. If persistence fails *after* AI generation, the AI result is discarded, and the user must retry. AI token cost is absorbed as a technical loss to ensure data integrity.

## 54. Transaction Boundaries

* Supabase transactions are used via the Service Role client to atomically insert the `Attempt`, `Evaluation`, and `EvaluationErrors` in a single bound commit.

## 55. Asynchronous Operations

* No long-polling or WebSockets are used. All API calls are synchronous Request/Response loops.

## 56. Request IDs and Correlation

* Vercel automatically injects `x-vercel-id`. This is captured by the server logger to correlate API failures with AI failures. It is NOT exposed to the client.

## 57. API Observability

* Server Actions log the execution time of the Gemini call and the resulting Zod validation status. Payload data (student answers) is NOT logged externally to protect privacy.

## 58. API Security

* **CORS:** Standard Next.js same-origin policy.
* **CSRF:** Handled natively by Next.js Server Actions.
* **Input Validation:** Zod completely sanitizes inputs, stripping extra properties.
* **Secret Isolation:** No endpoints return provider keys, stack traces, or internal DB schemas.

## 59. Input Limits

* `submittedAnswer`: Maximum 500 characters.
* `rawTranscription`: Maximum 1000 characters.
* Payloads exceeding this are rejected by Zod with `INVALID_INPUT`.

## 60. Output Limits

* `alternativeValidTranslations`: Bounded to max 3 items by AI schema.
* `explanationMarathi`: Bounded to max 250 characters.

## 61. Resource Ownership Matrix

| Resource | Student Read | Student Create | Student Update | Student Delete | Server Only |
| --- | --- | --- | --- | --- | --- |
| `Session` | Yes | Yes (via API) | No | No | State updates |
| `Attempt` | Yes | Yes (via API) | No | No | Direct Insert |
| `Evaluation` | Yes | No | No | No | Direct Insert |
| `Mastery` | Yes | No | No | No | Direct Update |

## 62. API-to-Database Mapping

| Endpoint | Database Tables | Read/Write | Transaction | Notes |
| --- | --- | --- | --- | --- |
| `/start` | `sessions`, `session_exercises` | Write | Yes | Generates 15 rows |
| `/submit` | `attempts`, `evaluations` | Write | Yes | Atomic insert |
| `/complete` | `sessions`, `mastery` | Write | Yes | Aggregates XP |

## 63. API-to-Service Mapping

| Endpoint | Application Service | Domain Operation | External Integration |
| --- | --- | --- | --- |
| `/submit` | `EvaluationService` | Evaluate Semantic Meaning | Google Gemini |
| `/complete` | `ProgressService` | Calculate Session XP | Supabase |

## 64. API-to-AI Mapping

| Endpoint | AI Operation | Gemini Required | AI Output Schema | Failure Handling |
| --- | --- | --- | --- | --- |
| `/submit` | Semantic Evaluation | Yes | `AiEvaluationSchema` | Retry 1x, then return 503 |

## 65. API-to-UX Mapping

| Endpoint | UX Flow | Screen | Trigger | Expected UI State |
| --- | --- | --- | --- | --- |
| `/submit` | Answer Evaluation | Practice | Click "Submit" | Feedback Card Appears |
| `/next` | Advance Flow | Practice | Click "Next" | New Prompt Appears |
| `/complete` | Session End | Practice | Auto on last Q | Redirect to Summary |

## 66. Endpoint Dependency Graph

```text
Start Session (/start)
    │
    ▼
Current Exercise (loaded via session state)
    │
    ▼
Submit Answer (/submit) ────► Evaluates via Gemini
    │
    ▼
Feedback Ready (UI State)
    │
    ├──► Retry Exercise (/retry) ──► Current Exercise
    │
    └──► Next Exercise (/next)
             │
             ├──► (If more questions) ──► Current Exercise
             │
             └──► (If last question) ──► Complete Session (/complete)
                                              │
                                              ▼
                                         Progress Summary (/progress/summary)

```

## 67. Complete Error Catalog

| Error Code | HTTP Status | Meaning | Retryable | User Action | Server Action |
| --- | --- | --- | --- | --- | --- |
| `INVALID_INPUT` | 400 | Payload failed Zod validation | No | Check input | Log warning |
| `UNAUTHORIZED` | 401 | Missing/invalid session cookie | No | Redirect to login | None |
| `FORBIDDEN` | 403 | Accessing another user's data | No | None | Log security alert |
| `NOT_FOUND` | 404 | Session or exercise missing | No | Return to dashboard | None |
| `DUPLICATE_SUBMISSION` | 409 | Attempt already exists | No | Ignore | None |
| `INVALID_STATE` | 422 | Action not allowed in current state | No | Refresh page | None |
| `RATE_LIMITED` | 429 | Too many requests | Yes | Wait 1 minute | Enforce limit |
| `AI_SERVICE_UNAVAILABLE` | 503 | Gemini timeout or crash | Yes | Click Retry | Retry 1x |
| `AI_VALIDATION_FAILED` | 502 | Gemini returned invalid JSON | Yes | Click Retry | Log payload schema failure |
| `INTERNAL_ERROR` | 500 | Unhandled exception | Yes | Refresh page | Log stack trace |

## 68. Endpoint Authentication Matrix

| Endpoint | Auth Required | Ownership Check | RLS | Server Privilege |
| --- | --- | --- | --- | --- |
| `/start` | Yes | N/A (creates new) | Yes | Service Role (Write) |
| `/submit` | Yes | Yes (`sessionId`) | Yes | Service Role (Write) |
| `/progress/*` | Yes | Yes | Yes | Anon Key (Read) |

## 69. Endpoint Idempotency Matrix

| Endpoint | Idempotent | Mechanism | Duplicate Behavior |
| --- | --- | --- | --- |
| `/submit` | Yes | `sessionExerciseId` check | Returns `DUPLICATE_SUBMISSION` |
| `/complete` | Yes | Session status check | Returns existing summary |
| `/next` | No | Sequence increment | Handled by UI state lock |

## 70. Endpoint State-Transition Matrix

| Endpoint | Current State | Event | Next State | Invalid State Response |
| --- | --- | --- | --- | --- |
| `/submit` | `EXERCISE_READY` | Submit | `FEEDBACK_READY` | `INVALID_STATE` |
| `/retry` | `FEEDBACK_READY` | Retry | `EXERCISE_READY` | `INVALID_STATE` |
| `/complete` | `FEEDBACK_READY` | Complete | `SESSION_COMPLETE` | `INVALID_STATE` |

## 71. Endpoint Test Matrix

| Endpoint | Happy Path | Validation | Authentication | Authorization | Failure | Concurrency |
| --- | --- | --- | --- | --- | --- | --- |
| `/submit` | Valid AI response | Empty answer | No cookie | Wrong student ID | Gemini Timeout | Double click |
| `/start` | DB inserts OK | N/A | No cookie | N/A | DB offline | N/A |

## 72. API Contract Examples

**Submit Text Answer (Success)**

```json
// POST /actions/practice/submit
// Request
{
  "sessionExerciseId": "ex-uuid-1",
  "modality": "TEXT",
  "submittedAnswer": "She goes to school."
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "evaluation": {
      "grade": "A",
      "correctedText": null,
      "explanationMarathi": "अगदी बरोबर!",
      "alternativeValidTranslations": null
    },
    "errors": []
  }
}

```

**Submit Voice Answer (Minor Error)**

```json
// POST /actions/practice/submit
// Request
{
  "sessionExerciseId": "ex-uuid-2",
  "modality": "VOICE",
  "rawTranscription": "I eat apple",
  "submittedAnswer": "I eat apple",
  "wasEdited": false
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "evaluation": {
      "grade": "C",
      "correctedText": "I eat an apple.",
      "explanationMarathi": "'Apple' पूर्वी 'an' वापरतात.",
      "alternativeValidTranslations": null
    },
    "errors": [{ "category": "ARTICLE" }]
  }
}

```

## 73. Malformed Request Examples

**Empty Answer**

```json
// Request
{
  "sessionExerciseId": "ex-uuid-1",
  "modality": "TEXT",
  "submittedAnswer": "   "
}

// Response (200 OK - Envelope Error)
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Answer cannot be empty."
  }
}

```

## 74. API Evolution Strategy

* No URL versioning is employed.
* Because the frontend and backend are tightly coupled in Next.js Server Actions, schema changes are deployed simultaneously.
* If a breaking change occurs to the payload schema, the TypeScript compiler will halt the deployment, ensuring client/server sync.

## 75. Client Compatibility

* This API is built exclusively for the Next.js web application via Server Actions. It is not intended for external mobile apps or third-party consumers.

## 76. Caching Policy

* **Mutation Endpoints (`/submit`, `/next`):** NEVER cached (`no-store`).
* **Progress Endpoints (`/progress/summary`):** Fetched dynamically, avoiding stale cache, as XP updates immediately upon session completion.

## 77. Security-Sensitive Fields

The API MUST NEVER return:

* `ai_metadata.prompt_version`
* `ai_metadata.tokens_used`
* Gemini system instructions.
These exist in the database but are stripped from the DTO.

## 78. Hidden/Internal Fields

* `id` of `EvaluationErrors`: Needed for database primary keys but stripped from API responses, as the UI only needs the `category` string.

## 79. DTO Boundaries

```text
Database Row (evaluations) -> EvaluationDomainModel -> EvaluationResponse (DTO)

```

The DTO boundary strips internal database timestamps (`created_at`, `updated_at`) that the UI does not require to render feedback.

## 80. Request-to-Domain Mapping

* `SubmitAnswerReq` $\rightarrow$ Zod Validation $\rightarrow$ Domain `Attempt` object $\rightarrow$ `EvaluationService`.

## 81. Response Mapping

* Domain `Evaluation` object $\rightarrow$ `EvaluationResponse` DTO $\rightarrow$ Next.js Server Action serialization $\rightarrow$ Client.

## 82. API Contract Ownership

* `08_TYPES_AND_SCHEMAS.md` owns the shape of the data.
* This document (`09_API_CONTRACTS.md`) owns the *behavior*, routing logic, status codes, and HTTP semantics.

## 83. Google Antigravity Implementation Rules

* Antigravity MUST implement all endpoints as Next.js Server Actions defined in `src/features/*/actions/*.ts`.
* Every action MUST return `ActionResult<T>`.
* Never use `throw new Error()` for business logic failures; always return `{ success: false, error: ActionError }`.
* Never pass the raw `FormData` object to the application service; always parse it through Zod first.

## 84. API Anti-Patterns

* **Prohibited:** Trusting the client to say `isCorrect: true`.
* **Prohibited:** Returning `200 OK` with raw Gemini JSON output without validating it against `AiEvaluationSchema`.
* **Prohibited:** Using `/api/submit` route handlers instead of Server Actions.
* **Prohibited:** Returning `500` and crashing the application when Gemini is rate-limited.

## 85. API Acceptance Criteria

| ID | Requirement | Verification Method |
| --- | --- | --- |
| API-AC-01 | Zod Validation | Sending an empty string to `/submit` returns `INVALID_INPUT` without invoking Gemini. |
| API-AC-02 | Immutability | Calling `/submit` twice on the same `sessionExerciseId` returns `DUPLICATE_SUBMISSION`. |
| API-AC-03 | Auth Protection | Calling any action without a Supabase session cookie returns `UNAUTHORIZED`. |
| API-AC-04 | Safe Failure | Forcing a Gemini API key failure returns `AI_SERVICE_UNAVAILABLE` gracefully. |

## 86. Complete Endpoint Inventory Audit

* All required UX operations (Start, Submit, Next, Retry, Complete, Progress) have a mapped endpoint.
* All endpoints utilize strict schemas.

## 87. API Consistency Audit

* Verified against `05_APPLICATION_ARCHITECTURE.md`: Follows Server Action RPC pattern.
* Verified against `08_TYPES_AND_SCHEMAS.md`: Uses `ActionResult` and domain schemas.
* Verified against `03_UX_SPECIFICATION.md`: Supports Voice/Text modalities and Edited STT flags.

## 88. Assumptions

* Next.js Server Actions are fully stable in the target Next.js version.
* Vercel Edge functions or standard Serverless functions provide sufficient timeout limits for Gemini execution (< 10 seconds).

## 89. Open API Questions

| ID | Question | Why It Matters | Status |
| --- | --- | --- | --- |
| API-OQ-01 | Should we implement a strict server-side timeout race condition for Gemini calls? | Prevents Vercel serverless functions from hanging and billing excess compute time. | Resolved: Yes, 5000ms AbortController enforced in AI Service. |

## 90. Final API Contract Specification

This specification provides a secure, predictable, and fully typed RPC layer. By enforcing structured payloads, explicit idempotency, and graceful error envelopes, it ensures the UI remains responsive and the database remains uncorrupted, even in the event of unpredictable AI behavior or network instability.

## 91. API Completion Checklist

* [x] Defined unified envelope (`ActionResult<T>`).
* [x] Auth and RLS boundaries enforced.
* [x] Endpoint definitions for full session lifecycle.
* [x] Idempotency mapped to prevent duplicate DB inserts.
* [x] Voice transcription metadata included in submit payload.
* [x] Zod validation boundary strictly defined.
* [x] Error codes cataloged and mapped to UX states.
* [x] Google Antigravity guardrails established.