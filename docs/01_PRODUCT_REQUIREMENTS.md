# 01 — Product Requirements Document

## 1. Document Control

* **Document ID:** PRD-001
* **Document Name:** Tejaswini AI English Tutor - Product Requirements Document
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Single-User Instance)
* **Platform:** Web Application (Mobile-First Responsive)
* **Owner:** Senior Product Manager / AI Application Architect
* **Source of Truth:** This PRD constitutes the authoritative baseline for all product requirements. Technical architecture and implementation decisions must align with this document.

## 2. Executive Summary

This project delivers a private, web-based, AI-powered English learning application explicitly designed for a single beginner student, Tejaswini. The product acts as a patient, bilingual tutor that uses Marathi as a bridge language to teach practical English. Through a conversational chat-style interface, the AI provides translation exercises, accepts text or voice responses, evaluates semantic and grammatical correctness, and offers beginner-friendly corrections in Marathi. The MVP prioritizes core translation loops, voice input with editable transcriptions, and foundational progress tracking while intentionally excluding complex gamification, multi-user support, and pronunciation scoring.

## 3. Product Vision

To provide Tejaswini with a completely frictionless, non-judgmental, and highly adaptive learning environment that bridges the gap between her native Marathi thoughts and fluent English expression, empowering her to practice daily without fear of making mistakes.

## 4. Product Purpose

The application solves the specific problem of practicing English translation and conversational sentence construction for a beginner. Instead of relying on rigid, pre-programmed quizzes, the product leverages Generative AI to provide dynamic exercises, understand nuanced and varied English responses, and provide contextual, native-language explanations for grammatical errors.

## 5. Target User

* **Name:** Tejaswini
* **English Proficiency:** Beginner
* **Native Language:** Marathi
* **User Context:** Requires simple, structured progression; needs clear explanations for mistakes without being overwhelmed by academic grammatical terminology; benefits from voice interaction to practice speaking without anxiety.
* **Scale:** Exactly 1 user (Single-tenant architecture).

## 6. Problem Statement

Beginner English learners often struggle to transition from vocabulary memorization to active sentence construction. Traditional apps rely on strict exact-string matching, incorrectly penalizing valid alternative translations. Furthermore, beginners face high cognitive load when explanations are provided entirely in English. Tejaswini needs an application that understands the Marathi context, accepts multiple valid English expressions, handles voice input without penalizing for technical speech-recognition errors, and explains mistakes in conversational Marathi.

## 7. Product Goals

* **Primary Goal 1:** Improve Tejaswini's Marathi-to-English translation ability and sentence construction.
* **Primary Goal 2:** Build practical English vocabulary and beginner grammar mastery.
* **Primary Goal 3:** Provide consistent, daily translation practice through a low-friction interface.
* **Primary Goal 4:** Enable anxiety-free voice practice by safely separating English language errors from technical transcription errors.
* **Secondary Goal:** Track and identify recurring mistakes to help the AI focus on specific weaknesses.

## 8. Non-Goals

* Building a general-purpose AI chatbot or virtual assistant.
* Providing advanced pronunciation or accent coaching (Excluded from MVP).
* Supporting multiple students, teachers, or administrative dashboards.
* Building a comprehensive English certification or testing system.
* Replacing human interaction entirely (the app is a supplementary practice tool).
* Implementing advanced gamification (e.g., global leaderboards, complex badge systems).

## 9. Core Learning Experience

The learning experience is structured as a supportive dialogue. The AI embodies the persona of a patient, encouraging tutor from Maharashtra. It never shames the student for mistakes. Explanations are concise, conversational, and delivered in Marathi to reduce cognitive load. The difficulty progresses iteratively, ensuring Tejaswini masters basic concepts before encountering complex structures.

## 10. Core User Journey

1. **First Visit / Login:** Tejaswini opens the web app and is securely authenticated.
2. **Dashboard:** She views her current progress, streak, and a "Start Practice" button.
3. **Practice Session:** The AI greets her in Marathi and provides the first exercise.
4. **Translation:** Tejaswini thinks of the English translation and submits it via text or voice.
5. **Feedback:** The AI instantly evaluates the answer, highlights any errors, provides the corrected sentence, and explains the grammar rule in Marathi.
6. **Continuation:** She reviews the feedback and clicks "Next" to continue.
7. **Session Completion:** After 10-15 exercises, a summary screen celebrates her effort and updates her progress.

## 11. Core Learning Loop

