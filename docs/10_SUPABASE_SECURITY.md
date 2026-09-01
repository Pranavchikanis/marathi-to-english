# 10 — Supabase Security Specification

## 1. Document Control

* **Document ID:** SEC-001
* **Document Name:** Tejaswini AI English Tutor - Supabase Security Specification
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Beginner)
* **Owner:** Principal Supabase Security Architect
* **Source of Truth:** Authoritative specification for PostgreSQL security, Row Level Security (RLS), authentication, authorization, and data privacy boundaries.

## 2. Purpose

This document defines the definitive security model for the application's Supabase and PostgreSQL database layer. It establishes exactly how data is protected against unauthorized access, privilege escalation, and malicious client behavior, ensuring Google Antigravity implements a secure, defense-in-depth architecture.

## 3. Scope

The scope encompasses all Supabase infrastructure, PostgreSQL tables, Row Level Security (RLS) policies, authentication constraints, service-role boundaries, and environment variable protections. It applies to the MVP intended for a single student but is designed to safely isolate data for future multi-tenant expansion.

## 4. Security Source Documents and Authority

This security specification enforces the boundaries and data models established in:

1. `01_PRODUCT_REQUIREMENTS.md`
2. `05_APPLICATION_ARCHITECTURE.md`
3. `06_DATABASE_SCHEMA.md`
4. `08_TYPES_AND_SCHEMAS.md`
5. `09_API_CONTRACTS.md`

## 5. Security Objectives

* **Data Isolation:** Ensure a student can only ever access their own data.
* **Authoritative Writes:** Prevent client-side manipulation of grades, mastery, and learning history.
* **Defense-in-Depth:** Protect the database via RLS even if the Next.js API layer is bypassed or compromised.
* **Secret Protection:** Guarantee that privileged keys (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) never leak to the browser.
* **Immutable History:** Protect historical attempts and evaluations from being modified or deleted by users.

## 6. Security Principles

* **Zero Trust Client:** The browser is a hostile environment. Client-provided identifiers, scores, and evaluations are implicitly untrusted.
* **Least Privilege:** Roles, users, and server actions are granted only the minimum permissions necessary to perform their stated functions.
* **Default Deny:** RLS policies operate on a default-deny basis. Access must be explicitly granted.
* **Server-Authoritative Evaluation:** Only the server, orchestrating the AI, may write evaluation and mastery results.

## 7. Supabase Security Architecture

The architecture utilizes Supabase Auth to establish identity. The browser uses the `NEXT_PUBLIC_SUPABASE_ANON_KEY` combined with the user's JWT to execute read-only queries against public or owned data. All database mutations (INSERT/UPDATE/DELETE) are routed through Next.js Server Actions, which utilize the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and securely execute trusted business logic.

## 8. Trust Boundaries

```text
Browser (Untrusted)
    ↓ (Anon Key + Auth JWT)
[ Supabase PostgREST ] → [ RLS ] → (Read-Only Access)
    
Browser (Untrusted)
    ↓ (API Payload)
[ Next.js Server Action ] → (Validation & Auth Check) → (Trusted Context)
    ↓ (Service-Role Key)
[ PostgreSQL ] → (Bypass RLS for mutations)

```

## 9. Authentication Architecture

* **Provider:** Supabase Auth.
* **Identity:** Users authenticate via email/password or magic link.
* **Session State:** JWTs are stored in secure, HTTP-only cookies managed by `@supabase/ssr`.
* **Unauthenticated Access:** Rejected at the API layer (Next.js Middleware) and at the database layer (RLS prevents `anon` access to student data).

## 10. Authorization Architecture

Authorization is applied at two layers:

1. **API Layer:** Next.js Server Actions verify the session cookie and ensure the requested operation targets resources belonging to the authenticated user.
2. **Database Layer (RLS):** Policies enforce that the `auth.uid()` matches the owner of the record being queried, preventing Insecure Direct Object Reference (IDOR) attacks if an API check fails.

## 11. Canonical Ownership Model

Data ownership trickles down from the `students` table, which acts as the root identity mapping to `auth.users`.

* `auth.users.id` $\rightarrow$ `students.auth_user_id`
* `students.id` $\rightarrow$ `sessions.student_id` $\rightarrow$ `session_exercises` $\rightarrow$ `attempts` $\rightarrow$ `evaluations`
* `students.id` $\rightarrow$ `mastery.student_id`

