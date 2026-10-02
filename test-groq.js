require('dotenv').config({path: '.env.local'});
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEYS.split(',')[0] });
async function test() {
  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: 'You are an English tutor for a Marathi speaker. Reply in Marathi. Return JSON: { "text": "Marathi text (Devanagari) with English embedded", "audio_text": "The EXACT same sentence, but with all Marathi words transliterated to the English alphabet (Romanized/Hinglish)." }' },
      { role: 'user', content: 'I am struggling with grammar.' }
    ],
    response_format: { type: 'json_object' }
  });
  console.log(response.choices[0].message.content);
}
test();
