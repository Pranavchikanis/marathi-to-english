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
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${currentLangRef.current}&client=tw-ob`;
    
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
    
    // Split into chunks of max 150 chars by punctuation to respect Google TTS limits
    const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Further split any overly long chunks
    const finalChunks: string[] = [];
    chunks.forEach(chunk => {
      if (chunk.length > 150) {
        const subchunks = chunk.match(/.{1,150}(\s|$)/g) || [chunk];
        finalChunks.push(...subchunks.map(s => s.trim()).filter(Boolean));
      } else {
        finalChunks.push(chunk.trim());
      }
    });

    queueRef.current = finalChunks.filter(Boolean);
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
