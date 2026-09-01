# 02 — Learning Curriculum Specification

## 1. Document Control

* **Document ID:** CURR-001
* **Document Name:** Tejaswini AI English Tutor - Learning Curriculum Specification
* **Version:** 1.0.0
* **Status:** APPROVED FOR IMPLEMENTATION
* **Product:** Web-based AI English Learning Application
* **Primary Learner:** Tejaswini
* **Owner:** Senior Language-Learning Curriculum Architect
* **Source of Truth:** This document is the authoritative specification for curriculum progression, grammar sequencing, and pedagogical rules for the application.

## 2. Curriculum Purpose

This curriculum bridges the gap between Tejaswini's native Marathi and practical, everyday English. It is specifically designed to transition a beginner learner from passive vocabulary recognition to active sentence construction through guided translation. The curriculum prioritizes confidence, conversational utility, and foundational grammar over academic linguistic complexity.

## 3. Curriculum Scope

The scope encompasses a strictly beginner-level (approx. CEFR A1 to early A2 equivalent) progression. It utilizes Marathi-to-English translation as the primary interaction mechanism, supports both text and voice dictation, and integrates a mistake-driven adaptive review system. Pronunciation scoring, complex branching dialogues, and advanced grammatical tenses (e.g., Past Perfect Continuous) are explicitly out of scope for this MVP.

## 4. Source Requirements and Pedagogical Basis

| ID | Requirement | Priority | Description | Validation |
| --- | --- | --- | --- | --- |
| REQ-C-01 | Sequence Preservation | MUST | The curriculum must follow the initial progression: 1. Pronouns+Be, 2. Simple Present, 3. Present Continuous, 4. Simple Past, 5. Simple Future, 6. Negatives, 7. Basic Questions, 8. Prepositions. | Review against Stage 1-8 outlines. |
| REQ-C-02 | Conversational Focus | MUST | The AI must use conversational Marathi and simple explanations. | Prompt rules exclude formal/academic jargon. |
| REQ-C-03 | Weakness Tracking | MUST | The system must track grammar/vocabulary weaknesses, repeated mistakes, and difficulty. | Matrix includes specific mistake triggers. |
| REQ-C-04 | Mini-Lessons | MUST | The system must step back and provide a mini-lesson when the student repeatedly fails. | Advancement rules specify step-back conditions. |
| REQ-C-05 | Session Structure | MUST | 10-15 min sessions: 2 warm-up, 5 core, 2 voice, 1 review. | Session curriculum defined accordingly. |
| REQ-C-06 | Pronunciation Exclusion | MUST | Pronunciation scoring remains outside the MVP. | Voice exercises target transcription only. |
| REQ-C-07 | Explanation Scaffolding | MUST | Explanations start in conversational Marathi and gradually mix English. | Explanation progression rules defined. |

## 5. Learner Profile

* **Name:** Tejaswini
* **Target Language:** English (Beginner)
* **Bridge Language:** Marathi (Native)
* **Learning Goal:** Formulate and translate everyday sentences with correct basic grammar; gain confidence in speaking (via dictation).
* **Pedagogical Needs:** High repetition, clear and brief explanations in Marathi, avoidance of cognitive overload, and a safe environment that handles technical/speech errors gracefully.

## 6. Curriculum Philosophy

1. **Beginner-First Progression:** Never introduce a grammatical concept before its prerequisites are mastered. Do not overwhelm with advanced grammar early.
2. **Mistake-Driven Reinforcement:** Errors are treated as data points for future exercise generation, not just immediate penalties.
3. **Semantic Equivalence Over Exact Matching:** Multiple valid English translations must be accepted.
4. **Gradual Scaffolding:** Move from isolated, short sentences to contextual, multi-clause conversational exchanges.
5. **High-Frequency Utility:** Vocabulary is selected based on daily practical use in a Marathi-speaking context, not arbitrary textbook lists.

## 7. Overall Curriculum Architecture

The curriculum is divided into 11 linear stages (0 through 10). Tejaswini must demonstrate sufficient mastery in a current stage before the AI generates prompts from the subsequent stage.

