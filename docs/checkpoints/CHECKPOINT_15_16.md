# Checkpoint 15 & 16: UI/UX and Voice Implementation

## Objectives Completed
- **Phase 15 (UI/UX)**:
  - Configured Tailwind V4 global design tokens inside `globals.css`.
  - Configured Inter and Mukta fonts inside `layout.tsx`.
  - Built core UI primitives (`Button`, `Card`, `Badge`, `ProgressBar`, `MicButton`).
  - Built Practice UI components (`ChatBubble`, `InputArea`, `EvaluationCard`, `SessionSummary`).
  - Assembled main application pages (`/dashboard` and `/practice`) integrating with the `usePracticeSession` hook.
- **Phase 16 (Voice)**:
  - Built `useSpeech` React hook for browser-native STT (Speech-to-Text).
  - Built `usePlayback` React hook for browser-native TTS (Text-to-Speech).
  - Ensured STT transcription output populates the `InputArea` textarea where it can be manually edited before explicit submission.
  - Ensured no audio data is stored on the server.
  - Gracefully handled microphone permissions, unsupported browsers, and network failures with UI fallbacks.
  - Added unit tests for both voice hooks using `vitest` and `jsdom`.

## Adherence to Specifications
- **03_UX_SPECIFICATION.md**: Chat interface matches the conversational paradigm. UI states correctly lock input during evaluations.
- **04_UI_DESIGN_SYSTEM.md**: Semantic design tokens map accurately to Tailwind utility classes.
- **16_VOICE_SPEECH_SPECIFICATION.md**: Voice captures as text securely inside the client's sandbox. The final submitted text string remains the ultimate authority, isolating the learner from STT inaccuracies.

## Next Phase
Ready for Phase 17: Error Handling and Recovery.