## 12. `auth.uid()` Strategy

Supabase RLS policies use the `auth.uid()` function to extract the UUID of the user making the request.

* Because application data links to the `students.id` (not directly to `auth_user_id` in downstream tables), RLS policies must either join through the `students` table or leverage a direct mapping constraint.

## 13. Database Table Classification

* **Public/Read-Only Curriculum:** `curriculum_stages`, `concepts`, `exercises`.
* **Student-Owned (Read-Only to Browser):** `students`, `sessions`, `session_exercises`, `attempts`, `evaluations`, `evaluation_errors`, `mastery`.
* **Student-Owned (Write):** NONE. All writes are server-only.
* **Server-Managed/Internal:** Supabase Auth schema, migration tables.

## 14. RLS Strategy

* Every application table MUST have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
* Browser clients (`authenticated` role) are granted `SELECT` access only where ownership is proven.
* Browser clients are explicitly denied `INSERT`, `UPDATE`, and `DELETE` on all tables.
* The `service_role` automatically bypasses RLS to perform mutations.

## 15. RLS Policy Matrix

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Owner Rule | Server-Only Operations |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `students` | Yes | `auth.uid() = auth_user_id` | Deny | Deny | Deny | Direct | Insert, Update, Delete |
| `curriculum_stages` | Yes | `true` (Public) | Deny | Deny | Deny | None | Insert, Update, Delete |
| `concepts` | Yes | `true` (Public) | Deny | Deny | Deny | None | Insert, Update, Delete |
| `exercises` | Yes | `true` (Public) | Deny | Deny | Deny | None | Insert, Update, Delete |
| `sessions` | Yes | `students.auth_user_id = auth.uid()` | Deny | Deny | Deny | Join `students` | Insert, Update, Delete |
| `session_exercises` | Yes | Via `sessions` | Deny | Deny | Deny | Join `sessions` | Insert, Update, Delete |
| `attempts` | Yes | Via `session_exercises` | Deny | Deny | Deny | Deep Join | Insert |
| `evaluations` | Yes | Via `attempts` | Deny | Deny | Deny | Deep Join | Insert |
| `evaluation_errors` | Yes | Via `evaluations` | Deny | Deny | Deny | Deep Join | Insert |
| `mastery` | Yes | `students.auth_user_id = auth.uid()` | Deny | Deny | Deny | Join `students` | Insert, Update |

## 16. Curriculum Security

Curriculum data (`curriculum_stages`, `concepts`, `exercises`) is canonical reference data.

* **Read:** Publicly readable by the `authenticated` role.
* **Write:** Strictly prohibited. Only database migrations or service-role seed scripts may modify curriculum data.

## 17. Exercise Security

* Exercises are read-only.
* `reference_translations` are sent to the client to provide UI feedback *only after* an evaluation is complete, but they are readable via the API. This is acceptable as the AI determines correctness, not a hidden client-side string match.

## 18. Session Security

* **Read:** Students may query `sessions` belonging to them.
* **Write/Update/Complete:** Must be performed via `09_API_CONTRACTS.md` endpoints using the service-role key. The client cannot forge a `status = 'COMPLETED'` payload to earn unverified XP.

## 19. Attempt Security

* **Immutability:** Attempts are historical records. `INSERT` is restricted to the server. `UPDATE` and `DELETE` are permanently disabled for all roles (including service-role application logic, except during cascading account deletion).

## 20. Evaluation Security

* **Authoritative Source:** Only the Server Action orchestrating the Gemini API may create an `Evaluation`.
* **Prevention:** The client cannot submit `{ "grade": "A" }` directly to Supabase. RLS outright blocks `INSERT`.

## 21. Mastery Security

* **Read:** Students can read their own mastery levels to populate the dashboard.
* **Write:** Client-side updates are forbidden. Mastery is a derived, authoritative value calculated by the server upon session completion.

## 22. Progress Security

* `students.total_xp` is updated exclusively by the server during the `Complete Session` action. It is protected from client-side mass assignment by RLS denying `UPDATE`.

## 23. Review and Mistake Security

* Mistake history relies on joining `evaluation_errors` to `attempts`. Because RLS policies enforce ownership at the root, a student cannot query `evaluation_errors` belonging to a different student's attempt.

