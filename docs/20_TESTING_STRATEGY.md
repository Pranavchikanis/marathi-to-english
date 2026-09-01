# 20 — Testing Strategy

## 1. Document Control

* **Document ID:** TEST-001
* **Document Name:** Tejaswini AI English Tutor - Testing Strategy
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Beginner)
* **Owner:** Principal QA Architect
* **Source of Truth:** Authoritative specification for quality assurance, test architecture, automation, and release gating.

## 2. Purpose

This document defines the comprehensive testing strategy to verify the functional, educational, security, and performance correctness of the application. It ensures that technical infrastructure is rigorously tested independently of learning outcomes.

## 3. Scope

Covers Unit, Component, Integration, API, E2E, AI Evaluation, Voice, and Security testing for the single-student MVP. Excludes load testing for millions of users (out of scope for MVP).

## 4. Source Documents and Authority

Derives from `01_PRODUCT_REQUIREMENTS.md` through `19_SECURITY_SPECIFICATION.md`. Resolves conflicts in favor of the established architectural hierarchy.

## 5. Testing Principles

1. Test behavior, not implementation details.
2. Technical failures MUST NOT equal learning failures.
3. AI outputs are probabilistic and untrusted until schema-validated.
4. Do not depend entirely on live Gemini/Voice APIs for CI/CD.
5. Never use production secrets or student data in tests.

## 6. Testing Terminology

* **Unit Test:** Isolated deterministic test of a function/class.
* **Integration Test:** Test of multiple application components or DB boundaries.
* **AI Evaluation Test:** Verification of Gemini's semantic evaluation rules against a golden dataset.
* **E2E Test:** Full browser-driven user workflow.

## 7. Quality Objectives

Ensure 0% leakage of secrets, 100% enforcement of RLS, 100% state-machine safety, and >98% accuracy of AI evaluation against the golden dataset.

## 8. Testable Requirements Inventory

All requirements mapped from PRD to actionable test vectors.

## 9. Requirements-to-Test Traceability

| Requirement ID | Source Document | Requirement | Test Level | Test Type | Test ID | Automation | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-01 | 01_PRD | Text and Voice Input | Component | Functional | COMP-001 | Yes | High |
| REQ-02 | 11_EVAL | Handle Multiple Valid Answers | AI Eval | Semantic | AI-001 | Yes | High |
| REQ-03 | 10_SEC | RLS blocks unauthorized writes | Integration | Security | SEC-001 | Yes | Critical |

## 10. Test Taxonomy

Unit, Component, Integration, API, E2E, AI Evaluation, Voice Mock, Security (RLS/Auth), Regression, and Manual Exploratory.

## 11. Test Pyramid

* **Base:** Unit & Zod Schema Tests (Fast, mocked).
* **Middle:** Integration (DB, Auth, API Routes).
* **Upper:** AI Golden Dataset Tests (Live API calls).
* **Top:** E2E Playwright Tests (Full flow).

## 12. Test-Level Selection Rules

* **Unit:** Data transformations, scoring math, mastery thresholds.
* **Integration:** Supabase queries, Next.js Server Actions.
* **E2E:** Critical path (Login $\rightarrow$ Practice $\rightarrow$ Score).
* **AI Eval:** Gemini prompt tuning and grading logic.

## 13. Test Architecture

Source Code $\rightarrow$ Unit Tests $\rightarrow$ Components $\rightarrow$ Integration Tests $\rightarrow$ External Providers (Mocked) $\rightarrow$ Complete Application $\rightarrow$ E2E Tests.

## 14. Test Environments

* **Local Development:** Local code + Local Supabase Docker.
* **Automated Test (CI):** GitHub Actions/Vercel CI + Supabase Test Project.
* **Production Verification:** Live app (Smoke tests only).

## 15. Environment Isolation

CI/CD test databases are wiped and re-seeded per run. Production keys (`GEMINI_API_KEY`) are isolated from CI pull-request runners.

## 16. Test Database Strategy

Use Supabase local development CLI. Tests run against a pristine, seeded local Postgres instance.

## 17. Test Data Lifecycle

Create $\rightarrow$ Seed $\rightarrow$ Test $\rightarrow$ Teardown $\rightarrow$ Reset.

## 18. Deterministic Fixtures

Use static JSON payloads for Gemini mocks and Database setup to eliminate test flakiness.

## 19. Seed Data

Includes a mock curriculum (Stages 1-2), test concepts, and test exercises.

## 20. Test Student Accounts

`test_student@example.com` UUID hardcoded in fixtures.

## 21. Test Sessions

Fixture sessions with states `IN_PROGRESS` and `COMPLETED`.

## 22. Test Exercises

Curated subset covering all difficulty levels (1-6).

