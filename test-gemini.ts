import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

import { GoogleGenAI } from '@google/genai';

async function testGemini() {
  console.log("Testing Gemini API connection...");
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Respond with the word OK if you receive this.'
    });

    console.log(`\n✅ API is working perfectly! Responded with: "${response.text}"`);
  } catch (err: any) {
    console.error("API Error caught:", err);
    if (err.status === 503 || err.message?.includes('503')) {
      console.log("\n❌ The 503 Service Unavailable error is still present on Google's side.");
    }
  }
}

testGemini();
