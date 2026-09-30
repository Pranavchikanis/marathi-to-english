import { useState, useCallback, useEffect } from 'react'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setIsSupported(false)
    }
  }, [])

  const playAudio = useCallback((text: string, lang = 'en-IN') => {
    if (!isSupported) return
    
    window.speechSynthesis.cancel() // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9 // Slower for beginners

    const voices = window.speechSynthesis.getVoices()
    
    // Respect the requested language first, preferring high quality neural voices
    let voice = voices.find(v => v.lang === lang && v.name.includes('Natural'))
             || voices.find(v => v.lang === lang && v.name.includes('Google'))
             || voices.find(v => v.lang === lang)
             || voices.find(v => v.lang.startsWith(lang.split('-')[0]))
             || (lang.startsWith('mr') ? voices.find(v => v.lang.startsWith('hi')) : undefined); // Fallback to Hindi for Marathi (since both use Devanagari script and Hindi is more commonly installed)
             
    // Fallback
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) || voices[0];
    }

    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn("Speech synthesis error:", e.error)
      }
      setIsPlaying(false)
    }

    setIsPlaying(true) // Synchronous update to prevent race conditions with auto-mic
    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  const stopAudio = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }, [isSupported])

  return {
    playAudio,
    stopAudio,
    isPlaying,
    isSupported
  }
}