## 23. Test Attempts

Fixtures covering text modality and voice modality.

## 24. Test Evaluations

Fixtures covering Grades A through F.

## 25. Test Scores

Fixtures covering 10, 5, and 1 XP boundaries.

## 26. Test Progress

Fixtures demonstrating Stage threshold crossings (80%).

## 27. Test Mastery

Fixtures showing `INTRODUCED`, `DEVELOPING`, `PROFICIENT`.

## 28. Test Adaptive-Learning States

Fixtures triggering `REMEDIATE` and `REVIEW`.

## 29. Test Audio Fixtures

N/A (Web Speech API is mocked; raw audio files are not utilized).

## 30. Test Transcripts

String fixtures representing perfect speech and corrupted speech.

## 31. Test AI Responses

JSON files exactly matching `AiEvaluationSchema`.

## 32. Test Provider Responses

Mocked GoogleGenAI `GenerateContentResponse` objects.

## 33. Test Error Responses

Mocked 503, 429, and JSON parse errors.

## 34. Test Security Identities

`anon`, `authenticated`, and `service_role` test clients.

## 35. Test Data Isolation

Tests use isolated UUIDs. Database resets after integration suites.

## 36. Test Cleanup Strategy

BeforeAll/AfterAll hooks reset the Supabase local DB state.

## 37. Test Naming Conventions

`[feature].test.ts` for unit/integration. `[feature].spec.ts` for E2E.

## 38. Test ID Conventions

UNIT-XXX, COMP-XXX, INT-XXX, E2E-XXX, AI-XXX, SEC-XXX.

## 39. Test File Organization

Adheres to `07_CODEBASE_STRUCTURE.md`. Co-located unit tests, centralized E2E and integration tests.

## 40. Test Directory Architecture

`src/features/*/tests`, `tests/e2e/`, `tests/integration/`, `tests/fixtures/`.

## 41. Test Fixture Architecture

`tests/fixtures/ai/`, `tests/fixtures/db/`.

## 42. Test Utility Architecture

`tests/utils/` for custom renderers and auth mock wrappers.

## 43. Test Helper Boundaries

Test helpers must not contain business logic; they only scaffold state.

## 44. Mocking Strategy

Mock network boundaries. Do not mock internal application services unless isolating complex dependencies.

## 45. Stubbing Strategy

Stub date/time for mastery decay tests.

## 46. Fake Provider Strategy

Use MSW (Mock Service Worker) or Jest/Vitest mocks for Gemini HTTP calls in unit tests.

## 47. Gemini Mocking Strategy

Mock the `@google/genai` client to return deterministic JSON strings matching the test scenario.

## 48. Voice Provider Mocking Strategy

Mock `window.SpeechRecognition` to simulate `onresult` and `onerror` events.

## 49. Database Mocking Strategy

Do not mock the database for integration tests; use a real local Postgres instance to ensure RLS executes.

## 50. Supabase Test Strategy

Initialize `@supabase/supabase-js` with local test credentials.

## 51. What Must Not Be Mocked

Zod schemas, Application Services (during integration tests), and RLS policies.

## 52. Contract Testing

Ensure API schemas match UI expectations and AI schemas match Gemini output.

## 53. API Contract Tests

Invoke Server Actions with Zod-validated test payloads.

## 54. Database Tests

Verify constraints (e.g., negative XP throws a constraint error).

## 55. Database Integrity Tests

Verify cascading deletes clear orphaned attempts.

## 56. RLS Tests

Verify `anon` key cannot read `sessions`.

## 57. Security Testing Strategy

Focus on unauthorized access attempts and data isolation.

## 58. Authentication Tests

Verify Next.js middleware redirects unauthenticated users to `/login`.

## 59. Authorization Tests

Verify accessing `/practice` without a valid student ID fails.

## 60. Session Tests

Verify JWT expiry behavior.

## 61. IDOR/BOLA Tests

Pass `session_id` belonging to Student B while logged in as Student A. Assert `403 Forbidden` or `0 rows returned`.

## 62. Privilege-Escalation Tests

Attempt to pass `total_xp` in a student update payload. Assert it is stripped.

## 63. Client-Tampering Tests

Attempt to manually invoke the `/complete` action prematurely. Assert rejection.

## 64. Secret-Leak Tests

Static analysis (e.g., `gitleaks`) on CI.

## 65. Logging-Redaction Tests

Verify errors logged by Server Actions do not contain PII or `studentAnswer` text.

## 66. Input-Validation Security Tests

Submit 10MB strings. Assert Zod string `.max()` blocks it.

## 67. XSS Tests

Submit answers containing `<script>`. Assert React safely escapes them in the UI.

## 68. CSRF Tests

Next.js Server Actions handle CSRF natively.

