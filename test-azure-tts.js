require('dotenv').config({path: '.env.local'});
const fs = require('fs');

async function testAzure() {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;
  
  if (!azureKey || !azureRegion) {
    console.error("Missing Azure Keys");
    return;
  }

  console.log("Testing Azure TTS with region:", azureRegion);
  const ssml = `<speak version='1.0' xml:lang='mr-IN'><voice xml:lang='mr-IN' name='mr-IN-AarohiNeural'>नमस्कार, मी मराठी बोलते!</voice></speak>`;

  try {
    const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'MarathiEnglishApp'
      },
      body: ssml
    });

    console.log("Response Status:", response.status);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log("SUCCESS! Audio buffer size:", buffer.byteLength, "bytes");
    } else {
      console.log("FAILED!", await response.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
testAzure();