## 24. Student Profile Security

* The `students` table maps to `auth.users`.
* **Read:** The student can read their own profile.
* **Write:** Profile updates (if implemented) must route through an API endpoint to sanitize inputs. Direct RLS `UPDATE` is denied.

## 25. Supabase Auth Security

* `auth.users` is highly sensitive and entirely managed by Supabase.
* Application code never accesses `auth.users` directly; it relies on the JWT payload and the linked `students` table.

## 26. Service-Role Security

* The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies.
* It MUST ONLY be used within Next.js Server Actions or Route Handlers.
* It MUST NEVER be prefixed with `NEXT_PUBLIC_`.
* It MUST NEVER be logged or leaked in API responses.

## 27. Public/Anon Key Security

* The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in the browser bundle.
* It holds zero intrinsic permissions. Its sole purpose is to identify the Supabase project and trigger the RLS evaluation engine against the accompanying JWT.

## 28. Environment Variable Security

| Variable | Public/Secret | Client/Server | Storage Location | Exposure Risk | Security Rule |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Both | Vercel Env, Code | Low | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Both | Vercel Env, Code | Low | Safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server | Vercel Env | CRITICAL | Never expose |
| `GEMINI_API_KEY` | Secret | Server | Vercel Env | CRITICAL | Never expose |

## 29. Direct Supabase Access Strategy

* **Read Operations:** The browser IS allowed to directly access Supabase (via the `supabase-js` client initialized with the Anon key) to read dashboard stats, session history, and public curriculum. This reduces unnecessary API boilerplate.
* **Write Operations:** The browser MUST use application API endpoints (Server Actions). Direct mutations are completely blocked by RLS.

## 30. API vs RLS Responsibilities

* **API (Next.js):** Validates input schemas (Zod), orchestrates AI, manages state transitions, calculates derived mastery, and enforces business rules.
* **RLS (PostgreSQL):** Acts as the final firewall ensuring that even if an API endpoint mistakenly omits an ownership check, the database will silently filter out rows not belonging to the `auth.uid()`.

## 31. Database Privilege Model

| Role | Tables | Functions | Views | Intended Access | Restrictions |
| --- | --- | --- | --- | --- | --- |
| `anon` | None | None | None | Unauthenticated requests | Blocked by RLS |
| `authenticated` | App Tables | None | None | Browser client | `SELECT` only (via RLS) |
| `service_role` | All | All | All | Next.js Server | Bypasses RLS |

## 32. Least-Privilege Model

The application follows a strict least-privilege architecture. The browser cannot write. The AI cannot access the database. The database does not reach out to the internet.

## 33. SECURITY DEFINER Policy

* **Rule:** No `SECURITY DEFINER` functions are permitted in this application.
* *Rationale:* Server Actions handling the Service Role key eliminate the need to elevate privileges inside the database via RPC functions, keeping business logic centralized in TypeScript and reducing attack surface.

## 34. RPC Security

* No custom RPC functions are exposed or required for the MVP.

## 35. Schema-Level Privileges

* The `authenticated` role is granted `USAGE` on the `public` schema, but access is restricted to the table level via RLS. Access to the `auth` or `storage` schemas is strictly prohibited.

## 36. View Security

* No views are required for the MVP.

## 37. Materialized View Security

* No materialized views are required for the MVP.

## 38. Database Function Security

| Function | Caller | Execute Allowed | Security Mode | Ownership Check | Risk | Required Controls |
| --- | --- | --- | --- | --- | --- | --- |
| `handle_new_user()` | Supabase Auth Trigger | System | `SECURITY DEFINER` | N/A | Auth Hijack | Bound to `auth.users` insert only. |

*Note: The only required function is a standard Supabase trigger to copy new user signups into the `students` table.*

## 39. Trigger Security

* The `handle_new_user()` trigger automatically provisions the `students` row. It cannot be executed by the client.

## 40. Immutable Fields

The following fields are conceptually immutable and MUST NOT be updated after creation:

* `students.auth_user_id`
* `sessions.student_id`
* `attempts.raw_transcription`
* `attempts.submitted_answer`
* `evaluations.grade`
* `evaluations.ai_metadata`

## 41. Ownership-Transfer Protection