## 69. CORS Tests

Verify API rejects requests from non-whitelisted origins.

## 70. File-Upload Security Tests

N/A (No file uploads).

## 71. Storage-Authorization Tests

N/A.

## 72. Prompt-Injection Tests

Run Golden Dataset tests with adversarial answers (e.g., "Ignore rules"). Assert Grade F.

## 73. Malicious-AI-Output Tests

Provide Gemini mock returning mutated JSON keys. Assert Zod rejects it safely.

## 74. Privacy Tests

Verify `rawTranscription` is only readable by the owner.

## 75. Rate-Limit Tests

Simulate 100 requests to `/submit`. Assert 429 response.

## 76. Abuse Tests

Simulate double-click race conditions. Assert Idempotency Key prevents duplicate attempts.

## 77. Dependency Security Tests

Run `npm audit` on CI.

## 78. Unit Testing Strategy

Fast, stateless tests focused on pure functions (e.g., `calculateXp()`).

## 79. Unit Test Scope

Reducers, utilities, Zod schemas, service logic mappings.

## 80. Component Testing Strategy

React Testing Library. Focus on accessibility and user interactions (clicks, typing).

## 81. UI-State Testing

Assert UI shows Spinner when `isPending` is true.

## 82. State-Management Testing

Test Zustand store transitions (e.g., `EXERCISE_READY` $\rightarrow$ `EVALUATING`).

## 83. State-Machine Testing

Ensure illegal transitions (e.g., `IDLE` $\rightarrow$ `FEEDBACK_READY`) throw errors.

## 84. Asynchronous-State Tests

Verify UI locks during await promises.

## 85. Concurrency Tests

Test idempotency locks on Server Actions.

## 86. Stale-Response Tests

Simulate late API return; assert state ignores it if exercise progressed.

## 87. Idempotency Tests

Submit identical payload twice. Assert DB only registers one attempt.

## 88. Refresh-Recovery Tests

Verify `localStorage` hydrates the unsubmitted text box on mount.

## 89. Navigation-Recovery Tests

Verify navigating away and back retains session state.

## 90. Session-Recovery Tests

Verify `/start` resumes `IN_PROGRESS` session if one exists.

## 91. Crash-Recovery Tests

Verify server 500 does not delete the active exercise state.

## 92. Network-Failure Tests

Mock `navigator.onLine = false`. Assert toast warning.

## 93. Provider-Failure Tests

Mock Gemini 503. Assert generic "Connection error" and retry ability.

## 94. Database-Failure Tests

Mock Supabase disconnect. Assert graceful fallback.

## 95. Partial-Failure Tests

Mock DB failure *after* AI eval succeeds. Assert transaction rolls back safely.

## 96. Recovery Verification

Assert that after recovery, the student can submit the exact same answer successfully.

## 97. Error-Handling Tests

Assert standard `ActionError` envelope is always returned.

## 98. Error-Message Tests

Assert no technical details leak into `message` fields.

## 99. Technical-vs-Learning-Failure Tests

Assert Gemini 500 does not increment `incorrect_attempts` in Mastery.

## 100. Evaluation Testing Strategy

Use Golden Dataset to ensure AI prompt adheres to `11_EVALUATION_SPECIFICATION.md`.

## 101. Evaluation Test Cases

Cover semantic matches, grammatical errors, spelling errors, gibberish.

## 102. Evaluation Fixtures

Curated JSON arrays of inputs and expected outputs.

## 103. Evaluation Golden Cases

(See `11_EVALUATION_SPECIFICATION.md` Section 97).

## 104. Evaluation Boundary Tests

Test responses right on the line between Grade C (Minor) and D (Major).

## 105. Scoring Testing Strategy

Verify `15_SCORING_AND_PROGRESS.md` rules.

## 106. Score Test Cases

Grade A $\rightarrow$ 10 XP, Grade C $\rightarrow$ 5 XP, Grade F $\rightarrow$ 1 XP.

## 107. Score Integrity Tests

Verify total XP equals the sum of session XP.

## 108. Progress Testing Strategy

Verify Stage progression logic.

## 109. Progress Integrity Tests

Verify Stage advances strictly when 80% concepts are `PROFICIENT`.

## 110. Mastery Testing Strategy

Verify net correct thresholds.

## 111. Mastery Integrity Tests

Verify 3 consecutive correct attempts moves state from `INTRODUCED` to `DEVELOPING`.

## 112. Adaptive-Learning Testing Strategy

Verify deterministic exercise selection rules from `14_ADAPTIVE_LEARNING.md`.

## 113. Adaptive-Learning Test Cases

3 consecutive errors $\rightarrow$ Triggers `REMEDIATE` flag $\rightarrow$ Drops difficulty to 1.