* **Stage 0:** Foundation / Diagnostic
* **Stage 1:** Pronouns and Be Verb
* **Stage 2:** Simple Present
* **Stage 3:** Present Continuous
* **Stage 4:** Simple Past
* **Stage 5:** Simple Future
* **Stage 6:** Negatives
* **Stage 7:** Basic Questions
* **Stage 8:** Prepositions
* **Stage 9:** Core Beginner Integration
* **Stage 10:** Everyday Beginner Conversation

## 8. Curriculum Stages

### 8.1 Stage 0 — Foundation / Diagnostic

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-00 |
| **Stage Name** | Foundation & System Introduction |
| **Purpose** | Introduce the UI, voice input, and establish baseline capability. |
| **Prerequisites** | None |
| **Grammar Concepts** | Basic nouns (book, pen), simple greetings (Hello, Thank you). |
| **Vocabulary Themes** | Greetings, basic UI terms (translate, speak). |
| **Sentence Patterns** | Single words, two-word phrases. |
| **Exercise Types** | Direct translation, voice translation introduction. |
| **Difficulty** | 1 (Very easy) |
| **Mastery Criteria** | Successfully completes 1 session using both text and voice. |
| **Advancement Rule** | Move to Stage 1 automatically after session completion. |

### 8.2 Stage 1 — Pronouns and Be Verb

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-01 |
| **Stage Name** | Pronouns + Be Verb |
| **Purpose** | Establish subject identity and states of being. |
| **Prerequisites** | Stage 0 |
| **Grammar Concepts** | I/you/he/she/it/we/they; am/is/are. Singular vs Plural. |
| **Vocabulary Themes** | Occupations, emotions, simple adjectives (happy, sad, student). |
| **Sentence Patterns** | I am [noun/adjective]. She is [noun/adjective]. |
| **Exercise Types** | Direct translation, Contrastive practice (I vs She). |
| **Difficulty** | 1 to 2 |
| **Common Mistakes** | Using "is" with "I" (I is happy); Missing article (I am student). |
| **Mastery Criteria** | 80% accuracy over 10 consecutive "Be" verb exercises. |
| **Advancement Rule** | Move to Stage 2 upon reaching Mastery Criteria. |

### 8.3 Stage 2 — Simple Present

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-02 |
| **Stage Name** | Simple Present (Habits and Routines) |
| **Purpose** | Express daily actions and factual states. |
| **Prerequisites** | Stage 1 |
| **Grammar Concepts** | Affirmative statements, 3rd person singular (s/es). |
| **Vocabulary Themes** | Daily routine (wake up, eat, go), frequency (every day, sometimes). |
| **Sentence Patterns** | I [verb] [object]. She [verb+s] [object]. |
| **Exercise Types** | Direct translation, Grammar-focused (3rd person singular). |
| **Difficulty** | 2 to 3 |
| **Common Mistakes** | Forgetting the 's' for he/she/it (She go to school). |
| **Mastery Criteria** | 80% accuracy on 3rd-person singular verbs. |
| **Advancement Rule** | Move to Stage 3 upon reaching Mastery Criteria. |

### 8.4 Stage 3 — Present Continuous

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-03 |
| **Stage Name** | Present Continuous |
| **Purpose** | Describe actions happening right now. |
| **Prerequisites** | Stage 1, Stage 2 |
| **Grammar Concepts** | am/is/are + verb-ing. Time markers (now, right now). |
| **Vocabulary Themes** | Current activities (studying, eating, playing). |
| **Sentence Patterns** | I am [verb-ing]. They are [verb-ing]. |
| **Exercise Types** | Contextual translation, Contrastive practice (Simple Present vs Continuous). |
| **Difficulty** | 2 to 3 |
| **Common Mistakes** | Dropping the Be verb (I eating); using simple present for 'now' context. |
| **Mastery Criteria** | 80% accuracy combining correct Be verb + ing form. |
| **Advancement Rule** | Move to Stage 4 upon reaching Mastery Criteria. |

### 8.5 Stage 4 — Simple Past

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-04 |
| **Stage Name** | Simple Past |
| **Purpose** | Discuss completed past events. |
| **Prerequisites** | Stage 2 |
| **Grammar Concepts** | Regular verbs (-ed), High-frequency irregular verbs (went, saw, ate). |
| **Vocabulary Themes** | Past time markers (yesterday, last week). |
| **Sentence Patterns** | I [past-verb] [object] [time]. |
| **Exercise Types** | Direct translation, Vocabulary-focused (irregular verbs). |
| **Difficulty** | 3 to 4 |
| **Common Mistakes** | Using present tense with "yesterday"; incorrect irregulars (goed, eated). |
| **Mastery Criteria** | Correct tense usage on 5 distinct irregular verbs and 5 regular verbs. |
| **Advancement Rule** | Move to Stage 5 upon reaching Mastery Criteria. |

