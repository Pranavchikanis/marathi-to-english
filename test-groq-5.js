require('dotenv').config({path: '.env.local'});
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEYS.split(',')[0] });

async function testGroq() {
  const systemInstruction = `You are an encouraging and patient English conversation partner for a Marathi speaker learning English.
Keep your responses VERY short and natural (1 to 2 sentences max). 
Your goal is to keep the conversation flowing. Ask light follow-up questions to encourage them to keep talking.
Do NOT be overly strict about grammar. If they make a major mistake, gently model the correct phrasing in your response, but do not interrupt the flow with a formal lesson.
If they speak to you in Marathi, you MUST reply primarily in Marathi to explain and guide them, but embed the specific English words and sentences you are teaching them naturally into your Marathi response.
IMPORTANT: DO NOT use any markdown formatting (like **bold**, italics, or asterisks) in your responses, as they will be read aloud by a Text-to-Speech engine which cannot pronounce symbols.`;

  console.log("Testing Groq AI generation...");
  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: 'मला मराठी येते आणि इंग्लिश शिकायचे मला इंग्लिश शिका' }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });
    console.log("SUCCESS! AI Response:");
    console.log(response.choices[0]?.message?.content);
  } catch (err) {
    console.error("Groq ERROR:", err.message || err);
  }
}
testGroq();
