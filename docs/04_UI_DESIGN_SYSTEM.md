# 04 — UI Design System

## 1. Document Control

* **Document ID:** UI-001
* **Document Name:** Tejaswini AI English Tutor - UI Design System
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary User:** Tejaswini (Beginner)
* **Platform:** Web Application (Mobile-First)
* **Owner:** Senior UI Design-System Architect
* **Source of Truth:** Authoritative specification for visual design, UI components, design tokens, and interface behavior.

## 2. Design-System Purpose

The purpose of this design system is to define HOW the application looks and HOW its visual interface components behave. It bridges the gap between the UX Specification and frontend implementation, ensuring a consistent, accessible, and beginner-friendly visual language that Google Antigravity can accurately reproduce without inventing arbitrary design rules.

## 3. Design-System Scope

This specification covers visual principles, typography (including Devanagari script support), color semantics, layout structures, spacing, component variants, interaction states, and accessibility design tokens. It focuses strictly on the MVP scope: a focused mobile-first web app supporting text/voice inputs, chat-based translation, and beginner-friendly AI evaluation.

## 4. Source Documents and Authority

This document relies on the following hierarchical sources of truth:

1. `01_PRODUCT_REQUIREMENTS.md` (Product scope & requirements)
2. `02_LEARNING_CURRICULUM.md` (Educational progression)
3. `03_UX_SPECIFICATION.md` (User flows & interaction states)
*Cross-document conflicts are resolved in favor of the higher-priority document.*

## 5. Visual Design Philosophy

The application employs a **calm, educational, and highly focused** visual philosophy. It rejects the generic, utilitarian feel of a ChatGPT clone and the overwhelming, noisy gamification of apps like Duolingo. It is a modern, quiet space for learning. The visual hierarchy directs 100% of the user's attention to the current exercise, minimizing extraneous cognitive load.

## 6. Design Principles

* **Clarity Over Decoration:** No unnecessary gradients, heavy shadows, or decorative avatars. Every pixel serves the learning loop.
* **Encouraging Error States:** Errors are learning opportunities, not punishments. We avoid aggressive reds and stark warning signs, opting for warm ambers/oranges and constructive layouts.
* **Obvious Affordances:** Primary actions (Submit, Mic) are instantly identifiable.
* **Legibility First:** High contrast and generous line height, specifically tailored to accommodate the vertical height of Marathi (Devanagari) script.
* **State Transparency:** The user must instantly distinguish visually if the app is idle, listening, processing, or ready.

## 7. Brand and Visual Direction

* **Personality:** Patient, trustworthy, modern, and supportive.
* **Shape Language:** Soft rectangles with consistent medium border radii to convey friendliness without feeling childish.
* **Elevation:** Flat design with subtle drop shadows reserved strictly for interactive floating elements (like the evaluation card or modals).
* **Illustration/Iconography:** Minimalist, rounded-stroke icons. No elaborate character illustrations for the MVP.

## 8. Color System

The color system avoids harsh error colors and relies on a soft, accessible palette. *Dark mode is marked as a post-MVP feature.*

| Token | Light Value | Dark Value | Semantic Meaning | Accessibility Notes |
| --- | --- | --- | --- | --- |
| `color.primary.default` | `#4F46E5` (Indigo) | N/A | Primary actions (Submit, Start) | AA contrast against white |
| `color.primary.hover` | `#4338CA` | N/A | Primary interaction state |  |
| `color.primary.disabled` | `#C7D2FE` | N/A | Disabled buttons | Ensure disabled state is visible |
| `color.secondary.default` | `#F3F4F6` (Gray) | N/A | Secondary buttons, AI bubbles | High contrast text required |
| `color.background.app` | `#F9FAFB` | N/A | App canvas background |  |
| `color.surface.default` | `#FFFFFF` | N/A | Cards, inputs, student bubbles |  |
| `color.border.default` | `#E5E7EB` | N/A | Structural dividers, inputs |  |
| `color.text.primary` | `#111827` | N/A | Headings, primary Marathi/English | AAA contrast |
| `color.text.secondary` | `#4B5563` | N/A | Explanations, meta-text | AA contrast |
| `color.text.muted` | `#9CA3AF` | N/A | Placeholders, disabled text |  |
| `color.status.success` | `#10B981` (Green) | N/A | Correct translations, completion | AA contrast |
| `color.status.minor` | `#F59E0B` (Amber) | N/A | Minor errors, partial correctness | Needs dark text for contrast |
| `color.status.major` | `#F97316` (Orange) | N/A | Major grammar/tense errors | Softer than pure red |
| `color.status.recording` | `#EF4444` (Red) | N/A | Active microphone pulse |  |

