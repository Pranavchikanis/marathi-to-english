import { useState, useCallback, useRef, useEffect } from 'react'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const currentLangRef = useRef<string>('en');

  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioRef.current) {
      // Play a tiny silent payload to unlock autoplay on iOS/mobile Safari
      audioRef.current.src = 'data:audio/mp3;base64,//OigAAAAAAQQcQAAAQAACADcIADz//+//OAAD//+//OAAD';
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
      }).catch(() => {});
    }
  }, []);

  const playNextInQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      setIsPlaying(false);
      return;
    }
    const text = queueRef.current.shift()!;
    // Use the native voice for fluency (now that symbols are stripped, it should sound much better)
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${currentLangRef.current}`;
    
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.src = url;
    audio.onended = () => playNextInQueue();
    audio.onerror = () => playNextInQueue();
    
    audio.play().catch(e => {
      console.error("Audio playback failed", e);
      setIsPlaying(false); // Stop if browser blocks autoplay
    });
  }, []);

  const playAudio = useCallback((text: string, lang = 'en-IN') => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsPlaying(true);
    currentLangRef.current = lang.split('-')[0]; // google uses 'en' or 'mr'
    
    // Strip markdown formatting (bold, italic, code blocks, etc) so TTS doesn't read asterisks
    const cleanText = text.replace(/[*_#`~]/g, '');
    queueRef.current = [cleanText.trim()].filter(Boolean);
    playNextInQueue();
    
  }, [playNextInQueue]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    queueRef.current = [];
    setIsPlaying(false);
  }, []);

  return {
    playAudio,
    stopAudio,
    unlockAudio,
    isPlaying,
    isSupported: true
  }
}
