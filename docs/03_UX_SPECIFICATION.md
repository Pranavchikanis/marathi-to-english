# 03 — UX Specification

## 1. Document Control

* **Document ID:** UX-001
* **Document Name:** Tejaswini AI English Tutor - UX Specification
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Beginner)
* **Platform:** Web Application (Mobile-First)
* **Owner:** Senior UX Architect
* **Source of Truth:** Authoritative specification for user flows, interaction states, and screen behavior.

## 2. UX Vision

The application must provide a simple, beginner-friendly, mobile-first chat-style interface. The experience is designed to reduce cognitive load, acting as a patient, conversational tutor that uses Marathi as a bridge language. The interface must be highly forgiving of technical constraints, ensuring that technical errors (like speech recognition failures) never penalize the learner's educational progress.

## 3. UX Goals

* **Clarity of Task:** Tejaswini must instantly understand what the AI is asking her to translate.
* **State Visibility:** The system must clearly display whether it is recording, processing, or evaluating.
* **Safety to Fail:** The user must feel comfortable making mistakes, with clear, gentle feedback provided in conversational Marathi.
* **No Technical Penalties:** Speech-to-text outputs must be explicitly editable before submission.
* **Seamless Recovery:** Network or browser interruptions must not result in lost session progress.

## 4. UX Principles

* **Simple & Focused:** One primary action per screen.
* **Beginner-Friendly:** Limit complex grammar jargon; use everyday Marathi.
* **Accessible:** High contrast, large touch targets, and clear visual hierarchy.
* **Predictable:** Consistent chat-flow patterns that behave exactly as expected.
* **Conversational:** The AI should feel like a supportive tutor, not a rigid grading machine.

## 5. Source Requirements

| ID | Requirement | Priority | Description | Validation |
| --- | --- | --- | --- | --- |
| UX-REQ-01 | Chat-Style Interface | MUST | A simple, beginner-friendly, mobile-first chat-style interface. | Visual validation against chat paradigm. |
| UX-REQ-02 | Voice Transcription Edit | MUST | Review and manually edit speech-to-text before submitting. | User flow test. |
| UX-REQ-03 | Local State Caching | MUST | Caching the current session state locally so a refresh does not lose place. | Browser refresh test during session. |
| UX-REQ-04 | Conversational AI Tone | MUST | Communicate naturally in conversational Marathi and gradually introduce English. | Copy review. |

## 6. User Profile and UX Context

* **User:** Tejaswini.
* **Context:** Beginner English learner natively speaking Marathi. She requires a low-anxiety environment to practice translation and speaking.
* **UX Implication:** The interface must not overwhelm her with advanced grammar terms. Explanations should be short, practical, and in a language she comfortably understands.

## 7. Information Architecture

```text
Application
├── Authentication (Secure Login)
├── Dashboard
│   ├── Start Practice (Primary Action)
│   ├── Current Streak / XP
│   └── Recent Mistakes / Review
├── Practice Session
│   ├── Exercise Prompt (Marathi)
│   ├── Input (Text / Voice Toggle)
│   ├── Transcription Review
│   ├── Evaluation Feedback Card
│   └── Next / Retry Controls
└── Session Summary
    ├── Completion Stats
    └── Return to Dashboard

```

## 8. Application Navigation

* **Primary Navigation:** A persistent top/bottom app bar is minimized during practice sessions to maintain focus.
* **Back Behavior:** Clicking "Back" during an active session triggers a confirmation modal: *"Are you sure you want to pause your practice?"*
* **Session Exit:** Exiting saves the current question state locally.

## 9. First-Time User Experience

* **Authentication:** Simple, secure login using magic link or secure credentials.
* **Welcome:** A single, friendly introductory screen in Marathi explaining that the app will help her practice English translation.
* **Microphone Permission:** Triggered contextually only when she clicks the microphone button for the first time, accompanied by a polite explanation of why it is needed.
* **Immediate Practice:** No prolonged tutorials. The app jumps straight into a Difficulty-1 practice session.