### 8.6 Stage 5 — Simple Future

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-05 |
| **Stage Name** | Simple Future |
| **Purpose** | Express upcoming plans and intentions. |
| **Prerequisites** | Stage 2 |
| **Grammar Concepts** | will + base verb. (Note: 'going to' introduced later). |
| **Vocabulary Themes** | Future time markers (tomorrow, next week). |
| **Sentence Patterns** | I will [verb] [object]. |
| **Exercise Types** | Contextual translation. |
| **Difficulty** | 3 |
| **Common Mistakes** | will + ing (I will going); dropping will (I go tomorrow). |
| **Mastery Criteria** | 85% accuracy on future affirmative statements. |
| **Advancement Rule** | Move to Stage 6 upon reaching Mastery Criteria. |

### 8.7 Stage 6 — Negatives

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-06 |
| **Stage Name** | Negatives across Tenses |
| **Purpose** | Deny facts, habits, past events, and future plans. |
| **Prerequisites** | Stages 1 through 5 |
| **Grammar Concepts** | do not/don't, does not/doesn't, did not/didn't, will not/won't. |
| **Vocabulary Themes** | Preferences (dislikes), denying actions. |
| **Sentence Patterns** | I do not [verb]. She does not [verb]. I did not [verb]. |
| **Exercise Types** | Contrastive practice (Affirmative vs Negative). |
| **Difficulty** | 3 to 4 |
| **Common Mistakes** | "She doesn't goes" (double conjugation); "I no like". |
| **Mastery Criteria** | 80% accuracy resolving double-conjugation traps. |
| **Advancement Rule** | Move to Stage 7 upon reaching Mastery Criteria. |

### 8.8 Stage 7 — Basic Questions

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-07 |
| **Stage Name** | Basic Questions |
| **Purpose** | Inquire about facts, actions, and details. |
| **Prerequisites** | Stage 6 |
| **Grammar Concepts** | Yes/No questions (Do/Does/Is/Are), Wh- questions (What, Where, When, Who). |
| **Vocabulary Themes** | Interrogatives, conversational prompts. |
| **Sentence Patterns** | Do you [verb]? What are you [verb-ing]? Where did you [verb]? |
| **Exercise Types** | Conversational translation (answering and asking). |
| **Difficulty** | 4 |
| **Common Mistakes** | Incorrect word order (What you are doing?); missing auxiliary (You like tea?). |
| **Mastery Criteria** | 80% accuracy on question word order. |
| **Advancement Rule** | Move to Stage 8 upon reaching Mastery Criteria. |

### 8.9 Stage 8 — Prepositions

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-08 |
| **Stage Name** | Prepositions of Place and Time |
| **Purpose** | Add spatial and temporal detail to sentences. |
| **Prerequisites** | Stage 2 |
| **Grammar Concepts** | in, on, at, to, from, with, for. |
| **Vocabulary Themes** | Locations (home, work, table), times (morning, 5 PM). |
| **Sentence Patterns** | The [noun] is [preposition] the [noun]. I go [prep] [noun] [prep] [time]. |
| **Exercise Types** | Grammar-focused translation. |
| **Difficulty** | 4 to 5 |
| **Common Mistakes** | Translating Marathi postpositions literally (e.g., mixing in/on/at). |
| **Mastery Criteria** | Correct preposition use in 8/10 contextual exercises. |
| **Advancement Rule** | Move to Stage 9 upon reaching Mastery Criteria. |

### 8.10 Stage 9 — Core Beginner Integration

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-09 |
| **Stage Name** | Core Beginner Integration |
| **Purpose** | Mix all tenses, negatives, questions, and prepositions randomly. |
| **Prerequisites** | Stages 1-8 |
| **Grammar Concepts** | Integrated review. |
| **Exercise Types** | Review exercise, Conversational translation. |
| **Difficulty** | 5 |
| **Mastery Criteria** | Maintains >80% accuracy when topics are randomized. |
| **Advancement Rule** | Move to Stage 10 upon reaching Mastery Criteria. |