* Because `UPDATE` is denied for the `authenticated` role, a student cannot execute `UPDATE sessions SET student_id = 'another-uuid'`.
* Server Actions validate the session cookie against the requested session ID before executing any Service Role mutations.

## 42. Foreign-Key Security

* Foreign keys (e.g., `attempt_id` in `evaluations`) rely on standard PostgreSQL constraints. Cascading deletes are configured strictly from parent to child (`sessions` $\rightarrow$ `session_exercises` $\rightarrow$ `attempts`) ensuring orphaned records cannot expose data.

## 43. Cross-Student Isolation

Even though the MVP caters to one student (Tejaswini), RLS policies are strictly written as `student_id = auth.uid()`. This guarantees zero code changes are required to safely support 100 students in the future.

## 44. IDOR Protection

* Insecure Direct Object Reference (IDOR) is prevented natively. If User A calls `GET /sessions/User-B-Session-ID`, the API's ownership check will fail. If the API check is bypassed, the database's RLS policy will return 0 rows.

## 45. Mass-Assignment Protection

* Zod validation schemas in `08_TYPES_AND_SCHEMAS.md` strictly define allowed inputs using `.strict()`.
* If a client sends `{ "answer": "cat", "grade": "A" }`, the `grade` property is stripped by Zod before the Server Action processes the payload.

## 46. Database Constraints as Security Controls

| Table | Constraint | Security Purpose | Enforcement Layer |
| --- | --- | --- | --- |
| `exercises` | `CHECK (difficulty_level BETWEEN 1 AND 6)` | Prevents invalid application logic. | PostgreSQL |
| `sessions` | `CHECK (xp_earned >= 0)` | Prevents negative/manipulated scoring. | PostgreSQL |
| `session_exercises` | `UNIQUE(session_id, order_index)` | Prevents concurrent duplicate submissions. | PostgreSQL |
| `mastery` | `UNIQUE(student_id, concept_id)` | Prevents duplicate mastery records. | PostgreSQL |

## 47. Check Constraints

See Section 46. Enforced natively by PostgreSQL.

## 48. Uniqueness Constraints

See Section 46. Enforced natively by PostgreSQL.

## 49. Transaction Security

* Server Actions wrap `Attempt`, `Evaluation`, and `EvaluationError` insertions in a single transaction.
* **Rule:** The database transaction MUST NOT be opened until *after* the Gemini API call completes successfully, ensuring the database connection pool is not exhausted by slow AI responses.

## 50. Race-Condition Protection

* Unique constraints on `session_exercises` prevent race conditions where a double-click might spawn duplicate exercise prompts.

## 51. Idempotency Security

* As defined in `09_API_CONTRACTS.md`, `sessionExerciseId` acts as an idempotency key. The Server Action checks for an existing `attempt` for this ID before generating an AI evaluation, preventing duplicate token burns and data duplication.

## 52. Database Error Security

* PostgreSQL errors (e.g., foreign key violations, constraint failures) are caught by the Server Action and transformed into a generic `INTERNAL_ERROR`. Raw SQL error strings are NEVER sent to the browser.

## 53. Logging Security

* Logs MUST NOT contain `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, passwords, or auth tokens.
* Logs MUST NOT contain raw student answers (`submitted_answer`) or AI outputs to protect user privacy and minimize PII footprint.

## 54. Student Data Privacy

* **Read:** Only the authenticated student and the system server.
* **Write:** Only the system server.
* **AI Context:** Only the specific sentence being translated is sent to Gemini.
* **Retention:** Data is retained indefinitely until account deletion, at which point `ON DELETE CASCADE` wipes all learning history.

## 55. AI Data Boundary

* The AI operates outside the database trust boundary.
* Gemini API receives ONLY: The Marathi prompt, the student's answer string, and the target concept string.
* Gemini NEVER receives: Student IDs, Auth tokens, or entire learning histories.

## 56. Database-to-AI Data Minimization

* Database $\rightarrow$ Minimal Required Context (Strings) $\rightarrow$ AI Request.
* The database acts as the single source of truth; the AI acts merely as a stateless evaluation engine.

## 57. Supabase Storage Security

* **Supabase Storage is not required for MVP.**

## 58. Audio Storage Security

* Raw audio is processed entirely in the browser OS via the Web Speech API. Audio blobs are never uploaded, preventing massive privacy liabilities and storage costs.

## 59. Secrets Management

* Secrets are stored exclusively in Vercel Environment Variables.
* Local development uses an uncommitted `.env.local` file.

## 60. Environment File Security

* `.env.local` MUST NOT be committed to git.
* `.env.example` contains only placeholder strings (`your_anon_key_here`).
* Automated secret scanning (e.g., GitHub Advanced Security) should be enabled on the repository.

## 61. Migration Security

* All schema changes are handled via version-controlled Supabase SQL migrations (`supabase migration up`).
* Migrations must be reviewed to ensure they do not accidentally drop RLS policies or expose new tables to the `anon` role.

## 62. RLS Migration Requirements

* Every migration creating a new table MUST include:
1. `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Explicit `CREATE POLICY` statements.