1. **AI Prompt:** AI presents a Marathi sentence or conversational situation.
2. **Student Response:** Tejaswini translates it into English.
3. **Voice Option:** If using voice, she speaks. The browser transcribes the speech.
4. **Transcription Review:** She reviews the transcribed text and manually corrects any AI mishearings before submission.
5. **AI Evaluation:** The AI engine evaluates semantic equivalence, grammar, and naturalness.
6. **Feedback Delivery:** The app displays correct/incorrect status, error categorization, and teaching notes.
7. **Next Step:** The AI logs the performance to adapt future sessions and presents the next prompt.

## 12. Functional Requirements

### 12.1 Application Access

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-001 | The application MUST be accessible via a standard web browser. | MUST | Renders successfully on Chrome/Safari. | Mobile-first design required. |

### 12.2 Dashboard

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-002 | The dashboard MUST display a "Start Practice" button. | MUST | Button initiates a new session when clicked. |  |
| FR-003 | The dashboard MUST display basic progress indicators. | MUST | Displays XP or completed session count. |  |

### 12.3 Practice Sessions

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-004 | The system MUST generate a structured practice session of approximately 10-15 questions. | MUST | Session ends after the predefined question count. |  |

### 12.4 Marathi AI Interaction

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-005 | The AI MUST communicate instructions and greetings in conversational Marathi. | MUST | AI messages are written in Marathi script. |  |

### 12.5 Translation Exercises

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-006 | The AI MUST provide a Marathi sentence for the student to translate into English. | MUST | UI clearly distinguishes the target sentence. |  |

### 12.6 Text Input

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-007 | The UI MUST provide a text field for typing English translations. | MUST | Student can type and submit via keyboard. |  |

### 12.7 Voice Input

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-008 | The UI MUST provide a microphone button to initiate voice recording. | MUST | Clicking the mic requests browser permission. |  |

### 12.8 Speech Transcription

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-009 | The application MUST convert the student's spoken English into text. | MUST | Speech populates the text input field. |  |
| FR-010 | The student MUST be able to manually edit the transcribed text before submission. | MUST | Text field remains editable after transcription. | Critical to avoid unfair STT penalties. |

### 12.9 Translation Evaluation

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-011 | The system MUST evaluate the submitted English text against the Marathi prompt. | MUST | AI returns an evaluation object (grade, error). |  |

### 12.10 Multiple Valid Translations

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-012 | The evaluation MUST NOT rely on exact string matching and MUST accept valid semantic alternatives. | MUST | Alternative correct phrasing is graded 'A'. |  |

### 12.11 Error Classification

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-013 | The system MUST classify errors into predefined grammatical categories. | MUST | Returns categories like "Tense", "Article", etc. |  |

### 12.12 Corrections

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-014 | If incorrect, the system MUST display the original answer alongside the corrected English answer. | MUST | UI visually compares original vs corrected. |  |

### 12.13 Beginner Explanations

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-015 | The system MUST provide a brief explanation of the error in Marathi. | MUST | Explanation is 1-2 sentences in Marathi. |  |

### 12.14 Retry/Reattempt

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-016 | The UI SHOULD offer a "Try Again" or "Review Later" mechanism for major errors. | SHOULD | Student can reattempt the concept. |  |

### 12.15 Next Exercise

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-017 | The student MUST explicitly trigger the next exercise after reviewing feedback. | MUST | "Next" button progresses the session state. |  |

### 12.16 Session Summary

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-018 | The application MUST display a summary screen upon completing the session exercises. | MUST | UI shows XP gained and concepts practiced. |  |

### 12.17 Progress Tracking

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-019 | The system MUST persist session completion and XP to the database. | MUST | DB updates upon session end. |  |

### 12.18 Error/Mistake Tracking

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-020 | The system MUST log the category of mistakes made during the session. | MUST | DB records error categories tied to the user. | Future use for adaptive learning. |

### 12.19 Failure Handling

| ID | Requirement | Priority | Acceptance Criteria | Notes |
| --- | --- | --- | --- | --- |
| FR-021 | The system MUST gracefully handle AI timeouts or invalid AI responses. | MUST | UI displays a polite error message and retry option. |  |

## 13. Translation Evaluation Requirements

The application MUST NEVER evaluate translations using hardcoded exact string matching. The AI engine must evaluate responses based on semantic equivalence, grammar, vocabulary, tense, articles, prepositions, word order, subject-verb agreement, missing/extra words, and contextual appropriateness.