### 8.11 Stage 10 — Everyday Beginner Conversation

| Field | Specification |
| --- | --- |
| **Stage ID** | CURR-STG-10 |
| **Stage Name** | Everyday Conversation Contexts |
| **Purpose** | Translate based on situation rather than isolated sentences. |
| **Prerequisites** | Stage 9 |
| **Grammar Concepts** | Contextual sentence linking. |
| **Exercise Types** | Contextual translation. (e.g., "Imagine you are at a shop...") |
| **Difficulty** | 6 |
| **Mastery Criteria** | Consistent naturalness and semantic accuracy. |
| **Advancement Rule** | Represents completion of the beginner MVP curriculum. |

## 9. Grammar Progression

The grammar progression strictly adheres to the principle of "One major concept at a time."

1. **Identity/State:** Be verbs $\rightarrow$ Subject pronouns.
2. **Action/Habit:** Simple Present $\rightarrow$ 3rd Person Singular.
3. **Timeline Shift:** Present Continuous $\rightarrow$ Simple Past $\rightarrow$ Simple Future.
4. **Modification:** Negation of known tenses $\rightarrow$ Question inversion.
5. **Detailing:** Prepositions of place and time $\rightarrow$ Articles (a/an/the) layered implicitly through nouns.

## 10. Vocabulary Progression

Vocabulary is introduced thematically and repeated across grammar stages.

* **Theme 1 (Self/Home):** I, student, happy, house, family. (Stages 1-2)
* **Theme 2 (Daily Routine):** Wake up, eat, drink, work, sleep, school. (Stages 2-4)
* **Theme 3 (Time/Schedule):** Today, yesterday, tomorrow, morning, night. (Stages 3-5)
* **Theme 4 (Interactions):** Like, want, need, buy, play, talk. (Stages 6-8)
* **Reuse Strategy:** A new grammar concept (e.g., Simple Past) MUST be introduced using *already known* vocabulary (e.g., "I ate" instead of "I consumed").

## 11. Sentence Pattern Library

| ID | Pattern | Stage | Example Marathi | English Pattern | Common Errors |
| --- | --- | --- | --- | --- | --- |
| PAT-01 | Identity | 1 | मी एक डॉक्टर आहे. | I am a [noun]. | Dropping "a/an" |
| PAT-02 | Routine | 2 | मी दररोज शाळेत जाते. | I [verb] to [place] every day. | Omitting "to" |
| PAT-03 | 3rd Person | 2 | ती काम करते. | She [verb+s]. | Forgetting 's' |
| PAT-04 | Current | 3 | मी आता वाचत आहे. | I am [verb+ing] now. | Forgetting 'am' |
| PAT-05 | Past Event | 4 | मी काल चित्रपट पाहिला. | I [past verb] a [noun] yesterday. | Wrong past tense |
| PAT-06 | Negation | 6 | मला चहा आवडत नाही. | I do not like [noun]. | "I no like" |

## 12. Marathi → English Translation Progression

1. **Level 1 (Direct/Short):** One subject, one verb. ("मी जाते." $\rightarrow$ "I go.")
2. **Level 2 (Simple Object):** Subject, verb, object. ("मी सफरचंद खाते." $\rightarrow$ "I eat an apple.")
3. **Level 3 (Time/Tense):** Adding time markers. ("मी काल बाजारात गेले." $\rightarrow$ "I went to the market yesterday.")
4. **Level 4 (Negation/Variation):** Reversing known concepts. ("मी उद्या जाणार नाही." $\rightarrow$ "I will not go tomorrow.")
5. **Level 5 (Questions):** Inverting structure. ("तू काय करत आहेस?" $\rightarrow$ "What are you doing?")
6. **Level 6 (Contextual):** "तुझ्या मित्राला विचार की तो कुठे राहतो." $\rightarrow$ "Where do you live?"

## 13. Exercise Types

