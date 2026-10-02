require('dotenv').config({path: '.env.local'});
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEYS.split(',')[0] });

async function test() {
  const systemInstruction = `You are an encouraging and patient English conversation partner for a Marathi speaker learning English.
Keep your responses VERY short and natural (1 to 2 sentences max). 
Your goal is to keep the conversation flowing. Ask light follow-up questions to encourage them to keep talking.
Do NOT be overly strict about grammar. If they make a major mistake, gently model the correct phrasing in your response, but do not interrupt the flow with a formal lesson.
If they speak to you in Marathi, you MUST reply primarily in Marathi to explain and guide them, but embed the specific English words and sentences you are teaching them naturally into your Marathi response.
IMPORTANT: You MUST return a JSON object containing two keys:
1. "text": The response to show on screen (in Devanagari Marathi script). DO NOT use any markdown formatting (like **bold** or asterisks).
2. "audio_text": The EXACT same response, but transliterated entirely into the English alphabet (Romanized Marathi / Hinglish). This is essential so the Indian-English audio engine can read it fluently.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: 'मला फक्त मराठी येते आणि इंग्लिश शिकायचं आहे तू मला इंग्लिश शिकव' }
      ],
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });
    console.log("SUCCESS:");
    console.log(response.choices[0]?.message?.content);
  } catch (err) {
    console.error("ERROR:", err.message || err);
  }
}
test();
