import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'en';

  if (!text) {
    return new NextResponse('Text is required', { status: 400 });
  }

  try {
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