## 114. Daily-Plan Tests

Verify streaks calculate correctly based on IST midnight.

## 115. Session Tests

Verify completing 10/10 exercises triggers `/complete`.

## 116. Exercise Tests

Verify difficulty levels match.

## 117. Attempt Tests

Verify `wasEdited` boolean accurately tracks STT modifications.

## 118. Answer-Submission Tests

Verify empty strings are blocked.

## 119. Conversation Tests

N/A.

## 120. AI Interaction Tests

Verify Server Actions orchestrate Gemini correctly.

## 121. Gemini Integration Testing

Test adapter mapping.

## 122. Mocked Gemini Tests

Standard CI tests using JSON stubs.

## 123. Live Gemini Integration Tests

Nightly tests running the Golden Dataset against the real API.

## 124. Gemini Test Fixtures

Stubs for `AiEvaluationSchema`.

## 125. AI Output Validation Tests

Pass missing fields to Zod. Assert rejection.

## 126. AI Prompt Tests

Verify context interpolation.

## 127. Prompt Regression Tests

Track accuracy % of Golden Dataset over time.

## 128. AI Determinism Strategy

Set `temperature = 0`. Assert identical outputs for identical inputs in tests.

## 129. AI Semantic Evaluation

Verify "I need to go" and "I must go" both yield Grade A.

## 130. AI Golden Dataset

Maintained in `tests/fixtures/golden_evaluations.json`.

## 131. AI Evaluation Metrics

Accuracy (Target > 98%), False Positives, False Negatives.

## 132. AI Regression Testing

Fail CI if Golden Accuracy drops below 95%.

## 133. AI Model/Configuration Changes

Require manual review of Golden Dataset deltas before merging model bumps.

## 134. AI Test Thresholds

> 98% accuracy on Golden Dataset.

## 135. AI Test Failure Policy

Block release if regression criteria unmet.

## 136. Voice Testing Strategy

Verify browser API interactions and graceful degradation.

## 137. Microphone Tests

Mock `getUserMedia` denial. Assert fallback UI.

## 138. Recording Tests

Mock `onstart` and `onend`.

## 139. Audio Upload Tests

N/A.

## 140. Audio-Format Tests

N/A.

## 141. Audio-Size Tests

N/A.

## 142. Transcription Tests

Mock `onresult` returning "hello world". Assert it appears in textarea.

## 143. Transcription-Quality Evaluation

N/A (OS dependent).

## 144. Transcription-Artifact Isolation

Assert unedited transcript is treated as typed text for grading.

## 145. TTS Tests

Mock `speechSynthesis.speak()`.

## 146. Playback Tests

Assert Play button toggles icon state.

## 147. Autoplay Tests

N/A.

## 148. Audio Cleanup Tests

Assert transcript state clears on next exercise.

## 149. Voice Recovery Tests

Assert disconnecting mic midway recovers to text.

## 150. Voice Fallback Tests

Ensure text input is completely functional without voice.

## 151. Voice Learning-Impact Tests

Assert Modality = VOICE yields standard XP.

## 152. Accessibility Testing Strategy

Run `axe-core` and manual screen reader tests.

## 153. Keyboard Testing

Tab navigation through entire practice loop.

## 154. Focus Management Testing

Focus moves to input box on new exercise.

## 155. Screen-Reader Testing

`aria-live` announces evaluation feedback.

## 156. Form Accessibility Testing

Input has accessible label.

## 157. Error-Announcement Testing

Errors are announced to screen readers.

## 158. Loading-State Accessibility Testing

Loading spinners have appropriate aria-labels.

## 159. Responsive Testing

Playwright runs on Mobile Safari and Desktop Chrome viewports.

## 160. Browser Compatibility Testing

Chromium, WebKit, Gecko.

## 161. Mobile/Responsive Behavior

Assert chat input anchors to bottom of screen.

## 162. Performance Testing Strategy

Lighthouse metrics.

## 163. Performance Metrics

FCP < 1.5s, TTI < 2s.

## 164. Performance Budgets

Bundle size < 200kb.

## 165. Frontend Performance Tests

Lighthouse CI.

## 166. Backend Performance Tests

Server Action execution time < 500ms (excluding AI).

## 167. API Performance Tests

N/A.

## 168. Database Performance Tests

Query plans for session loading.

## 169. AI Latency Tests

Track average Gemini turnaround time in live tests.

## 170. Voice Latency Tests

N/A.

## 171. Resource-Usage Tests

N/A.

## 172. Memory-Leak Tests

N/A.

## 173. Large-Payload Tests

Assert 10,000 char string is rejected immediately.

## 174. Audio-Memory Tests

N/A.

## 175. Long-Session Tests