## 10. Dashboard UX

| ID | Screen | Purpose | Entry | Primary Action | Secondary Actions | States | Responsive Behavior | Accessibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-DASH | Dashboard | Home landing | Login, Session End | Start Practice | View Mistakes | Loading, Default, Empty (No history) | Centered layout, max-width 600px | ARIA headings for progress stats |

* **Greeting:** *"नमस्कार तेजस्विनी!"*
* **Progress:** Visual indicator of daily streak or total XP.
* **Recent Mistakes:** A small card showing 1-2 recent errors to keep them top-of-mind.

## 11. Practice Session UX

The practice session is a continuous chat thread. It typically lasts approximately 10–15 minutes.

* **Scroll Behavior:** New messages appear at the bottom. The view auto-scrolls to the latest evaluation or next prompt.
* **Visual Layout:** AI messages align left; Student messages align right.

## 12. Exercise Presentation UX

* **AI Message Bubble:** Contains the Marathi sentence to be translated.
* **Audio Control:** A prominent [▶ Play] button next to the Marathi text.
* **Instruction:** Brief microcopy below the bubble (e.g., *"Translate to English"*).
* **Focus:** The text input field auto-focuses on desktop; on mobile, it waits for a user tap to prevent keyboard popping unexpectedly.

## 13. Text Input UX

* **Input Field:** A large text input area spanning the bottom of the screen.
* **Submit Activation:** The "Submit" button remains disabled until at least one character is typed.
* **Keyboard Behavior:** Enter key submits the answer (desktop); "Go/Done" submits on mobile keyboards.
* **Debounce:** The submit button disables immediately upon click to prevent accidental double submissions.

## 14. Voice Interaction UX

* **Microphone Button:** A prominent microphone button placed adjacent to the text input.
* **Recording State:** When active, the mic pulses with a red/recording visual state.
* **Stop Recording:** The user clicks the pulsing mic or a distinct "Stop" button to end voice capture.
* **Processing:** A subtle loading animation (e.g., *"Listening..."*) appears in the text field while STT processes.

## 15. Speech Transcription Review UX

This is a critical requirement to ensure speech-recognition errors do not unfairly affect Tejaswini's evaluation.

* **Population:** The transcribed text populates directly into the standard text input field.
* **Explicit Editability:** The text remains fully editable. Tejaswini can tap into the field to fix misheard words (e.g., changing "by" to "buy").
* **No Auto-Submit:** The system MUST wait for her to explicitly click the "Submit Answer" button.

## 16. Answer Submission UX

* **Action:** Clicking "Submit" locks the input field.
* **Transition:** The student's text appears as a right-aligned chat bubble.
* **Loading:** An AI typing indicator `...` appears on the left to indicate evaluation is occurring.

## 17. AI Evaluation UX

The AI returns one of the 6 evaluation categories: Fully correct, Correct but slightly unnatural, Mostly correct with minor errors, Partially correct, Incorrect, Completely incorrect/off-topic.

* **Evaluation Card:** Appears beneath the student's answer. It contains an icon, a status color, the correction (if needed), and an explanation.

## 18. Correct Answer UX

* **Visuals:** Green accent color, success icon (✅).
* **Copy:** *"अगदी बरोबर!"* (Absolutely correct!).
* **Multiple-Valid-Translation:** If the student provided a legitimate translation different from the AI's primary expectation, it is accepted gracefully.
* **Optional Alternative:** *"You can also say: [Alternative]"* presented cleanly without implying the student was wrong.

## 19. Minor Error UX

* **Visuals:** Yellow/Amber accent color, info icon (ℹ️).
* **Copy:** *"जवळपास बरोबर!"* (Almost correct!).
* **Correction:** Highlights the specific fix (e.g., adding an article).
* **Explanation:** Brief, beginner-friendly grammar rule in Marathi.

## 20. Major Error UX