| ID | Exercise Type | Purpose | Applicable Stages | Usage Rules |
| --- | --- | --- | --- | --- |
| EXT-A | Direct Translation | Establish baseline meaning mapping. | 1-8 | Default exercise type. |
| EXT-B | Contextual Translation | Train semantic equivalence over literal translation. | 5-10 | Provide 1 sentence of Marathi context first. |
| EXT-C | Contrastive Practice | Highlight specific grammar rules (e.g., I vs She). | 2, 4, 6 | Present sentences back-to-back. |
| EXT-D | Voice Translation | Build speaking confidence and dictation skills. | All | 2 per session minimum. |
| EXT-E | Error Correction | Test recognition of common mistakes. | 6-10 | AI shows bad English; student fixes it. |
| EXT-F | Mini-Lesson | Remediate repeated failures. | All | Triggered by 3 consecutive concept failures. |

## 14. Difficulty Model

* **Difficulty 1:** Extremely familiar vocabulary, < 4 words, present tense.
* **Difficulty 2:** Familiar vocabulary, < 6 words, basic grammar variations.
* **Difficulty 3:** Introduction of new tense (past/future) OR new vocabulary (not both).
* **Difficulty 4:** Compound elements (Negative + Past tense + Time marker).
* **Difficulty 5:** Contextual/conversational prompts requiring semantic translation.
* **Difficulty 6:** Multi-turn conversational mapping.

## 15. Mastery Model

Mastery is NOT determined by a single correct answer.

| ID | Concept | Evidence Required | Mastery Condition | Review Trigger |
| --- | --- | --- | --- | --- |
| MAS-01 | Tense Rules | 5 correct translations of the target tense. | 80% accuracy over a 2-day period. | Falls below 60% in mixed reviews. |
| MAS-02 | Vocabulary | Used correctly in 3 different contexts. | Consistent successful retrieval. | Misused in a contextual exercise. |

## 16. Advancement Rules

* **Advance:** Student achieves the Mastery Condition for the current stage. The AI unlocks the next stage for exercise generation.
* **Maintain:** Student is between 50% and 79% accuracy. AI continues generating exercises at the current difficulty.
* **Step Back (Mini-Lesson):** If a student fails the same grammatical concept 3 times in a row, the AI pauses translation exercises, provides a direct explanatory mini-lesson in Marathi, and drops the difficulty by 1 level.

## 17. Mistake-Driven Learning

When Tejaswini makes an error, it is classified. Specific classifications trigger specific curriculum responses:

1. **Meaning Error (Wrong vocabulary):** Provide the correct word; queue a vocabulary review for the next session.
2. **Structural Error (Grammar):** Explain the rule in Marathi; immediately queue a *Contrastive Practice* exercise.
* *Example:* She types "She go". AI corrects to "She goes". Next exercise generated: "Translate: I go. Now translate: She goes."


3. **Typo/Spelling:** Correct it silently or note it gently without heavy pedagogical penalty.

## 18. Review and Repetition System

* **Warm-ups:** The first 2 exercises of every session MUST be drawn from previously mastered concepts (Stages below current).
* **Spaced Review:** If a concept was mastered 5 sessions ago, it is forcibly injected into the current session's core practice.
* **Same-Session Reattempt:** If Tejaswini makes a major error on question #4, a variation of that concept MUST reappear around question #9.

## 19. Session-Level Curriculum

A standard session (approx. 10-15 minutes) guarantees balanced cognitive load.

1. **Interaction 1-2 (Warm-up):** Difficulty 1-2, previously mastered concepts. Text or Voice.
2. **Interaction 3-5 (Core Practice):** Target stage concepts. Difficulty matches current mastery level. Text input.
3. **Interaction 6 (Voice Translation):** Target stage concept, but text input is disabled. Must use Voice.
4. **Interaction 7 (Voice Translation):** Conversational prompt. Must use Voice.
5. **Interaction 8-9 (Targeted Review):** Based on mistakes made in interactions 3-5.
6. **Interaction 10 (Confidence Builder):** Easy/Moderate exercise to end on a positive note.
7. **Summary:** XP display and conversational Marathi encouragement.

## 20. Voice Learning Progression

* **Phase 1 (Comfort):** Voice exercises use simple, short sentences to ensure high success rates with the speech-to-text engine.
* **Phase 2 (Correction):** Student learns to review the transcription and manually edit misheard words before submitting.
* **Phase 3 (Fluency prep):** Longer sentences where the student must speak fluidly to prevent the microphone from auto-stopping.
* *Note:* Pronunciation scoring is excluded from the MVP. The goal is transcription accuracy and speaking confidence.