Simulate 50 exercises to ensure no UI slowdown.

## 176. Endurance Testing

N/A.

## 177. Reliability Testing

E2E tests with intermittent network dropouts.

## 178. Resilience Testing

Same as 177.

## 179. Failure-Injection Testing

MSW simulating 500s.

## 180. Chaos-Testing Scope

Out of scope for MVP.

## 181. Data-Integrity Testing

Verify Constraints and FKs.

## 182. Transaction Tests

Mock failing the 3rd insert in a transaction; assert 0 rows inserted.

## 183. Rollback Tests

Same as 182.

## 184. Reconciliation Tests

Assert `total_xp` exactly matches `SUM(session_xp)`.

## 185. Backup/Recovery Tests

N/A.

## 186. Privacy Testing

Assert no audio is uploaded.

## 187. Secret-Management Tests

Assert `process.env.GEMINI_API_KEY` is defined in server context.

## 188. Environment-Security Tests

Assert build fails if required secrets are missing.

## 189. Deployment Testing

Vercel preview deployments.

## 190. Smoke Testing

Playwright test: Login, Load Dashboard, Load Session.

## 191. Sanity Testing

Same as 190.

## 192. Regression Testing

Run full suite on PR.

## 193. Release Candidate Testing

Manual UX verification.

## 194. Production Verification

Run smoke tests against production URL.

## 195. Rollback Testing

Verify previous Vercel deployment works.

## 196. Test Failure Severity

Blocker: Build fails, E2E fails.

## 197. Defect Classification

Bug, Feature, Chore.

## 198. Defect Lifecycle

New $\rightarrow$ Triaged $\rightarrow$ In Progress $\rightarrow$ Fixed $\rightarrow$ Verified.

## 199. Defect Priority

P0 (Blocker) to P3 (Minor).

## 200. Defect Evidence

Playwright trace viewers / screenshots.

## 201. Bug-Report Requirements

Steps, Expected, Actual, Logs.

## 202. Flaky-Test Policy

Quarantine, investigate, fix. Do not permanently ignore.

## 203. Flaky-Test Detection

Playwright auto-retry flags.

## 204. Flaky-Test Quarantine

Move to `.skip` with a JIRA ticket.

## 205. Flaky-Test Remediation

Fix race conditions (e.g., waiting for specific DOM elements).

## 206. Test Stability Requirements

Pass 10x consecutively locally.

## 207. Test Execution Order

Independent tests only. No order reliance.

## 208. Test Parallelization

Vitest runs unit tests in parallel.

## 209. Test Isolation

DB wipes between Integration test suites.

## 210. Deterministic Execution

Mock dates and random numbers.

## 211. Test Timeouts

5s for Unit, 30s for E2E.

## 212. Test Retry Policy

Playwright retries 1x on CI.

## 213. Test Artifact Retention

Playwright traces kept for 14 days on CI.

## 214. Failure Artifacts

Screenshots on E2E failure.

## 215. CI Test Stages

Lint $\rightarrow$ Unit $\rightarrow$ Integration $\rightarrow$ E2E.

## 216. Commit-Level Tests

Lint, Typecheck, Unit.

## 217. Pull-Request Tests

Full automated suite.

## 218. Pre-Merge Tests

Requires CI Green.

## 219. Pre-Deployment Tests

Vercel Preview Build.

## 220. Post-Deployment Tests

Smoke Tests.

## 221. Scheduled Tests

Nightly Golden Dataset run.

## 222. Live-Provider Test Frequency

Nightly only.

## 223. Deep/Nightly Test Suites

Full Golden Dataset regression.

## 224. Manual Testing Strategy

Used for nuanced UX and Voice API testing on real mobile devices.

## 225. Exploratory Testing

Test edge cases on iOS Safari and Android Chrome.

## 226. Manual Learning-Session Testing

Complete one 10-question session manually before major releases.

## 227. Manual Voice Testing

Speak with background noise on a real device.

## 228. Manual Recovery Testing

Turn off Wi-Fi on phone mid-session.

## 229. Manual Accessibility Testing

VoiceOver/TalkBack testing.

## 230. Manual Browser Testing

Safari, Chrome, Firefox.

## 231. Manual AI-Quality Review

Reviewing the explanations for beginner-friendliness.

## 232. Manual Security Review

Check headers and payload sizes in dev tools.

## 233. Manual Release Checklist

Smoke test, Voice test, Env var check.

## 234. User Acceptance Testing

Tejaswini completes a session.

## 235. UAT Scenarios

First-time login, Mic permission, Review, Complete.

## 236. Learning-Quality Review

Ensure pacing feels right.

## 237. Educational Correctness

Verify corrections teach the actual rule violated.

## 238. Test Coverage Strategy