## 9. Typography System

Typography must support both Latin (English) and Devanagari (Marathi) scripts flawlessly.

| Token | Font Family | Size | Weight | Line Height | Usage |
| --- | --- | --- | --- | --- | --- |
| `type.heading.h1` | `Inter`, `Mukta`, sans-serif | 24px (1.5rem) | 700 | 1.3 | Dashboard greeting, summary |
| `type.heading.h2` | `Inter`, `Mukta`, sans-serif | 20px (1.25rem) | 600 | 1.4 | Section titles, large prompts |
| `type.body.large` | `Inter`, `Mukta`, sans-serif | 18px (1.125rem) | 400 | 1.6 | Primary Marathi practice prompt |
| `type.body.default` | `Inter`, `Mukta`, sans-serif | 16px (1rem) | 400 | 1.5 | Student input, standard text |
| `type.body.medium` | `Inter`, `Mukta`, sans-serif | 16px (1rem) | 500 | 1.5 | Button labels, emphasis |
| `type.body.small` | `Inter`, `Mukta`, sans-serif | 14px (0.875rem) | 400 | 1.5 | Explanations, metadata, XP |

*Design Rule:* Devanagari requires a minimum line height of `1.5` to prevent *matras* (diacritics) from clipping.

## 10. Spacing System

Built on a standard 4px/8px baseline grid.

* `spacing.1`: 4px
* `spacing.2`: 8px (Inner component padding)
* `spacing.3`: 12px (Small gaps)
* `spacing.4`: 16px (Standard padding/margins)
* `spacing.5`: 20px (Between chat bubbles)
* `spacing.6`: 24px (Section margins)
* `spacing.8`: 32px (Large structural gaps)

## 11. Layout System

* **Application Max Width:** `100%` width on mobile, capped at `768px` on desktop (centered).
* **Header Height:** `60px` (fixed, sticky).
* **Chat Container:** Flex column, scrolling area.
* **Input Area:** Sticky to the bottom of the viewport.

## 12. Responsive Breakpoints

* `mobile-sm`: `< 375px` (Compact UI, tight padding)
* `mobile`: `375px - 639px` (Default target)
* `tablet/desktop`: `>= 640px` (Centers the app container, adds outer grey background `color.background.app` while surface remains white).

## 13. Border-Radius System

* `radius.sm`: 4px (Badges, small tags)
* `radius.md`: 8px (Buttons, inputs, evaluation cards)
* `radius.lg`: 16px (Chat bubbles)
* `radius.full`: 9999px (Circular mic buttons, avatars if any)

## 14. Elevation and Shadow System

* `shadow.none`: Flat (Most UI elements)
* `shadow.sm`: `0 1px 2px rgba(0,0,0,0.05)` (Inputs, standard buttons)
* `shadow.md`: `0 4px 6px rgba(0,0,0,0.1)` (Evaluation cards, modals)
* `shadow.floating`: `0 10px 15px rgba(0,0,0,0.1)` (Sticky bottom input container on desktop)

## 15. Iconography System

* **Style:** Outline icons, 2px stroke, rounded caps (e.g., Feather Icons or Lucide).
* **Base Size:** `20px` (Inline) / `24px` (Controls) / `32px` (Primary Mic).
* **Usage:** Icons *must* accompany colors to denote state (e.g., Checkmark + Green, Alert Triangle + Orange).

## 16. AI and Student Visual Identity

* **AI (Tutor):** Left-aligned. Bubble background is `color.secondary.default` (Soft Gray). No avatar is required; a subtle icon (e.g., a spark or book) can denote the AI.
* **Student (Tejaswini):** Right-aligned. Bubble background is `color.surface.default` with a 1px `color.border.default` border to distinguish it from the background.

