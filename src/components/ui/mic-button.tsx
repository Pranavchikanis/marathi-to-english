import * as React from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { SpeechState } from "@/lib/speech/recognition"

interface MicButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'state'> {
  state: SpeechState
}

export function MicButton({ state, className, ...props }: MicButtonProps) {
  const isDisabled = state === "UNSUPPORTED"

  return (
    <Button
      variant="icon"
      size="icon"
      className={cn(
        "rounded-full h-14 w-14 transition-all duration-300",
        state === "IDLE" && "bg-primary-default text-surface-default hover:bg-primary-hover shadow-md",
        state === "RECORDING" && "bg-status-recording text-surface-default shadow-[0_0_0_4px_rgba(239,68,68,0.3)] animate-pulse",
        state === "PROCESSING" && "bg-secondary-default text-text-secondary cursor-wait",
        isDisabled && "bg-secondary-default text-text-muted opacity-50 cursor-not-allowed",
        className
      )}
      disabled={state === "PROCESSING" || isDisabled}
      aria-label={state === "RECORDING" ? "Stop recording" : "Start recording"}
      {...props}
    >
      {state === "IDLE" || isDisabled ? (
        <Mic className="h-6 w-6" />
      ) : state === "RECORDING" ? (
        <Square className="h-5 w-5 fill-current" />
      ) : (
        <Loader2 className="h-6 w-6 animate-spin" />
      )}
    </Button>
  )
}
