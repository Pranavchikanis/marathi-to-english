require('dotenv').config({path: '.env.local'});
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEYS.split(',')[0] });

async function test() {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log("SUCCESS:");
    console.log(response.choices[0]?.message?.content);
  } catch (err) {
    console.error("ERROR:", err.message || err);
  }
}
test();
