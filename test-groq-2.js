require('dotenv').config({path: '.env.local'});
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEYS.split(',')[0] });

async function test() {
  try {
    const response = await groq.models.list();
    console.log("Active models:");
    response.data.forEach(m => console.log(m.id));
  } catch (err) {
    console.error("ERROR:", err.message || err);
  }
}
test();
