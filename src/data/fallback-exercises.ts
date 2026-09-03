export const FALLBACK_EXERCISES = [
  {
    marathi_prompt: "मी डॉक्टर आहे.",
    reference_translations: ["I am a doctor.", "I'm a doctor."],
    difficulty_level: 1,
    concepts: [{ name: "Simple Present Tense (To Be)", description: "Using am/is/are correctly" }]
  },
  {
    marathi_prompt: "तू काय करतोस?",
    reference_translations: ["What do you do?"],
    difficulty_level: 2,
    concepts: [{ name: "Present Continuous Tense", description: "Asking questions in present continuous" }]
  },
  {
    marathi_prompt: "तो दररोज शाळेत जातो.",
    reference_translations: ["He goes to school every day.", "He goes to school daily."],
    difficulty_level: 2,
    concepts: [{ name: "Simple Present Tense", description: "Habitual actions" }]
  },
  {
    marathi_prompt: "मला सफरचंद आवडतात.",
    reference_translations: ["I like apples.", "I love apples."],
    difficulty_level: 1,
    concepts: [{ name: "Simple Present Tense", description: "Expressing likes/dislikes" }]
  },
  {
    marathi_prompt: "ती काल बाजारात गेली.",
    reference_translations: ["She went to the market yesterday."],
    difficulty_level: 2,
    concepts: [{ name: "Simple Past Tense", description: "Completed actions in the past" }]
  },
  {
    marathi_prompt: "आम्ही क्रिकेट खेळत आहोत.",
    reference_translations: ["We are playing cricket.", "We're playing cricket."],
    difficulty_level: 1,
    concepts: [{ name: "Present Continuous Tense", description: "Actions happening right now" }]
  },
  {
    marathi_prompt: "तुझे नाव काय आहे?",
    reference_translations: ["What is your name?", "What's your name?"],
    difficulty_level: 1,
    concepts: [{ name: "Basic Greetings", description: "Asking for a name" }]
  },
  {
    marathi_prompt: "मी उद्या मुंबईला जाईन.",
    reference_translations: ["I will go to Mumbai tomorrow.", "I shall go to Mumbai tomorrow."],
    difficulty_level: 3,
    concepts: [{ name: "Simple Future Tense", description: "Future plans" }]
  },
  {
    marathi_prompt: "त्याने पाणी प्यायले.",
    reference_translations: ["He drank water.", "He drank the water."],
    difficulty_level: 2,
    concepts: [{ name: "Simple Past Tense", description: "Completed actions in the past" }]
  },
  {
    marathi_prompt: "ते खूप आनंदी आहेत.",
    reference_translations: ["They are very happy.", "They're very happy."],
    difficulty_level: 1,
    concepts: [{ name: "Adjectives & State of Being", description: "Describing emotions" }]
  }
];

// Returns a random exercise formatted to match DB schema
export function getRandomFallbackExercise(conceptId: string) {
  const randomEx = FALLBACK_EXERCISES[Math.floor(Math.random() * FALLBACK_EXERCISES.length)];
  return {
    concept_id: conceptId,
    marathi_prompt: randomEx.marathi_prompt,
    reference_translations: randomEx.reference_translations,
    difficulty_level: randomEx.difficulty_level
  };
}