Focus on critical paths, not 100% arbitrary line coverage.

## 239. Code Coverage

Target: 80% logic, 100% state machines.

## 240. Branch Coverage

Target: 80%.

## 241. State-Transition Coverage

Target: 100% of defined state machines.

## 242. Failure-Path Coverage

Target: 100% of mapped error boundaries.

## 243. Security-Control Coverage

Target: 100% of RLS policies.

## 244. Learning-Flow Coverage

Target: 100% of E2E paths.

## 245. AI Scenario Coverage

All A-F categories tested.

## 246. Voice Scenario Coverage

Allowed/Denied permissions tested.

## 247. Test Traceability

Map tests to Document IDs via comments.

## 248. Risk-Based Testing

Focus heavily on Server Actions and RLS.

## 249. Risk Matrix

See `19_SECURITY_SPECIFICATION.md`.

## 250. Critical-Path Tests

Login $\rightarrow$ Practice $\rightarrow$ Submit $\rightarrow$ Complete.

## 251. Critical-Data Tests

Mastery calculation.

## 252. Critical-State Tests

`session_exercises` integrity.

## 253. Critical-Security Tests

RLS Isolation.

## 254. Critical-Learning Tests

Adaptive difficulty triggers.

## 255. Release Gates

### [RELEASE_GATE]

**Gate ID:** GATE-01
**Gate:** AI Evaluation Integrity
**Required Tests:** Golden Dataset
**Pass Criteria:** > 98% accuracy
**Failure Criteria:** < 98% accuracy or any false-negative on Grade A.
**Release Impact:** Hard Blocker.

## 256. Release-Blocking Failures

Security failures, E2E failures, AI Regressions.

## 257. Acceptable Known Issues

Minor UI layout shifts on extremely small legacy mobile devices.

## 258. Release Exceptions

Approved by Architect.

## 259. Test Sign-Off

Automated by CI passing.

## 260. Quality Gates by Phase

Lint $\rightarrow$ Unit $\rightarrow$ E2E $\rightarrow$ Golden.

## 261. MVP Testing Scope

REQUIRED: Unit, Integration, E2E, Golden AI, RLS.

## 262. Future Testing Enhancements

Load testing.

## 263. Test Maintenance

Update snapshots and Golden Dataset as curriculum evolves.

## 264. Test Ownership

Engineering team.

## 265. Test Review

Required on all PRs.

## 266. Test Documentation Maintenance

Kept in `docs/`.

## 267. Fixture Maintenance

Ensure DB seeds match current schemas.

## 268. AI Golden-Dataset Maintenance

Add new edge cases discovered in production to the Golden Dataset.

## 269. Browser-Matrix Maintenance

Update Playwright browser targets annually.

## 270. Security-Test Maintenance

Update if new tables are added.

## 271. Regression-Suite Maintenance

Add tests for any resolved production bugs.

## 272. Test Deprecation

Remove tests for deprecated features.

## 273. Obsolete-Test Removal

Same as 272.

## 274. Test Versioning

Follows app versioning.

## 275. Model-Version Testing

Run Golden Dataset if `gemini-1.5-flash` model string is updated.

## 276. Dependency-Version Testing

CI catches breaks on `npm update`.

## 277. Schema-Version Testing

Zod schema changes require unit test updates.

## 278. API-Version Testing

N/A.

## 279. Migration Testing

Test Supabase `migration up` on empty DB in CI.

## 280. Deployment Rollback Testing

Verify Vercel rollback mechanisms.

## 281. Production-Incident Regression Testing

Add test covering the incident root cause.

## 282. Post-Incident Testing

Verify fix.

## 283. Test-Driven Bug Prevention

Write failing test $\rightarrow$ Fix code $\rightarrow$ Test passes.

## 284. Quality Metrics

Pass rate, coverage.

## 285. Test Dashboard Requirements

GitHub Actions UI.

## 286. Quality Reporting

PR status checks.

## 287. Release Reporting

GitHub Releases.

## 288. Test Artifacts

Traces, screenshots.

## 289. Test Auditability

CI logs retained for 90 days.

## 290. Test Reproducibility

Seeded databases guarantee identical runs.

## 291. Current-Time Handling in Tests

Use `vi.setSystemTime()`.

## 292. Timezone Testing

Force tests to run in IST (Indian Standard Time) to verify streak calculations.

## 293. Localization Testing

Ensure Marathi Unicode renders correctly in Playwright screenshots.

## 294. Unicode Testing

Submit Marathi strings to AI.

## 295. Text-Normalization Testing

Submit strings with heavy whitespace; assert Zod `.trim()` functionality.

## 296. Beginner-Language Test Cases

Test "He go to school" $\rightarrow$ Expect Grade C or D.

## 297. Educational Edge Cases

