import * as React from "react"
import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlayback } from "@/lib/speech/synthesis"
import { Button } from "@/components/ui/button"

interface ChatBubbleProps {
  role: "ai" | "student"
  content: string
  showAudioControl?: boolean
  audioLang?: "mr-IN" | "en-IN"
  className?: string
}

export function ChatBubble({ role, content, showAudioControl, audioLang = "mr-IN", className }: ChatBubbleProps) {
  const { playAudio, stopAudio, isPlaying, isSupported } = usePlayback()

  const handleAudioToggle = () => {
    if (isPlaying) {
      stopAudio()
    } else {
      playAudio(content, audioLang)
    }
  }

  return (
    <div className={cn("flex w-full", role === "student" ? "justify-end" : "justify-start", className)}>
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl p-4 shadow-sm",
          role === "ai" 
            ? "rounded-bl-md bg-secondary-default text-text-primary" 
            : "rounded-br-md bg-surface-default border border-border-default text-text-primary"
        )}
      >
        {role === "ai" && (
          <p className="text-xs text-text-secondary mb-1">Translate this sentence:</p>
        )}
        
        <div className="flex items-start gap-3">
          <p className={cn(
            role === "ai" ? "text-lg font-bold" : "text-base font-normal",
            "leading-relaxed"
          )}>
            {content}
          </p>

          {showAudioControl && isSupported && (
            <Button
              variant="icon"
              size="icon"
              className="mt-[-4px] flex-shrink-0"
              onClick={handleAudioToggle}
              aria-label={isPlaying ? "Stop audio" : "Play audio"}
            >
              {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
