import { generateNextCurriculumTopic, generateInfiniteExercises } from './src/lib/ai/gemini';
import { env } from './src/config/env';

async function run() {
  console.log("Keys available:", env.GEMINI_API_KEYS ? env.GEMINI_API_KEYS.split(',').length : 0);
  try {
    console.log("Testing concept generation...");
    const topic = await generateNextCurriculumTopic([]);
    console.log("Topic generated:", topic);
    
    console.log("Testing exercise generation...");
    const exercises = await generateInfiniteExercises(topic.name, 2);
    console.log("Exercises generated:", exercises.length);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
