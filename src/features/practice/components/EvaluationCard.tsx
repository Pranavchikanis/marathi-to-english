import * as React from "react"
import { CheckCircle2, Info, AlertTriangle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Evaluation } from "@/features/practice/types/state.types"

interface EvaluationCardProps {
  evaluation: Evaluation
  studentAnswer: string
  errors?: string[]
  onNext: () => void
  onRetry: () => void
  className?: string
}

export function EvaluationCard({ evaluation, studentAnswer, errors, onNext, onRetry, className }: EvaluationCardProps) {
  const { grade, explanationMarathi, correctedText, alternativeValidTranslations } = evaluation

  // Map grade to semantic state
  const isSuccess = grade === 'A' || grade === 'B'
  const isMinorError = grade === 'C'
  const isMajorError = grade === 'D' || grade === 'E'
  const isInvalid = grade === 'F'

  let accentColor = "border-status-success"
  let Icon = CheckCircle2
  let title = "बरोबर!" // Correct
  
  if (grade === 'A') {
    title = "अगदी बरोबर!" // Absolutely correct
  } else if (isMinorError || grade === 'B') {
    accentColor = "border-status-minor"
    Icon = Info
    title = grade === 'B' ? "बरोबर, पण..." : "जवळपास बरोबर!" // Correct but... / Almost correct!
  } else if (isMajorError) {
    accentColor = "border-status-major"
    Icon = AlertTriangle
    title = "चला हे दुरुस्त करूया." // Let's fix this.
  } else if (isInvalid) {
    accentColor = "border-border-default"
    Icon = HelpCircle
    title = "मला समजले नाही." // I didn't understand.
  }

  return (
    <Card className={cn("w-full border-t-4 shadow-md", accentColor, className)} role="alert" aria-live="polite">
      <CardContent className="pt-4 pb-4 px-5">
        <div className="flex items-center gap-3 mb-4">
          <Icon className={cn("h-6 w-6", 
            isSuccess && "text-status-success",
            isMinorError && "text-status-minor",
            isMajorError && "text-status-major",
            isInvalid && "text-text-muted"
          )} />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        {/* Correction Block */}
        {(isMinorError || isMajorError) && correctedText && (
          <div className="mb-4 space-y-1 p-3 bg-secondary-default rounded-md">
            <p className="text-text-muted line-through">{studentAnswer}</p>
            <p className="text-text-primary font-bold text-lg">{correctedText}</p>
          </div>
        )}

        {/* Categories */}
        {errors && errors.length > 0 && !isInvalid && (
          <div className="flex flex-wrap gap-2 mb-3">
            {errors.map((err: string) => (
              <Badge key={err} variant="default">{err.replace(/_/g, ' ')}</Badge>
            ))}
          </div>
        )}

        {/* Explanation */}
        {explanationMarathi && (
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            {explanationMarathi}
          </p>
        )}

        {/* Alternative Answers */}
        {alternativeValidTranslations && alternativeValidTranslations.length > 0 && !isMajorError && !isInvalid && (
          <div className="mb-4 p-3 border border-border-default rounded-md bg-background-app">
            <p className="text-xs text-text-secondary mb-1">Another natural way to say this:</p>
            <p className="text-sm font-medium">{alternativeValidTranslations[0]}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-default">
          {isMajorError ? (
            <>
              <Button variant="secondary" onClick={onNext}>Skip</Button>
              <Button variant="default" onClick={onRetry}>Retry</Button>
            </>
          ) : isInvalid ? (
            <Button variant="default" onClick={onRetry}>Try Again</Button>
          ) : (
            <Button variant="default" onClick={onNext}>Next</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