## 17. Chat and Message System

* **Bubble Width:** Max 85% of the container width to ensure distinct visual alignment.
* **Padding:** `spacing.4` (16px) internally.
* **Border Radius:** `radius.lg` (16px). For AI, the bottom-left corner is `radius.sm`. For Student, the bottom-right corner is `radius.sm`.
* **Audio Control:** A small, circular 32x32px play button aligned inline or directly below the Marathi text.

## 18. Exercise Card System

When a new exercise is presented, it acts as an expanded AI message:

1. **AI Icon & Header:** "Translate this sentence:" (Small, `color.text.secondary`).
2. **Marathi Prompt:** `type.body.large`, `color.text.primary`. Bold.
3. **Audio Button:** Inline with the prompt.

## 19. Text Input System

* **Container:** Anchored to bottom. Background: white.
* **Input Box:** Border: `color.border.default`. Radius: `radius.md`. Height: Min 48px, auto-expands up to 120px for long sentences.
* **Focus State:** Border changes to `color.primary.default`. Shadow ring: `0 0 0 2px rgba(79, 70, 229, 0.2)`.
* **Disabled State:** Opacity 50%, background `color.secondary.default`.

## 20. Microphone Component

| ID | Component | Purpose | Variants | States | Responsive Behavior | Accessibility |
| --- | --- | --- | --- | --- | --- | --- |
| CMP-MIC | Mic Button | Trigger STT | Primary (Circular) | Idle, Recording, Processing | Scales to 56x56px on mobile for easy reach | `aria-label="Start recording"` |

* **Idle:** Background `color.primary.default`, White icon.
* **Recording:** Background `color.status.recording` (Red). Pulsing animation (`box-shadow` expansion).
* **Processing:** Background `color.secondary.default`, Gray spinner icon.

## 21. Voice-State Visual System

* **READY TO SPEAK:** Input placeholder text changes to *"Tap microphone to speak..."*
* **RECORDING:** Mic pulses. Placeholder changes to *"Listening..."* with a subtle animated wave.
* **PROCESSING:** Mic spins. Placeholder changes to *"Converting speech to text..."*

## 22. Speech Transcription Review Component

* **Visual State:** Once transcribed, the STT text behaves *exactly* like typed text inside the input box.
* **Edit Affordance:** The cursor is placed at the end of the text. A subtle helper text appears below the input: *"Review your text and press Submit."*
* **Re-record:** The mic button remains available to clear and restart recording.

## 23. Evaluation Result System

The evaluation card appears below the student's submitted answer bubble. It uses `shadow.md` and `radius.md`.