## 63. Security Testing Strategy

* **Unit Tests:** Verify Zod schemas strip malicious mass-assignment payloads.
* **Integration Tests:** Verify Server Actions fail with `FORBIDDEN` if a mismatched `studentId` is provided.

## 64. Adversarial RLS Testing

* Testing must simulate the `authenticated` role and verify that `SELECT` returns 0 rows for other users' IDs, and `INSERT/UPDATE/DELETE` statements throw permission errors.

## 65. Privilege-Escalation Testing

* Verify that passing a `total_xp` integer in a session-completion payload is ignored by the server, forcing the server to derive the XP natively.

## 66. API/RLS Defense-in-Depth Testing

* A vulnerability where an API forgets to check `studentId` must be caught by RLS filtering the underlying database query. Both layers must be tested independently.

## 67. RLS Policy Review Procedure

* Verify intended table.
* Verify intended role (`authenticated`).
* Verify operation (`SELECT`).
* Verify ownership condition matches `auth.uid()`.
* Ensure no `USING (true)` exists on student-owned data.

## 68. Default-Deny Strategy

* RLS enforces Default-Deny. If a policy is not explicitly written, access is denied.

## 69. Public Data Strategy

* Curriculum data (`curriculum_stages`, `concepts`, `exercises`) is intentionally public to the `authenticated` role to allow the client application to fetch prompt metadata without hitting a bottleneck API layer. Write access remains strictly denied.

## 70. Authenticated Role Strategy

* The `authenticated` role means the user has a valid JWT, but it does NOT grant universal access. It merely allows the RLS policies to evaluate the `auth.uid()` against row ownership.

## 71. Service-Role Usage Policy

* The `service_role` key is used exclusively in `src/lib/db/admin.ts`. It is invoked only by Next.js Server Actions after validating the user's session cookie.

## 72. Server-Side Privileged Operations

The following operations are performed via Service-Role:

* Inserting `attempts`, `evaluations`, and `evaluation_errors`.
* Updating `sessions.status` and `sessions.xp_earned`.
* Upserting/Updating `mastery` records.

## 73. Privileged Operation Audit

* Why service role? To guarantee that the client cannot write false grades or bypass application logic.
* Validation: All inputs are Zod-validated before the service role is invoked.

## 74. Data Retention and Security Lifecycle

* **Retention:** Indefinite while the account is active.
* **Deletion:** Deleting the user from `auth.users` triggers a cascading delete across `students`, `sessions`, `attempts`, `evaluations`, and `mastery`.

## 75. Backup Security Considerations

* Supabase automated backups contain sensitive learning data and PII. Access to the Supabase dashboard must be strictly controlled via 2FA and strong passwords.

## 76. Incident Response Expectations