The evaluation MUST return one of the following distinct categories:

* **A. Fully correct:** Flawless and natural.
* **B. Correct but slightly unnatural:** Grammatically valid, meaning intact, but phrased awkwardly.
* **C. Mostly correct with minor errors:** Meaning clear, minor issues (e.g., missing an article).
* **D. Partially correct:** Core vocabulary present, but major structural or tense errors.
* **E. Incorrect:** Meaning lost or entirely wrong words used.
* **F. Completely incorrect/off-topic:** Gibberish, nonsense, or unrelated to the prompt.

The system MUST recognize legitimate alternative English translations.
*Example:*
Marathi: *"मला आज बाजारात जायचे आहे."*
Valid accepted translations must include (but are not limited to):

* "I want to go to the market today."
* "I have to go to the market today."
* "I need to go to the market today."
The system must not mark a valid translation wrong simply because it differs from a single reference string.

## 14. Correction and Teaching Requirements

When Tejaswini makes an error (Grades C, D, E), the interface MUST clearly display the following components distinctly:

1. **Your answer:** Exactly what Tejaswini submitted.
2. **Suggested correction:** The most natural, grammatically correct version of her intent.
3. **Error:** The specific classification (e.g., "Subject-Verb Agreement").
4. **Explanation:** A beginner-friendly, concise explanation delivered in conversational Marathi (e.g., *"‘She’ सोबत present tense मध्ये ‘go’ ऐवजी ‘goes’ वापरतो."*).

## 15. Voice Interaction Requirements

Voice interaction is a strictly required capability.

* **AI Output (TTS):** The AI MUST optionally read the Marathi prompts and English corrections aloud using a text-to-speech engine.
* **Student Input (STT):** Tejaswini MUST be able to dictate her English response.
* **Visual State:** The UI MUST clearly indicate when the microphone is listening/recording.
* **Anti-Penalty Rule:** To ensure Tejaswini is not penalized for transcription errors (e.g., the browser hearing "by" instead of "buy"), the speech-to-text output MUST populate the text input field, remain editable, and require a manual "Submit" button click. Automatic submission upon stopping speech is prohibited.

## 16. Beginner Learning Requirements

The curriculum and AI generation MUST strictly adhere to a beginner progression. It must not overwhelm the user with advanced grammar.
Initial supported progressions include:

1. Pronouns and "Be" verbs
2. Simple Present
3. Present Continuous
4. Simple Past
5. Simple Future
6. Negatives
7. Basic Question formation
8. Prepositions

## 17. AI Tutor Behavior Requirements

* The AI MUST act as a supportive, patient tutor.
* The AI MUST primarily use conversational Marathi (बोलीभाषा), avoiding overly formal or academic Sanskritized Marathi unless necessary for clarity.
* The AI MUST handle code-switching gracefully (e.g., if Tejaswini uses a Marathi noun in an English sentence, the AI should correct the noun without marking the entire grammatical structure as a failure).
* The AI MUST NOT use condescending language or complex linguistic jargon in its explanations.

## 18. Adaptive Learning Requirements

* **MVP Scope:** The system MUST track which error categories (e.g., "Tense", "Articles") Tejaswini triggers most frequently in the database.
* **Future Scope:** Sophisticated adaptive difficulty (automatically dialing back difficulty, dynamically inserting mini-lessons, predicting decay curves) is explicitly scoped for future iterations. MVP relies on sequential progression and basic error logging.

## 19. Session Requirements

A standard practice session MUST:

* Consist of approximately 10 to 15 interactions.
* Begin with easier/warm-up exercises to build confidence.
* Transition through core grammar/translation practice.
* Include prompts that explicitly encourage voice usage.
* Conclude with a summary screen detailing the session's results.

## 20. Progress and Scoring Requirements

The system MUST avoid harsh grading systems (e.g., "F", "0/100", red failure marks) that discourage beginners.

* Scoring MUST be based on positive reinforcement, such as earning "Experience Points" (XP) for effort and accuracy.
* The system MUST track daily practice streaks to encourage consistency.
* Long-term progress MUST be visualized simply (e.g., total sessions completed, total XP).

## 21. UX Requirements

* **Mobile-First:** The interface MUST be fully usable on mobile devices, as this is the primary consumption method for single-user web apps.
* **Chat Interface:** The core interaction MUST resemble a familiar messaging interface (Left side AI, Right side Student).
* **Clarity:** Evaluation cards MUST use distinct, accessible colors (e.g., Green for Correct, Yellow for Minor Errors) to convey status at a glance without reading.