## 21. Conversational Progression

* **Stages 1-6:** Focus on isolated sentence translation.
* **Stages 7-8:** Focus on Q&A pairs (AI asks Marathi question, student answers in English).
* **Stages 9-10:** Roleplay context. AI: *"Imagine you are at a restaurant and want water. Say it in English."* $\rightarrow$ Student: *"I want water, please."*

## 22. Marathi Explanation Progression

* **Stages 0-3:** Explanations are 100% conversational Marathi. (e.g., *"ती (She) बद्दल बोलताना क्रियापदाला नेहमी ‘s’ लावतात."*)
* **Stages 4-7:** Introduce English grammatical terms gently in brackets. (e.g., *"भूतकाळात (Past Tense) आपण ‘go’ ऐवजी ‘went’ वापरतो."*)
* **Stages 8-10:** Gradually shift to simple English explanations with Marathi support for complex parts.

## 23. Curriculum Content Model

The backend curriculum database/concept model conceptualizes data as follows (Implementation-agnostic):

* `concept_id`: Unique identifier (e.g., `CURR-CON-PRES-CONT`).
* `stage`: The numerical stage (e.g., `3`).
* `prerequisites`: Array of required `concept_id`s.
* `learning_objective`: String describing the goal.
* `allowed_vocabulary_tags`: Tags limiting which words the AI can use.
* `grammar_rules_marathi`: The explicit rule the AI uses to formulate its explanations.
* `mastery_threshold`: Float (e.g., `0.8`).

## 24. AI Exercise-Generation Rules

When the Gemini API generates an exercise, it MUST obey these curriculum constraints:

1. **Prerequisite Check:** Do not generate sentences requiring "Past Tense" if the student is currently in Stage 2.
2. **Vocabulary Restraint:** Do not use obscure words (e.g., "automobile", "beverage") when high-frequency words ("car", "drink") are available.
3. **Semantic Tolerance:** When evaluating, accept multiple valid translations (e.g., "I have to go" / "I need to go" / "I want to go" for *"मला जायचे आहे"* depending on context).
4. **Cultural Relevance:** Generate situations relevant to a learner in Maharashtra, India.
5. **No Ambiguity Traps:** Do not generate Marathi sentences with intentional double meanings unless testing contextual translation in Stage 10.

## 25. Curriculum Quality Standards

All AI-generated exercises must pass these internal validation checks:

* **Natural Marathi:** Is this how people actually speak? (Avoid rigid textbook Marathi).
* **Clear Target:** Does this sentence test exactly ONE primary grammatical concept?
* **Fairness:** Can a beginner realistically translate this without guessing idioms?

## 26. Stage-by-Stage Example Exercises

### Stage 2 Example (Simple Present)

* **Marathi Prompt:** "मी दररोज शाळेत जाते."
* **Expected English:** "I go to school every day."
* **Objective:** 1st person simple present + frequency modifier.
* **Typical Mistake:** "I am go to school every day."
* **AI Correction (Marathi):** *"‘I’ सोबत रोजच्या सवयींबद्दल बोलताना 'am' वापरण्याची गरज नाही. फक्त 'I go' म्हणा."*

### Stage 4 Example (Simple Past)

* **Marathi Prompt:** "मी काल चित्रपट पाहिला."
* **Expected English:** "I watched a movie yesterday." / "I saw a movie yesterday." (Both valid).
* **Objective:** Irregular/Regular past tense verbs.
* **Typical Mistake:** "I watch movie yesterday."
* **AI Correction (Marathi):** *"भूतकाळात (काल) घडलेल्या गोष्टीसाठी 'watch' ला 'ed' लावून 'watched' करा."*

## 27. Curriculum Advancement Matrix

| Stage | Concepts | Prerequisites | Mastery Threshold | Advancement Rule | Review Rule |
| --- | --- | --- | --- | --- | --- |
| 1 | Pronouns + Be | None | 80% accuracy | Unlock Stage 2 | Add to Warm-up |
| 2 | Simple Present | Stage 1 | 80% accuracy | Unlock Stage 3 | Contrast with Continuous |
| 3 | Present Cont. | Stage 1, 2 | 80% accuracy | Unlock Stage 4 | Contrast with Simple |
| 4 | Simple Past | Stage 2 | 5 correct usages | Unlock Stage 5 | Periodic injection |
| 5 | Simple Future | Stage 2 | 85% accuracy | Unlock Stage 6 | Contextual review |