* **Credential Leak:** Immediately roll/revoke the `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in the respective provider dashboards and update Vercel.

## 77. Security Monitoring

* Monitor Supabase logs for excessive `401 Unauthorized` or `403 Forbidden` errors, which may indicate probing or a compromised client.

## 78. Rate Limiting and Abuse Protection

* Defined in `09_API_CONTRACTS.md`. APIs limit excessive evaluation requests.

## 79. Denial-of-Service Considerations

* Payload size limits are enforced by Zod (`z.string().max(1000)`) preventing massive text blobs from overwhelming Gemini or the Database.

## 80. Input Validation Security

* All database mutations rely on Zod validation at the API boundary, guaranteeing that Supabase only ever receives clean, strongly-typed data conforming to expected ENUMs and lengths.

## 81. SQL Injection Protection

* Using the `@supabase/supabase-js` client automatically parameterizes all queries.
* No raw `query()` or dynamic SQL strings are used in the application.

## 82. `search_path` Security

* Not applicable, as no `SECURITY DEFINER` functions are created.

## 83. PostgreSQL Extension Security

* No additional extensions beyond the Supabase defaults (e.g., `uuid-ossp`) are required or permitted.

## 84. Schema Exposure

* The database schema is exposed to the client via generated TypeScript types (`database.types.ts`). This is safe as it reveals structural expectations but not data. The PostgREST OpenAPI spec is accessible, but RLS protects the actual data.

## 85. API/Database Privilege Separation

* The API layer is the execution engine; the Database layer is the storage engine. They operate with distinct privileges (`Service Role` vs `Authenticated`).

## 86. Direct-Browser Supabase Security

* Browser $\rightarrow$ Supabase utilizes `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* Security relies entirely on Supabase Auth and RLS. The Anon key is treated as public routing configuration, not a secret.

## 87. Server-Side Supabase Clients

* `lib/db/server.ts` uses cookies for authenticated Server Component reads.
* `lib/db/admin.ts` uses the Service Role key for privileged Server Action mutations.

## 88. Client/Server Secret Boundary

| Credential/Resource | Browser | Server | Service-Role | Notes |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Yes | Routing only |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Yes | Identity proxy |
| `GEMINI_API_KEY` | **NO** | Yes | N/A | Strictly Server |
| `SUPABASE_SERVICE_ROLE_KEY` | **NO** | Yes | Yes | Strictly Server |

## 89. Security-Sensitive Tables Matrix

| Table | Sensitivity | Owner | RLS | Public Read | Student Write | Server Write |
| --- | --- | --- | --- | --- | --- | --- |
| `students` | High (PII) | Student | Yes | No | No | Yes |
| `evaluations` | Medium | Student | Yes | No | No | Yes |
| `mastery` | High (Logic) | Student | Yes | No | No | Yes |
| `exercises` | Low | System | Yes | Yes | No | Yes (Admin) |

## 90. Operation Authorization Matrix

| Resource | Operation | Anonymous | Authenticated Student | Server | Admin/Future |
| --- | --- | --- | --- | --- | --- |
| Curriculum | Read | No | Yes | Yes | Yes |
| Attempts | Create | No | No (API Only) | Yes | Yes |
| Mastery | Update | No | No (API Only) | Yes | Yes |

## 91. Per-Table RLS Specifications

### `students`

**Classification:** Student-Owned Data
**Sensitivity:** High (PII, Auth mapping)
**Owner Relationship:** `auth_user_id` maps to `auth.uid()`
**RLS:** Enabled
**SELECT Policy:** `auth.uid() = auth_user_id`
**INSERT Policy:** Deny
**UPDATE Policy:** Deny
**DELETE Policy:** Deny
**Immutable Fields:** `auth_user_id`
**Server-Only Fields:** `total_xp`
**Direct Browser Access:** Allowed (Read-only)
**Security Risks:** Spoofing XP. Mitigated by Deny UPDATE.
**Required Tests:** Verify student cannot select other profiles.

### `curriculum_stages` / `concepts` / `exercises`

**Classification:** Public/Read-Only Curriculum
**Sensitivity:** Low
**Owner Relationship:** None
**RLS:** Enabled
**SELECT Policy:** `true` (for `authenticated` role)
**INSERT Policy:** Deny
**UPDATE Policy:** Deny
**DELETE Policy:** Deny
**Immutable Fields:** N/A
**Server-Only Fields:** All
**Direct Browser Access:** Allowed (Read-only)
**Security Risks:** Vandalism. Mitigated by Deny Write.
**Required Tests:** Verify client cannot insert exercises.

### `sessions`

**Classification:** Student-Owned Data
**Sensitivity:** Medium
**Owner Relationship:** `student_id` maps to `students.id`
**RLS:** Enabled
**SELECT Policy:** `student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())`
**INSERT Policy:** Deny
**UPDATE Policy:** Deny
**DELETE Policy:** Deny
**Immutable Fields:** `student_id`
**Server-Only Fields:** `xp_earned`, `status`
**Direct Browser Access:** Allowed (Read-only)
**Security Risks:** Cross-student session reading. Mitigated by RLS join.
**Required Tests:** Verify IDOR isolation.

