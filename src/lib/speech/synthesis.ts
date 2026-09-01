import { useState, useCallback, useEffect } from 'react'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setIsSupported(false)
    }
  }, [])

  const playAudio = useCallback((text: string, lang = 'mr-IN') => {
    if (!isSupported) return
    
    window.speechSynthesis.cancel() // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9 // Slower for beginners

    // Try to find a specific voice for the language, fallback to Hindi if Marathi is missing
    const voices = window.speechSynthesis.getVoices()
    let voice = voices.find(v => v.lang === lang || v.lang.replace('_', '-') === lang)
    if (!voice && lang === 'mr-IN') {
      // Fallback to Hindi if Marathi isn't available (Devanagari script is readable by Hindi TTS)
      voice = voices.find(v => v.lang.startsWith('hi'))
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