## 22. Accessibility Requirements

* Interactive elements (microphone, buttons) MUST have minimum touch targets of 44x44 CSS pixels.
* Text contrast MUST meet WCAG AA standards.
* The application MUST handle system microphone permission requests gracefully, providing clear instructions if access is denied.

## 23. Privacy Requirements

* **Authentication:** The application MUST restrict access to Tejaswini only.
* **Data Protection:** All learning data, mistake histories, and session logs MUST be stored securely in the database.
* **Voice Data:** The application MUST NOT permanently store audio recordings of Tejaswini's voice in the database. Audio is processed for transcription and immediately discarded.
* **Secret Management:** API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) MUST NEVER be exposed to the client browser. They must remain strictly server-side.

## 24. Non-Functional Requirements

| ID | Requirement | Priority | Measurement/Validation |
| --- | --- | --- | --- |
| NFR-001 | **Performance:** AI evaluations must return within a reasonable conversational timeframe. | MUST | < 3 seconds average response time for translation evaluation. |
| NFR-002 | **Reliability:** State must not be lost upon accidental browser refresh. | MUST | Session state is locally cached; refreshing restores the current question. |
| NFR-003 | **Security:** The application must utilize environment variables for all secrets. | MUST | Codebase review confirms no hardcoded API keys. |
| NFR-004 | **Availability:** The application must gracefully handle AI provider rate limits. | MUST | Implements retry logic and friendly user-facing error messages. |

## 25. MVP Scope

### 25.1 Included in MVP

* Private Next.js web application hosted on Vercel.
* Supabase-backed user authentication and database persistence.
* One authorized student account (Tejaswini).
* Beginner English curriculum progression.
* Marathi-first AI interaction via prompt engineering.
* Marathi-to-English translation exercises.
* Text input and Voice input via Web Speech API.
* Editable speech transcription before submission.
* AI translation evaluation (6-tier semantic evaluation).
* Beginner-friendly error correction and Marathi explanations.
* Basic 10-15 question session flow.
* Basic XP and session completion tracking.

### 25.2 Explicitly Excluded from MVP

* Pronunciation scoring, phoneme analysis, or accent evaluation.
* Complex, multi-branching adaptive difficulty algorithms.
* User avatars or complex 3D visual environments.
* Advanced gamification (badges, leaderboards, virtual currency).
* Multi-user or administrative teacher dashboards.
* Permanent storage of audio recordings.

### 25.3 Post-MVP Features (Future Scope)

* Dedicated Azure Speech integration for specific pronunciation assessment.
* Sophisticated weakness detection and automatic mini-lesson generation.
* Advanced analytics dashboard mapping mastery of specific grammatical rules.
* Support for additional students or languages.

## 26. Requirement Priorities

* **MUST:** Mandatory for the MVP release. The product cannot launch without this.
* **SHOULD:** Highly recommended for a good user experience but can be hot-fixed post-launch if strictly necessary.
* **COULD:** Nice-to-have features that will only be implemented if time permits.
* **FUTURE:** Explicitly out of scope for the current implementation phase.

## 27. Acceptance Criteria

| ID | Requirement Reference | Acceptance Criterion | Verification Method |
| --- | --- | --- | --- |
| AC-001 | FR-001, FR-002 | Tejaswini can securely access the application and view the dashboard. | Manual test via browser. |
| AC-002 | FR-005, FR-006 | The AI presents a grammatically correct Marathi practice sentence. | Visual inspection of session UI. |
| AC-003 | FR-007 | Tejaswini can type an English answer and submit it. | Manual input test. |
| AC-004 | FR-008, FR-009 | Tejaswini can click the microphone, speak, and see the transcribed English text. | Manual voice test. |
| AC-005 | FR-010 | Tejaswini can edit the transcribed text before clicking submit. | Manual edit of STT output before submission. |
| AC-006 | FR-011, FR-012 | The application accurately evaluates the response, accepting valid semantic alternatives without requiring exact string matches. | Automated/Manual testing against a dataset of alternative answers. |
| AC-007 | FR-013, FR-015 | Grammar errors are successfully identified, categorized, and explained in Marathi. | Intentional failure test cases. |
| AC-008 | FR-014 | The student receives the original answer, the corrected answer, and the explanation distinctly. | Visual UI inspection. |
| AC-009 | FR-017 | The application successfully progresses to the next exercise upon command. | Manual flow test. |
| AC-010 | FR-018, FR-019 | The session completes, displays a summary, and persists progress to the database. | End-to-end session completion and DB state verification. |