* **Visuals:** Orange accent color, alert icon (⚠️) — avoiding harsh red "Failure" colors.
* **Copy:** *"चला हे दुरुस्त करूया."* (Let's fix this.)
* **Correction:** Displays the student's answer crossed out/dimmed next to the bolded correct answer.
* **Explanation:** Direct, non-condescending explanation in conversational Marathi.

## 21. Partially Correct Answer UX

* **Visuals:** Orange/Yellow hybrid.
* **Feedback:** Acknowledges the correct vocabulary before correcting the structural mistake.

## 22. Incorrect/Off-Topic Answer UX

* **Gibberish/Off-Topic:** The AI provides a gentle response in Marathi when the answer is not understood.
* **Copy:** *"मला हे समजले नाही. कृपया पुन्हा प्रयत्न करा."* (I didn't understand this. Please try again.)
* **Action:** The input field resets, offering a free retry.

## 23. Multiple-Valid-Translation UX

The system explicitly requires acceptance of multiple legitimate translations.

* **UX Rule:** Never use the phrase "The correct answer is" if the student's answer is also valid. Instead, say *"बरोबर!"* and offer alternatives as optional learning ("Another natural way to say this is...").

## 24. Retry and Reattempt UX

* **Major Errors:** The evaluation card presents a secondary button: [Retry].
* **Interaction:** Clicking Retry copies the Marathi prompt into a new chat bubble at the bottom, allowing her a fresh attempt.

## 25. Next Exercise UX

* **Primary Action:** A prominent [Next] button appears at the bottom of the evaluation card.
* **Control:** The session does not advance automatically. Tejaswini controls the pace.

## 26. Session Progress UX

* **Progress Bar:** A subtle linear progress bar at the top of the chat interface.
* **Pacing:** Reflects the 10-15 minute session structure, containing roughly 2 warm-up, 5 core, 2 voice, and 1 review exercise.

## 27. Session Summary UX

| ID | Screen | Purpose | Entry | Primary Action | Secondary Actions | States | Responsive Behavior | Accessibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCR-SUMM | Session Summary | Conclude session | 10th exercise complete | Return to Dashboard | Review Mistakes | Confetti animation | Single column card | ARIA live region for XP announcement |

* **Content:** Number of exercises completed, overall accuracy, and a positive closing message.

## 28. Progress Dashboard UX

* **Location:** Accessed via the main dashboard.
* **Content:** Simple, encouraging metrics. Total XP, Days Practiced. Avoids complex analytics that cause cognitive overload.

## 29. Mistake History UX

* **Display:** A simple list of recent errors, showing the Marathi prompt, the incorrect English attempt, and the correct English target.

## 30. Settings UX

* **Content:** Minimal configuration. Volume toggle, logout button, and data privacy information.

## 31. Loading States

* **Exercise Generation:** *"Preparing your next sentence..."* with a pulsing chat bubble.
* **AI Evaluation:** *"Checking your answer..."*

## 32. Empty States

* **Dashboard Mistakes:** *"You have no recent mistakes to review. Great job!"*

## 33. Error States

* **Microphone Denied:** *"Microphone access is blocked. Please enable it in your browser settings, or continue using text."*
* **API/Network Timeout:** *"We had trouble connecting. Please check your internet and try again."*

## 34. Network and Recovery UX

* **Local Caching:** The application uses `localStorage` or equivalent caching. If Tejaswini accidentally refreshes the browser or loses her network connection, the session state is cached locally so that a refresh/network interruption does not cause her to lose her place.

## 35. AI Speaking and Listening States

* **Audio Playback:** A waveform or speaker icon animates while AI TTS is playing.
* **Listening:** The microphone button turns solid red and pulses gently while capturing audio.

## 36. Accessibility Specification

* **Keyboard Navigation:** All buttons, including the microphone and play-audio controls, must be accessible via `Tab` and triggered via `Enter`/`Space`.
* **Screen Readers:** Use `aria-live="polite"` for evaluation feedback so the result is announced.
* **Contrast:** Minimum 4.5:1 contrast ratio for all text against backgrounds. Color alone MUST NOT be used to communicate correctness (use icons ✅, ⚠️).

## 37. Responsive Design Specification

* **Mobile-First:** The layout is optimized for a vertical viewport. The chat input is anchored to the bottom edge above the software keyboard.
* **Desktop:** The chat interface is constrained to a maximum width (e.g., 600px) centered on the screen to maintain readability and structural familiarity.

## 38. Beginner Cognitive-Load Rules

* **Explanation Limits:** Limit grammar explanations to a beginner-friendly level. Maximum 2 short sentences per explanation.
* **One Action:** Only one primary button (Submit, Next, or Return) is highlighted at any time.

## 39. Conversational UX

* **Pacing:** The AI introduces concepts conversationally.
* **Language Transition:** AI communicates naturally in conversational Marathi, gradually introducing more English encouragement ("Great job!", "Almost there") as Tejaswini improves.

## 40. UX Copy Guidelines

* **Tone:** Warm, encouraging, patient.
* **Marathi Style:** Marathi should initially be conversational and natural rather than excessively formal or Sanskritized. (e.g., use "ट्रेन" instead of "आगगाडी" if it is more commonly spoken).

## 41. Code-Switching UX

* **Behavior:** If Tejaswini uses a Marathi word inside an English sentence (e.g., "I am eating poli"), the AI should explain the English equivalent without treating the entire grammatical structure as a complete failure.
* **Feedback Copy:** *"Your grammar is good! In English, 'poli' is called 'flatbread' or 'roti'. Let's try saying the whole sentence in English."*

## 42. AI Uncertainty UX

* **Hedging:** If the AI confidence is low regarding what the student meant, it should ask a clarifying question rather than issuing a harsh penalty.

## 43. Technical Error vs Learner Error UX

* **Distinction:** A speech recognition failure (resulting in gibberish text) is a technical error.
* **UX Resolution:** By forcing manual submission of transcribed text, the user acts as a buffer. If the API fails completely, an alert appears, but the learning streak or XP is not penalized.

## 44. UX Component Inventory

| ID | Component | Purpose | States | Interaction | Accessibility | Responsive Behavior |
| --- | --- | --- | --- | --- | --- | --- |
| CMP-01 | Chat Bubble (AI) | Display Marathi prompt | Default, Playing Audio | Click Play Audio | `aria-label` for audio | Fluid width, max 85% |
| CMP-02 | Input Area | Capture text/voice | Empty, Filled, Recording, Disabled | Type, Click Mic, Submit | Focus states, `aria-required` | Anchors to bottom on mobile |
| CMP-03 | Eval Card | Show feedback | Correct, Minor Err, Major Err | Click Next, Click Retry | `aria-live` region | Fills chat width |
| CMP-04 | Mic Button | Trigger STT | Idle, Recording, Processing | Tap/Click to toggle | `aria-label="Start recording"` | Scales slightly larger on mobile |

## 45. Interaction State Machines

```text
[Practice Session Core Loop]
1. AI Presents Prompt
   └── (User thinks)
2. User Input Phase
   ├── User Types -> Enters Text -> (Submit)
   └── User Taps Mic -> (Recording) -> User Taps Stop -> (Transcribing) -> Text Populates -> User Edits -> (Submit)
3. AI Evaluation Phase
   ├── (Processing...)
   └── Displays Evaluation Card
4. Resolution Phase
   ├── (Correct) -> User taps Next
   ├── (Minor Error) -> User reads tip -> User taps Next
   └── (Major Error) -> User taps Retry -> Loops to Step 2

```

## 46. Complete User Flow Diagrams

| Flow ID | Step | User Action | System Response | Next State | Failure Path |
| --- | --- | --- | --- | --- | --- |
| FLW-01 | 1 | Tap Mic | Prompt browser permission | Recording State | Mic Denied Alert -> Text Input |
| FLW-01 | 2 | Speak | Visual pulse | Processing STT | No Audio Detected Alert |
| FLW-01 | 3 | Stop | Transcribe & populate input | Transcription Review | STT Failed Alert |
| FLW-01 | 4 | Tap Submit | Disable input, send to API | AI Evaluation | Network Error Alert |

## 47. UX Analytics Requirements

* **Events to Track:** Session Start, Session Complete, Voice Used vs Text Used, Transcription Edited (boolean), Error Category Triggered, Retry Attempted.

## 48. Future UX Scope

* **Pronunciation Assessment:** Specific visual feedback for phonemes and intonation is EXCLUDED from MVP.
* **Advanced Analytics:** Radar charts mapping grammatical mastery are reserved for future phases.

## 49. UX Acceptance Criteria

| ID | Requirement Reference | Acceptance Criterion | Verification Method |
| --- | --- | --- | --- |
| UX-AC-001 | UX-REQ-01 | Tejaswini can instantly identify the Marathi exercise in the chat interface. | UI visual test. |
| UX-AC-002 | UX-REQ-02 | Tejaswini can start voice recording, stop it, and view the transcription in the text field. | Voice input manual test. |
| UX-AC-003 | UX-REQ-02 | The application DOES NOT auto-submit voice transcriptions without a manual submit click. | STT flow test. |
| UX-AC-004 | UX-REQ-02 | Tejaswini can type into the field to edit the STT output before submission. | Keyboard interaction post-STT. |
| UX-AC-005 | UX-REQ-04 | The evaluation card visually differentiates between Correct, Minor Error, and Major Error without relying solely on color. | Accessibility & UI state test. |
| UX-AC-006 | UX-REQ-03 | Refreshing the browser mid-session restores the exact chat state and current prompt. | Browser refresh simulation. |

## 50. UX Traceability

| UX Requirement | PRD Requirement | Curriculum Reference | Screen/Component | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| Editable STT | FR-010 | Voice Learning Prog. | CMP-02, CMP-04 | UX-AC-003, UX-AC-004 |
| Chat Interface | FR-006 | Session Progression | SCR-PRAC | UX-AC-001 |
| Minor Error Feedback | FR-013, FR-015 | Mistake-Driven Lrng. | CMP-03 | UX-AC-005 |
| Multiple Valid Answers | FR-012 | Mastery Model | CMP-03 | (Covered in PRD) |

## 51. Implementation Handoff Rules

* **Frontend Developers:** Must implement the exact state machines defined in Section 45. Components must map to the states in Section 44.
* **AI Prompters:** Must ensure the JSON outputs from the LLM map gracefully to the 6 evaluation categories required to drive the UX evaluation cards.

## 52. Assumptions

* The target mobile device has a functioning software keyboard and microphone API supported by the browser.
* CSS animations (e.g., pulsing mic) will respect the user's OS-level `prefers-reduced-motion` settings.

## 53. Open UX Questions

| ID | Question | Why It Matters | Source | Status |
| --- | --- | --- | --- | --- |
| UX-OQ-01 | Should the AI audio (TTS) auto-play when a new Marathi prompt appears, or require a manual click? | Affects mobile data usage and public-space privacy. | Architecture | Open |
| UX-OQ-02 | What specific UI font best supports clear Marathi rendering alongside English? | Readability for beginners. | UX Vision | Open |

## 54. Final UX Specification

This UX specification provides the exact interaction boundaries required for development. It ensures Tejaswini receives a safe, conversational, and highly forgiving learning experience that prioritizes educational engagement over technical rigidity.

## 55. UX Completion Checklist

* [x] Simple, beginner-friendly chat interface specified.
* [x] Voice transcription manual editing enforced to prevent technical penalties.
* [x] 10-15 minute session pacing UX defined.
* [x] Evaluation categories mapped to distinct UI states.
* [x] Local caching recovery UX defined.
* [x] Conversational, natural Marathi copy rules applied.
* [x] Code-switching edge case addressed.
* [x] Mobile-first and accessibility rules explicitly stated.
* [x] No sensitive API credentials exposed.