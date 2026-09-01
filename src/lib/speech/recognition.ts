import { useState, useCallback, useEffect, useRef } from 'react'

export type SpeechState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'ERROR' | 'UNSUPPORTED'

export function useSpeech(language = 'en-IN') {
  const [state, setState] = useState<SpeechState>('IDLE')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = language

        recognitionRef.current.onstart = () => {
          setState('RECORDING')
          setError(null)
        }

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript
          }
          setTranscript(currentTranscript)
        }

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            console.warn('Speech recognition error:', event.error)
          }
          setError(event.error)
          setState('ERROR')
        }

        recognitionRef.current.onend = () => {
          setState('IDLE')
        }
      } else {
        setState('UNSUPPORTED')
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [language])

  const startRecording = useCallback(() => {
    if (recognitionRef.current && (state === 'IDLE' || state === 'ERROR')) {
      setTranscript('')
      setError(null)
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error("Could not start recognition:", e)
        setState('ERROR')
      }
    }
  }, [state])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && state === 'RECORDING') {
      recognitionRef.current.stop()
      setState('IDLE')
    }
  }, [state])
  
  const reset = useCallback(() => {
    setTranscript('')
    setError(null)
    setState('IDLE')
  }, [])

  return {
    state,
    transcript,
    error,
    startRecording,
    stopRecording,
    reset,
    isSupported: state !== 'UNSUPPORTED'
  }
}