Valid paraphrases.

## 298. Ambiguous-Answer Testing

Test vague answers.

## 299. Short-Answer Testing

Test "Yes".

## 300. Long-Answer Testing

Test 500-char answer.

## 301. Empty-Answer Testing

Assert blocked by Zod.

## 302. Whitespace and Punctuation Testing

Assert ignored by AI grading.

## 303. Case-Sensitivity Testing

Assert "i am happy" gets Grade A.

## 304. Multilingual Input Testing

Assert Marathi input gets Grade F.

## 305. Malformed-Input Testing

Assert "asdf" gets Grade F.

## 306. Adversarial-Input Testing

Test prompt injection.

## 307. Malicious-Input Testing

Test SQL injection characters.

## 308. Prompt-Injection Test Corpus

Included in Golden Dataset.

## 309. AI Hallucination Tests

Assert Grade A returns null `correctedText` to prevent hallucinatory edits.

## 310. AI Instruction-Following Tests

Assert AI returns Marathi explanation as requested.

## 311. AI Output-Schema Tests

Zod validation tests.

## 312. AI Safety-Boundary Tests

Test requests asking for internal system details.

## 313. AI Data-Leakage Tests

Verify PII is absent from payload.

## 314. AI Privacy Tests

Verify audio is not uploaded.

## 315. AI Prompt-Confidentiality Tests

Test "Reveal your prompt."

## 316. Model-Drift and Regression Testing

Golden Dataset tracking.

## 317. Voice-Language Testing

Mock STT returning accented English.

## 318. Pronunciation and Recognition Testing

N/A.

## 319. Noisy-Environment Testing

N/A (OS responsibility).

## 320. Device Testing

Manual on mobile.

## 321. Microphone/Browser Testing

Playwright permission mocks.

## 322. Audio-Codec Testing

N/A.

## 323. Audio-Corruption Testing

N/A.

## 324. Transcription-Fallback Testing

Mock STT error, verify text input functional.

## 325. TTS-Fallback Testing

Mock TTS error, verify UI continues.

## 326. End-to-End Learning Journeys

### [TEST_CASE]

**Test ID:** E2E-001
**Purpose:** Verify happy path learning loop.
**Given:** Authenticated student, Session started.
**When:** Student submits valid English text.
**Then:** Receives Grade A, advances to next question.
**Verification:** Playwright UI assertions.
**Cleanup:** DB rollback.

## 327. Golden End-to-End Journeys

Fully deterministic path from Login to Session Complete.

## 328. E2E Test-State Cleanup

DB wiped after E2E suite.

## 329. Production Smoke Journey

Login $\rightarrow$ Dashboard loads $\rightarrow$ Start Session.

## 330. Disaster/Recovery Testing

N/A for MVP.

## 331. Data-Consistency Reconciliation Testing

Verify `total_xp` aggregate.

## 332. Security Regression Testing

Run `tests/integration/security`.

## 333. AI Regression After Prompt Changes

Run Golden Dataset.

## 334. Voice Regression After Configuration Changes

Run Voice unit tests.

## 335. Database Regression After Schema Changes

Run migrations against empty test DB.

## 336. State Regression After State Changes

Run Zustand unit tests.

## 337. API Regression After Contract Changes

Run Zod schema unit tests.

## 338. Test Impact Analysis

Run affected tests via Vitest watch mode.

## 339. Documentation-to-Test Synchronization

Ensure test names reference Document IDs.

## 340. Test Change Control

PR review required for changing test assertions.

## 341. Final Testing Architecture

Zod/Vitest (Unit) $\rightarrow$ Vitest/SupabaseLocal (Integration) $\rightarrow$ Node/GeminiLive (Golden) $\rightarrow$ Playwright (E2E).

## 342. Testing Responsibilities by Layer

| Layer | Test Responsibility | Test Type | Owner | Frequency |
| --- | --- | --- | --- | --- |
| Domain | Business Rules | Unit | Dev | Every Commit |
| Server Action | DB/AI Integration | Integration | Dev | Every PR |
| UI Flow | User Journey | E2E | QA/Dev | Pre-merge |

## 343. Final Testing Matrix

| Requirement Area | Unit | Component | Integration | API | E2E | Manual | AI Eval | Security |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Evaluation | Yes | No | Yes | Yes | Yes | No | Yes | No |
| Voice STT | Yes (Mock) | Yes | No | No | Yes | Yes | No | No |

## 344. Final Risk Matrix

| Risk ID | Risk | Likelihood | Impact | Priority | Test Strategy |
| --- | --- | --- | --- | --- | --- |
| RSK-01 | Hallucinated JSON | Low | High | P0 | Zod parsing integration tests. |

## 345. Final Requirements Traceability Matrix

