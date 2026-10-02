require('dotenv').config({path: '.env.local'});
const fs = require('fs');

async function testAzure() {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;

  const ssml = `<speak version='1.0' xml:lang='en-IN'><voice xml:lang='en-IN' name='en-IN-NeerjaNeural'>मी grammar मध्ये अडचणीत आहे, पण थोडा सराव आणि लक्ष केंद्रित केल्यास सुधारू शकतो. What do you think?</voice></speak>`;

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

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      fs.writeFileSync('test-neerja.mp3', Buffer.from(buffer));
      console.log("SUCCESS! Saved test-neerja.mp3");
    } else {
      console.log("FAILED!", await response.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
testAzure();
