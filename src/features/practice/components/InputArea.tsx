import * as React from "react"
import { Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MicButton } from "@/components/ui/mic-button"
import { useSpeech } from "@/lib/speech/recognition"

interface InputAreaProps {
  draftText: string
  onDraftChange: (text: string) => void
  onSubmit: (text: string, modality: "TEXT" | "VOICE", rawTranscript?: string, wasEdited?: boolean) => void
  disabled?: boolean
  className?: string
}

export function InputArea({ draftText, onDraftChange, onSubmit, disabled, className }: InputAreaProps) {
  const { state: micState, transcript, error: micError, startRecording, stopRecording, reset, isSupported } = useSpeech('en-IN')
  const [wasEdited, setWasEdited] = React.useState(false)
  const [rawTranscript, setRawTranscript] = React.useState("")

  // Handle STT populating the draft text
  React.useEffect(() => {
    if (micState === 'PROCESSING' || micState === 'IDLE') {
      if (transcript && transcript !== rawTranscript) {
        setRawTranscript(transcript)
        onDraftChange(transcript)
        setWasEdited(false)
      }
    }
  }, [transcript, micState, onDraftChange, rawTranscript])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDraftChange(e.target.value)
    if (rawTranscript) {
      setWasEdited(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftText.trim() || disabled) return
    
    onSubmit(draftText, rawTranscript ? "VOICE" : "TEXT", rawTranscript || undefined, wasEdited)
    
    // Clear states
    setRawTranscript("")
    setWasEdited(false)
    reset()
  }

  const handleMicToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (micState === 'RECORDING') {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleClear = () => {
    onDraftChange("")
    setRawTranscript("")
    setWasEdited(false)
    reset()
  }

  const isRecording = micState === 'RECORDING' || micState === 'PROCESSING'

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn("bg-surface-default p-4 border-t border-border-default shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]", className)}
    >
      {micError && (
        <p className="text-status-recording text-sm mb-2 px-2">Microphone error: {micError}. Please type your answer.</p>
      )}
      
      <div className="flex items-end gap-3 max-w-3xl mx-auto w-full">
        {isSupported && (
          <div className="flex-shrink-0 mb-1">
            <MicButton 
              state={micState} 
              onClick={handleMicToggle} 
              type="button"
            />
          </div>
        )}
        
        <div className="relative flex-grow">
          <textarea
            value={draftText}
            onChange={handleTextChange}
            disabled={disabled || isRecording}
            placeholder={isRecording ? "Listening..." : isSupported ? "Type or tap mic to speak..." : "Type your translation here..."}
            className={cn(
              "w-full min-h-[56px] max-h-[120px] resize-none overflow-y-auto rounded-md border p-3 pr-10 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-default transition-all",
              disabled || isRecording ? "bg-secondary-default text-text-muted border-border-default" : "bg-surface-default border-border-default text-text-primary"
            )}
            rows={draftText.length > 50 ? 3 : 1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          {draftText && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-3 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary-default"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={!draftText.trim() || disabled || isRecording}
          className="flex-shrink-0 mb-1"
          aria-label="Submit answer"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {rawTranscript && !disabled && !isRecording && (
        <p className="text-xs text-text-secondary text-center mt-2">
          Review your text and press Submit.
        </p>
      )}
    </form>
  )
}