| Semantic State | Accent Color | Icon | Label Example |
| --- | --- | --- | --- |
| Fully Correct | `color.status.success` (Green) | ✅ Check | "अगदी बरोबर!" (Perfect!) |
| Correct (Unnatural) | `color.status.success` (Green) | 💡 Bulb | "बरोबर!" (Correct!) |
| Minor Error | `color.status.minor` (Amber) | ℹ️ Info | "जवळपास बरोबर!" (Almost!) |
| Partially Correct | `color.status.minor` (Amber) | ℹ️ Info | "अर्धे बरोबर!" (Half right!) |
| Major Error | `color.status.major` (Orange) | ⚠️ Alert | "चला हे दुरुस्त करूया." (Let's fix this) |
| Off-Topic | `color.text.secondary` (Gray) | ❓ Question | "मला समजले नाही." (I didn't understand) |

## 24. Correct Answer State

* **Layout:** Green top border (4px). Checkmark icon.
* **Content:** Affirmation in Marathi.
* **Action:** Primary [Next] button.

## 25. Minor Error State

* **Layout:** Amber top border. Info icon.
* **Content:** Highlights the missing/wrong word (e.g., article).
* **Action:** Primary [Next] button.

## 26. Major Error State

* **Layout:** Orange top border. Alert icon.
* **Content:** Correction component (See Section 30).
* **Action:** Primary [Retry] button, Secondary [Next] button.

## 27. Partially Correct State

* **Visuals:** Similar to Minor Error, but the explanation explicitly praises the correct vocabulary before addressing the structural error.

## 28. Incorrect/Off-Topic State

* **Visuals:** Gray border. Neutral.
* **Content:** "I didn't understand that. Please try again."
* **Action:** Input unlocks automatically.

## 29. Multiple-Valid-Translation UI

* If the answer is a valid alternative, it receives the **Fully Correct** visual state.
* **Alternative Tip:** A small gray callout box inside the success card: *"Another natural way to say this is: [AI's preferred version]"*. Visually separated from the primary "Correct" message to ensure the student doesn't feel penalized.

## 30. Correction Component

* **Your Answer:** Rendered in `color.text.muted` with a strikethrough for completely wrong words.
* **Correction:** Rendered in `color.text.primary` with the corrected words in **Bold**.
* **Category Badge:** A small pill badge (e.g., `radius.sm`, `color.secondary.default` background) stating the error type (e.g., "Tense").
* **Explanation:** `type.body.small` in Marathi.

## 31. Error-Category System

Badges for error categories (Grammar, Tense, Vocabulary, etc.) share a uniform visual style:

* Background: `#F3F4F6` (Gray)
* Text: `#4B5563` (Dark Gray)
* Font: `type.body.small`, Uppercase, Letter-spacing: 0.05em.
* *Rule:* We do not color-code grammar categories to avoid visual rainbow clutter.

## 32. Progress Indicator System

* **Visual:** A continuous horizontal bar `height: 4px` fixed at the top of the chat area or screen.
* **Colors:** Background `color.secondary.default`, Fill `color.primary.default`.

## 33. Session Progress Component

* **Header Bar:** Contains a back button (Left), Progress Bar (Center), and Current Stage Label (Right, e.g., "Stage 2").

## 34. Dashboard Components

* **Greeting:** Large H1 header.
* **Start Button:** Massive, spanning 100% width on mobile. `color.primary.default`.
* **Mistake Card:** Minimalist list. Each item shows the Marathi prompt and the bold English correction.

## 35. Session Summary Components

* **Header:** "Session Complete!" with subtle confetti iconography.
* **Stats:** Large numbers for "XP Gained" and "Accuracy".
* **Action:** [Return to Dashboard] (Primary).

## 36. Mistake History Components

* **Card:** `shadow.sm`, `radius.md`.
* **Layout:** Stacked text. Marathi $\rightarrow$ English correction. No interactive elements required other than scrolling.

## 37. Button System

| Component | Default | Hover | Focus | Active | Disabled | Loading |
| --- | --- | --- | --- | --- | --- | --- |
| **Primary** | `primary.default` bg, White text | `primary.hover` bg | 2px focus ring | Scale 0.98 | Opacity 50% | Spinner + Label |
| **Secondary** | Transparent bg, `primary.default` text | Light indigo bg | 2px focus ring | Scale 0.98 | Opacity 50% | Spinner + Label |

* **Height:** 48px minimum (Touch friendly).
* **Radius:** `radius.md`.

## 38. Form Control System

* Kept to a minimum. Textareas auto-resize. No complex select dropdowns needed for MVP (settings are minimal).

## 39. Card and Container System

* **Padding:** `spacing.4` (16px) internally for all cards.
* **Borders:** 1px solid `color.border.default` applied to cards to separate them from the background on desktop.

## 40. Alert, Banner, and Toast System

* **Toasts:** Small floating banners at the top of the screen (`shadow.md`, `radius.md`).
* **Usage:** Used *only* for system events (e.g., "Progress saved", "Network reconnected"). Never used for learning feedback (which must remain permanently visible in the chat).

## 41. Modal and Dialog System

* **Backdrop:** 50% opacity black `rgba(0,0,0,0.5)`.
* **Card:** Centered, `radius.md`, max-width 400px.
* **Usage:** "Are you sure you want to exit the session?"

## 42. Loading-State System

* **AI Chat:** A chat bubble with three animated dots bouncing sequentially (`...`).
* **Dashboard:** Skeleton loaders (gray pulsing rounded rectangles) matching the shape of the content.

## 43. Empty-State System

* **Visual:** Centered, gray outline icon (e.g., a checklist with a checkmark), `type.heading.h2` title, `type.body.default` subtitle in `color.text.secondary`.

## 44. Error-State System

* **Network Error Toast:** Red background, white text. Fixes to the top of the screen until connection is restored.
* **Mic Permission Error:** Inline red text below the input field replacing the helper text: *"Microphone blocked. Please type your answer."*

## 45. Accessibility Design System

| ID | Requirement | Priority | Description | Validation |
| --- | --- | --- | --- | --- |
| UI-A11Y-01 | Touch Targets | MUST | All interactive elements must be minimum 44x44px. | Inspection |
| UI-A11Y-02 | Contrast | MUST | All text must meet WCAG AA (4.5:1) contrast against backgrounds. | Contrast checker |
| UI-A11Y-03 | Focus States | MUST | Keyboard navigation MUST trigger a highly visible 2px focus ring. | Tab navigation |
| UI-A11Y-04 | Color Independence | MUST | Error states MUST use icons/labels alongside color. | Grayscale visual check |

## 46. Motion and Animation System

* **Duration:** `150ms` for hover/focus states. `300ms` for chat bubble entering (slide up + fade in).
* **Easing:** `ease-out` for entering elements, `ease-in` for exiting.
* **Mic Pulse:** Subtle scale animation (1.0 to 1.1) looping every 1.5s.
* **Reduced Motion:** If `@media (prefers-reduced-motion: reduce)` is true, all animations default to 0ms (instant appearance).

## 47. Interaction-State Rules

* Every button and input MUST explicitly define `:hover`, `:focus-visible`, and `:disabled` CSS states mapped to the design tokens.

## 48. Dark-Mode Decision

| ID | Decision | Rationale | Source | Status |
| --- | --- | --- | --- | --- |
| UI-DEC-01 | Dark Mode Excluded from MVP | Reduces MVP CSS complexity and QA testing time. Beginner focus is on logic, not themeing. | UI/Design Decision | **Post-MVP** |

## 49. Responsive Component Rules

* **Header:** Text center-aligned on mobile, left-aligned on desktop.
* **Input Box:** Anchored to viewport bottom on mobile (`position: fixed` or `sticky`). On desktop, it sits at the bottom of the centered 768px chat column.

## 50. Design Token Naming Convention

Implementation should use a standard dot-notation naming structure translating directly to CSS variables:

* `--color-primary-default`
* `--spacing-4`
* `--radius-md`
* `--font-body-large`

## 51. Token-to-Implementation Mapping

* **Tailwind CSS (Recommended):** Tokens map cleanly to `tailwind.config.js`. (e.g., `text-primary-default`, `p-4`, `rounded-md`).
* **CSS Modules:** Tokens map to `:root` variables.

## 52. Component Variants

| ID | Component | Purpose | Variants | States | Responsive Behavior | Accessibility |
| --- | --- | --- | --- | --- | --- | --- |
| CMP-BTN | Button | Actions | Primary, Secondary, Icon | Default, Hover, Focus, Disabled | Full-width on mobile | `aria-label` for Icon |
| CMP-EVAL | Eval Card | Feedback | Success, Minor, Major, Invalid | Visible | Fills chat width | `role="alert" aria-live="polite"` |

## 53. Visual Hierarchy Rules

1. **Dominant:** The Marathi prompt and the Corrected English output.
2. **Secondary:** Primary action buttons (Submit, Next, Mic).
3. **Tertiary:** Grammar explanations, UI framing.
*Rule: Do not let UI chrome (headers, settings) overpower the center chat area.*

## 54. Beginner-Friendly Visual Language

* Avoid stark red (`#FF0000`).
* Avoid dense blocks of text. Explanations should have a `margin-bottom` to let them breathe.
* Icons should be soft, rounded, and literal.

## 55. Voice Accessibility Design

* The microphone is visually prominent, but a large text field is always visible right next to it.
* Voice instructions (e.g., "Speak now") must also appear as text in the input placeholder.

## 56. Representative UI Examples

**A. Major Error Correction Flow:**

```text
[AI Bubble - Gray bg]
Translate: मी काल गेलो.
[▶ Audio]

[Student Bubble - White bg, right aligned]
I go yesterday.

[Evaluation Card - Orange Top Border]
⚠️ चला हे दुरुस्त करूया. (Let's fix this)

Your answer: I go yesterday. (Strikethrough 'go')
Correction: I went yesterday. (Bold 'went')
[Badge: TENSE]

'Yesterday' टेल्स अस धिस हॅपन्ड इन द पास्ट, सो वी युज द पास्ट फॉर्म ‘went’.

[ Retry Button ] [ Next Button ]

```

## 57. Visual Consistency Rules

* All buttons MUST be 48px high.
* All cards MUST use `radius.md`. Chat bubbles MUST use `radius.lg`.
* No new hex colors may be introduced outside the defined token palette.

## 58. Design-System Governance

* Google Antigravity must strictly map all UI elements to these semantic tokens.
* Inline styles with arbitrary pixel values or hex codes are strictly prohibited.
* Any new UI component required during development must be composed of existing tokens.

## 59. UI Acceptance Criteria

| ID | Requirement Reference | Acceptance Criterion | Verification Method |
| --- | --- | --- | --- |
| UI-AC-01 | Typography | Both English and Marathi text render cleanly without clipping, using specified font weights. | Visual test across languages |
| UI-AC-02 | Input / STT | Transcribed text appears exactly like typed text in the input field. | Voice flow test |
| UI-AC-03 | Evaluation Cards | Correct, Minor Error, and Major Error cards use distinct icons and accent colors (Green, Amber, Orange). | Feedback flow test |
| UI-AC-04 | Responsive | Application centers at a max-width on desktop, and spans 100% width on mobile screens. | Viewport resize test |
| UI-AC-05 | A11y Contrast | All text passes WCAG AA minimum 4.5:1 ratio. | Automated accessibility tool |

## 60. UI Traceability

| UI Requirement | UX Requirement | PRD Requirement | Screen/Component | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| Editable STT UI | UX-REQ-02 | FR-010 | CMP-INPUT | UI-AC-02 |
| Minor/Major Visuals | Minor/Major UX | FR-013, FR-015 | CMP-EVAL | UI-AC-03 |
| Error Categories | Mistake History | FR-020 | Category Badge | (System Check) |

## 61. Implementation Handoff Rules

Future frontend documentation (Next.js/React architecture) must map this document's tokens into its styling solution (e.g., Tailwind configuration) before building components. No business logic belongs in the styling layer.

## 62. Design Recommendations and Decisions

| ID | Decision | Rationale | Source | Status |
| --- | --- | --- | --- | --- |
| UI-DEC-02 | Amber/Orange for Errors | Reduces beginner anxiety compared to standard UI reds. | UI Recommendation | Decided |
| UI-DEC-03 | Inline Chat Audio | Keeps the audio control contextually tied to the Marathi text, rather than a global app player. | UI Recommendation | Decided |

## 63. Assumptions

* The target devices (mobile and desktop) support standard web fonts (Google Fonts: Inter, Mukta).
* The browser supports CSS variables for dynamic token mapping.

## 64. Open UI Questions

| ID | Question | Why It Matters | Source | Status |
| --- | --- | --- | --- | --- |
| UI-OQ-01 | Should the "XP/Progress" bar stick to the top of the screen or scroll away? | Screen real estate on small mobile devices. | UI Design | Open |

## 65. Final Design-System Specification

This document establishes a complete, rigid visual framework tailored specifically for a beginner Marathi-to-English learner. By stripping away extraneous visual noise and enforcing semantic, accessible design tokens, it ensures the application remains an effective, calming educational tool that can be built flawlessly by AI coding agents.

## 66. UI Design-System Completion Checklist

* [x] Defined specific beginner-friendly visual philosophy.
* [x] Established typography rules accommodating Devanagari script.
* [x] Defined non-punitive semantic color system for evaluations.
* [x] Mapped Voice/STT interaction states to visual tokens.
* [x] Separated multiple valid translations UI from error correction UI.
* [x] Guaranteed WCAG AA accessibility rules (Contrast, Touch targets).
* [x] Ensured mobile-first responsiveness.
* [x] Included token naming convention for easy CSS/Tailwind mapping.
* [x] Ensured no technical code or secrets were exposed.