All `REQ` items traced to `TEST_ID`s in Section 9.

## 346. Final Release-Gate Matrix

| Gate ID | Gate | Required Tests | Pass Criteria |
| --- | --- | --- | --- |
| GATE-01 | AI Accuracy | Golden Dataset | > 98% Match |
| GATE-02 | Core Loop | E2E | 100% Pass |

## 347. Final Test-Data Matrix

Static seed files in `tests/fixtures/db`.

## 348. Final Environment Matrix

Local, CI, Production.

## 349. Final Automation Matrix

| Test Suite | Automated? | Trigger | Environment | External Provider | Runtime Priority |
| --- | --- | --- | --- | --- | --- |
| Unit/Zod | Yes | On Commit | Local / CI | None | High |
| Golden AI | Yes | Pre-Merge | CI | Gemini API | High |

## 350. Final Failure-Testing Matrix

| Failure | Detection | Test Type | Expected Error | Expected State | Expected Learning Impact |
| --- | --- | --- | --- | --- | --- |
| AI 503 | Adapter | Integration | `PROVIDER_ERROR` | `EXERCISE_READY` | None |

## 351. Final AI-Testing Matrix

| AI Scenario | Fixture | Expected Properties | Validation | Regression Method |
| --- | --- | --- | --- | --- |
| Meaning Error | `wrong_tense.json` | Grade E, Tense Error | Zod Parse | Golden Dataset |

## 352. Final Voice-Testing Matrix

| Voice Scenario | Input | Expected Behavior | Failure Behavior | Learning Impact |
| --- | --- | --- | --- | --- |
| Mic Denied | `NotAllowedError` | Revert to text | Graceful UI | None |

## 353. Final Security-Testing Matrix

| Security Control | Threat | Test | Expected Result | Release Blocking? |
| --- | --- | --- | --- | --- |
| RLS | IDOR | Cross-student read | `0 rows` | Yes |

## 354. Final Accessibility-Testing Matrix

Axe-core automated scans in Playwright.

## 355. Final Performance-Testing Matrix

Lighthouse scores on Vercel preview URLs.

## 356. Final Browser-Testing Matrix

Playwright configs for Chromium, WebKit, Mobile Safari.

## 357. Final Data-Integrity Matrix

Integration tests verifying Foreign Key constraints.

## 358. Final State-Transition Coverage Matrix

Vitest tests asserting exhaustive switch cases.

## 359. Testing Acceptance Criteria

### [TEST_REQUIREMENT]

**Test ID:** TEST-AC-001
**Requirement:** Test suite prevents regressions in AI evaluation logic.
**Source:** `11_EVALUATION_SPECIFICATION.md`
**Risk:** Model drift causes incorrect grading.
**Test Level:** AI Evaluation
**Test Type:** Automated Regression
**Test Scenario:** Pass Golden Dataset to Gemini API.
**Expected Result:** Exact match on A-F grades.
**Automation:** Yes
**Release Blocking:** Yes

## 360. Testing Invariants

* TEST-INV-001: Every critical product requirement has at least one corresponding test.
* TEST-INV-002: Every critical state transition has automated coverage.
* TEST-INV-003: Every critical security boundary has negative tests.
* TEST-INV-004: Technical failures are tested separately from learning failures.
* TEST-INV-005: AI provider failures are tested without relying exclusively on live Gemini.

## 361. Testing Anti-Patterns

* **Prohibited:** Testing only the happy path.
* **Prohibited:** Relying exclusively on live Gemini calls for unit tests.
* **Prohibited:** Using production credentials in tests.
* **Prohibited:** Treating AI plausibility as correctness without schema validation.

## 362. Final Consistency Audit

The testing strategy aligns with the source of truth, enforcing rigid tests for the deterministic app boundaries and golden dataset tests for the non-deterministic AI boundaries.

## 363. Testing Decisions

* **Decision:** Run Gemini live tests only on pre-merge/nightly CI to avoid exhausting API quotas or slowing down local dev loops.

## 364. Assumptions

* GitHub Actions / Vercel CI environment supports running local Supabase Docker instances for integration testing.

## 365. Open Questions

* None.

## 366. Residual Quality Risks

* Zero-day browser updates breaking the Web Speech API; mitigated by fast manual exploratory testing on major OS releases.

## 367. Final Testing Specification

This strategy guarantees a production-ready application where infrastructure is robust, data is secure, and AI evaluations remain pedagogically sound and reliable.

## 368. Testing Completion Checklist

* [x] Test Pyramids and Environments defined.
* [x] AI Golden Dataset methodology established.
* [x] Security and RLS negative testing mandated.
* [x] Voice fallback testing defined.
* [x] No secrets or production data allowed in tests.