### `session_exercises`

**Classification:** Student-Owned Data
**Sensitivity:** Low
**Owner Relationship:** Via `sessions`
**RLS:** Enabled
**SELECT Policy:** `session_id IN (SELECT id FROM sessions WHERE student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()))`
**INSERT Policy:** Deny
**UPDATE Policy:** Deny
**DELETE Policy:** Deny

### `attempts`

**Classification:** Highly Sensitive Student Data
**Sensitivity:** High (Learning History)
**Owner Relationship:** Deep join to `sessions`
**RLS:** Enabled
**SELECT Policy:** Deep join to verify ownership via `session_exercises` -> `sessions`
**INSERT Policy:** Deny
**UPDATE Policy:** Deny
**DELETE Policy:** Deny
**Immutable Fields:** All fields.
**Server-Only Fields:** All mutations.

### `evaluations` / `evaluation_errors`

**Classification:** Server-Managed Data
**Sensitivity:** High (Authoritative Grades)
**Owner Relationship:** Deep join to `attempts`
**RLS:** Enabled
**SELECT Policy:** Deep join to verify ownership.
**INSERT Policy:** Deny
**UPDATE Policy:** Deny
**DELETE Policy:** Deny
**Immutable Fields:** All fields.
**Server-Only Fields:** All mutations.

### `mastery`

**Classification:** Derived/Aggregated Data
**Sensitivity:** High (Core Logic)
**Owner Relationship:** `student_id`
**RLS:** Enabled
**SELECT Policy:** `student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())`
**INSERT Policy:** Deny
**UPDATE Policy:** Deny
**DELETE Policy:** Deny
**Immutable Fields:** `student_id`, `concept_id`
**Server-Only Fields:** All mutations.

## 92. Security-Relevant Database Constraints

| Table | Constraint | Security Purpose | Enforcement Layer |
| --- | --- | --- | --- |
| `students` | `UNIQUE(auth_user_id)` | Prevents identity hijacking | PostgreSQL |
| `evaluations` | FK to `attempts` | Guarantees eval belongs to attempt | PostgreSQL |
| `mastery` | `UNIQUE(student, concept)` | Prevents duplicate mastery states | PostgreSQL |

## 93. Function Security Matrix

| Function | Caller | Execute Allowed | Security Mode | Ownership Check | Risk | Required Controls |
| --- | --- | --- | --- | --- | --- | --- |
| `handle_new_user()` | Supabase | System | Definer | N/A | Auth Spoofing | Bound strictly to auth triggers. |

## 94. Storage Security Matrix

Supabase Storage is not required for MVP.

## 95. Migration Security Matrix

| Migration Area | Security Requirement | Verification |
| --- | --- | --- |
| Table Creation | Must include `ENABLE ROW LEVEL SECURITY` | Code Review / Automated Linter |
| Policy Creation | Must explicitly define `SELECT` policy | Code Review |

## 96. Environment Security Matrix

| Variable | Public/Secret | Client/Server | Storage Location | Exposure Risk | Security Rule |
| --- | --- | --- | --- | --- | --- |
| `GEMINI_API_KEY` | Secret | Server | Vercel Env | High | Server Actions only |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server | Vercel Env | Critical | `lib/db/admin.ts` only |

## 97. Attack-Surface Inventory

| Component | Attack Surface | Sensitive Assets | Primary Threats | Primary Controls |
| --- | --- | --- | --- | --- |
| Browser | React State, Network Tab | None | Request manipulation | Zod, RLS, Auth |
| API | Next.js Server Actions | API Keys | IDOR, Mass Assignment | Zod, Session validation |
| Supabase | PostgREST Endpoints | DB Data | Unauthorized Read/Write | RLS, JWT Auth |
| Gemini | Prompt Context | Prompts | Prompt Injection | Strict System Prompts |

## 98. Threat Model

| Threat | Attack Vector | Asset | Control | Detection | Mitigation |
| --- | --- | --- | --- | --- | --- |
| **IDOR** | Modifying `sessionId` in API | Other's Sessions | Server Action validates ownership | 403 Errors | Reject request |
| **Data Vandalism** | Calling Supabase REST API | Curriculum | RLS `INSERT/UPDATE` Deny | PostgREST logs | Database enforces read-only |
| **Cheating** | Modifying API payload grade | Evaluations | API strips `grade` from input | Zod validation logs | Zod `.strict()` |
| **Key Leakage** | Exposing Service Role | Entire DB | Architectural boundary | GitHub Secret Scan | Store in Vercel Env |