## 28. Success Metrics

* **Session Completion Rate:** > 80% of initiated sessions are completed to the summary screen.
* **Practice Consistency:** Tejaswini averages at least 3 practice sessions per week.
* **Reattempt Success:** > 75% of previously failed concepts are answered correctly when re-tested in subsequent sessions.
* **Transcription Edit Rate:** Tracking how often text is edited before submission to gauge STT quality and validate the necessity of the manual edit step.

## 29. Constraints

* **Audience Constraint:** The product must remain highly optimized for exactly one user. Generic onboarding flows or user management screens are prohibited.
* **Platform Constraint:** Must operate within a standard mobile/desktop web browser. Native iOS/Android app development is prohibited.
* **API Constraint:** The architecture will leverage existing APIs (Gemini, Web Speech API) rather than developing custom machine-learning models from scratch.
* **Simplicity Constraint:** The codebase and product logic must remain simple enough for a single developer to build and maintain efficiently without enterprise bloat.

## 30. Assumptions

| ID | Assumption | Status | Impact |
| --- | --- | --- | --- |
| ASSUMP-001 | Web Speech API (built into modern browsers) provides sufficient accuracy for a beginner English learner's dictation. | REQUIRES CONFIRMATION | High. If false, a paid API like OpenAI Whisper must be integrated for STT. |
| ASSUMP-002 | Tejaswini has access to a device with a functioning microphone and modern web browser (Chrome/Edge/Safari). | CONFIRMED | Critical. Voice interaction is a core requirement. |
| ASSUMP-003 | A session length of 10-15 questions takes approximately 10-15 minutes and avoids cognitive fatigue. | CONFIRMED | Medium. Can be adjusted based on usage data. |

## 31. Open Questions

| ID | Question | Why It Matters | Decision Needed |
| --- | --- | --- | --- |
| OQ-001 | What is the exact mathematical formula for calculating XP? | Affects database schema and frontend display logic. | Define flat vs. weighted XP system. |
| OQ-002 | What specific UI color palette will be used? | Ensures accessibility and consistent styling. | Define exact Tailwind CSS variables in UI Spec. |

## 32. Requirement Traceability

This section establishes the mapping foundation for downstream architectural documents.

* **FR-011 (Evaluation Engine) & FR-012 (Multiple Valid Translations)** $\rightarrow$ Maps to *11_EVALUATION_SPECIFICATION* and *12_AI_PROMPT_ARCHITECTURE*.
* **FR-008, FR-009, FR-010 (Voice Input)** $\rightarrow$ Maps to *16_VOICE_SPEECH_SPECIFICATION*.
* **FR-019 (Progress Tracking)** $\rightarrow$ Maps to *06_DATABASE_SCHEMA* and *15_SCORING_AND_PROGRESS*.
* **FR-021, NFR-004 (Failure Handling)** $\rightarrow$ Maps to *18_ERROR_AND_FAILURE_HANDLING*.

## 33. Source-of-Truth and Change-Control Rules

This PRD is the absolute source of truth regarding **WHAT** the Tejaswini AI English Tutor product must do.

1. Subsequent technical documents (Database Schemas, API Contracts, UI Systems) define **HOW** these requirements are implemented.
2. Technical documents MUST NOT silently change, omit, or contradict the requirements defined here.
3. If a technical limitation during implementation requires a change to the product scope (e.g., a required API is unavailable), the change MUST be explicitly documented as a revision to this PRD.

## 34. Final MVP Definition

The MVP is a functioning web application where Tejaswini can log in, receive a Marathi sentence, provide an English translation via text or editable voice transcription, and receive immediate, semantic AI evaluation and beginner-friendly corrections in Marathi. Progress is saved, and the interface is clean, mobile-friendly, and free of unnecessary gamification or multi-user complexity.

## 35. PRD Completion Checklist

* [x] Target user defined (Tejaswini, Beginner).
* [x] Primary learning loop defined.
* [x] MVP vs. Future Scope strictly separated.
* [x] Voice interaction defined (including editable STT rule).
* [x] Evaluation rules defined (Semantic > String match).
* [x] Pronunciation explicitly excluded from MVP.
* [x] No sensitive API credentials exposed.
* [x] Testable Acceptance Criteria defined.