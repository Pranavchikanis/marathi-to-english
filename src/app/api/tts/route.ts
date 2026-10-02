import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'en';

  if (!text) {
    return new NextResponse('Text is required', { status: 400 });
  }

  try {
    // 1. Try Premium Azure TTS if API keys are configured
    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION;

    if (azureKey && azureRegion) {
      // Use AarohiNeural (Native Marathi voice). 
      // NeerjaNeural skipped Devanagari text entirely.
      const voiceName = 'mr-IN-AarohiNeural';
      const ssml = `<speak version='1.0' xml:lang='mr-IN'><voice xml:lang='mr-IN' name='${voiceName}'>${text}</voice></speak>`;

      const azureResponse = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
          'User-Agent': 'MarathiEnglishApp'
        },
        body: ssml
      });

      if (azureResponse.ok) {
        const audioBuffer = await azureResponse.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=31536000',
          }
        });
      } else {
        console.error('Azure TTS failed, falling back to Google. Status:', azureResponse.status);
      }
    }

    // 2. Fallback to Google Translate TTS
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    
    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'http://translate.google.com/'
      }
    });

    if (!response.ok) {
      console.error(`Google TTS failed with status: ${response.status}`);
      return new NextResponse('Failed to fetch TTS', { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache aggressively
      }
    });

  } catch (error) {
    console.error('TTS proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