## 99. Security Invariants

| ID | Security Invariant | Enforcement Layer | Verification |
| --- | --- | --- | --- |
| SEC-INV-001 | A student can never read another student's private learning data. | Supabase RLS | RLS Unit Tests |
| SEC-INV-002 | A student can never modify authoritative evaluation results. | Supabase RLS | RLS Unit Tests |
| SEC-INV-003 | A student can never modify authoritative mastery directly. | Supabase RLS | RLS Unit Tests |
| SEC-INV-004 | Service-role credentials can never reach browser code. | Next.js Architecture | Code Review / Build Checks |
| SEC-INV-005 | Historical attempts cannot be silently overwritten. | Supabase RLS | RLS Unit Tests |

## 100. Security Acceptance Criteria

| ID | Requirement | Verification Method | Pass Condition |
| --- | --- | --- | --- |
| SEC-AC-001 | Client Write Prevention | Attempt an `INSERT` via the browser Supabase client. | Request returns `401` or `403` via RLS. |
| SEC-AC-002 | IDOR Prevention | Call a Server Action with another user's `sessionExerciseId`. | Request returns `FORBIDDEN`. |
| SEC-AC-003 | Secret Isolation | Search the built `.next/static/` client bundle for `SUPABASE_SERVICE_ROLE_KEY`. | String is absent. |

## 101. Google Antigravity Implementation Rules

Google Antigravity MUST:

* Read all preceding documents before modifying Supabase.
* Treat `06_DATABASE_SCHEMA.md` as the database source of truth.
* Implement RLS on every student-owned table explicitly.
* Never disable RLS as a shortcut.
* Never expose the service-role key to the client.
* Never place service-role credentials in `NEXT_PUBLIC_*`.
* Validate all privileged operations server-side.
* Preserve historical learning records by omitting `UPDATE` and `DELETE` RLS policies.

## 102. Security Anti-Patterns

* **Prohibited:** "RLS disabled because there is only one student." (Breaks future scalability and defense-in-depth).
* **Prohibited:** "The anon key is secret." (It is public; RLS is the secret).
* **Prohibited:** "Let the client write mastery." (Client is untrusted).
* **Prohibited:** "Trust the `student_id` from the request payload." (Must trust the auth cookie).

## 103. Security Verification Checklist

| Check | Method | Expected Result | Status |
| --- | --- | --- | --- |
| RLS Enabled | `SELECT relrowsecurity FROM pg_class` | `true` for all app tables | Pending |
| API Zod strict | Code review | Payload stripped of excess keys | Pending |
| No Client Secrets | Build grep | `GEMINI_API_KEY` absent from client chunks | Pending |

## 104. Security Assumptions

* Supabase Auth correctly securely signs and validates JWTs without algorithmic downgrade vulnerabilities.
* Vercel Environment Variables are secure from unauthorized read access by third-party infrastructure.

## 105. Open Security Questions

| ID | Question | Why It Matters | Status |
| --- | --- | --- | --- |
| SEC-OQ-01 | Should we implement IP-based rate limiting on the Next.js API? | Mitigates brute force API abuse at the edge. | Open (Recommend Vercel Edge protection if public) |

## 106. Final Supabase Security Specification

This specification provides an unbreakable trust boundary. By combining Next.js Server Actions with strict, read-only Row Level Security policies, it ensures the application remains immune to client-side manipulation, IDOR, and privilege escalation, safeguarding Tejaswini's educational data against all unauthorized vectors.

## 107. Security Completion Checklist

* [x] Every table from `06_DATABASE_SCHEMA.md` is classified.
* [x] Every student-owned table has an ownership strategy and RLS.
* [x] Server-only writes are definitively identified.
* [x] Foreign-key ownership paths are secured.
* [x] Service-role access is isolated from the browser.
* [x] Direct API abuse threats are mitigated via Zod and RLS defense-in-depth.
* [x] AI data boundaries protect student privacy.
* [x] No secrets or credentials are listed in the document.