## 28. Beginner Error-Priority Framework

Not all errors carry the same pedagogical weight. The AI must prioritize corrections based on this framework:

1. **Critical Meaning Errors (Remediate immediately):** Using the wrong verb, completely wrong tense (Past vs Future).
2. **Major Grammar Errors (Correct and explain):** Subject-verb agreement (She go), missing auxiliary (What you doing?).
3. **Minor Grammar Errors (Correct gently, no mini-lesson):** Missing articles (I ate apple), slight preposition errors (in the table vs on the table).
4. **Naturalness Issues (Accept as valid, suggest better):** "I take my food" $\rightarrow$ Acceptable, but suggest "I eat my food."
5. **Spelling Issues (Silent correction):** "I wached a movie."

## 29. Adaptive Learning Boundaries

* **What Adapts:** The specific vocabulary used in prompts, the frequency of concept review, the difficulty level (1-6) of the generated sentence, the triggering of mini-lessons.
* **What Remains Stable:** The 1-10 Stage sequence, the grammatical rules, the learning objectives, the foundational prerequisites. The system CANNOT skip Stage 4 and jump to Stage 7 just because the learner is doing well.

## 30. Curriculum Completion Definition

Upon completing Stage 10 of this curriculum, Tejaswini will NOT be a fluent English speaker. Instead, successful completion is defined as:

* Ability to accurately translate common beginner thoughts from Marathi to English.
* Ability to form basic affirmative, negative, and interrogative sentences across past, present, and future tenses.
* Reduction in critical recurring mistakes (e.g., Subject-Verb agreement).
* Demonstrated confidence in using voice input to dictate English sentences.

## 31. Curriculum Testing Requirements

Before final deployment, the curriculum generation prompts must be tested against:

* **Multiple-Valid-Answer Tests:** Ensure the AI grades "I have to go" and "I need to go" equally for appropriate Marathi prompts.
* **Mistake-Remediation Tests:** Simulate a user typing "He play" three times to verify the mini-lesson step-back logic triggers correctly.
* **Difficulty Validation:** Ensure Stage 1 generated prompts do not accidentally contain Stage 8 prepositions.

## 32. Curriculum Traceability

All downstream specifications (Database, Prompt Design, Tests) must reference these IDs:

* `CURR-STG-XXX` (Stages)
* `PAT-XXX` (Sentence Patterns)
* `EXT-XXX` (Exercise Types)
* `MAS-XXX` (Mastery Models)

## 33. Assumptions

| ID | Assumption | Status | Impact |
| --- | --- | --- | --- |
| ASM-C-01 | Tejaswini has no prior formal English grammar training that necessitates skipping Stages 1-3. | ASSUMED | If false, a placement test feature may be needed. |
| ASM-C-02 | The Web Speech API will adequately transcribe Indian-accented beginner English. | ASSUMED | If false, voice exercises will cause frustration. |

## 34. Open Questions

| ID | Question | Why It Matters | Status |
| --- | --- | --- | --- |
| OQ-C-01 | Should vocabulary sets be hardcoded, or dynamically generated by Gemini based on Tejaswini's interests? | Affects database schema and prompt complexity. | Open |
| OQ-C-02 | Exactly how many XP points are awarded for a Mastered concept vs a Failed concept? | Required for gamification balancing. | Open |

## 35. Final Curriculum Specification

This document establishes the comprehensive pedagogical foundation for the AI English Tutor. It translates the raw grammatical requirements into a structured, executable curriculum that safely guides a beginner Marathi speaker toward English competence through progressive translation, mistake-driven review, and conversational AI scaffolding.

## 36. Curriculum Completion Checklist

* [x] Specifically designed for Tejaswini (Beginner, Marathi native).
* [x] Marathi-to-English translation established as core mechanism.
* [x] Voice exercises incorporated without pronunciation scoring.
* [x] 8 foundational architecture concepts preserved and expanded.
* [x] Strict prerequisite staging defined (Beginner-first).
* [x] Mistake-driven learning and step-back mini-lessons defined.
* [x] Semantic equivalence (multiple valid translations) mandated.
* [x] AI exercise-generation constraints established.