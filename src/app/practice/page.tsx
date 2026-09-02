"use client"

import * as React from "react"
import { usePracticeSession } from "@/features/practice/hooks/usePracticeSession"
import { ChatBubble } from "@/features/practice/components/ChatBubble"
import { InputArea } from "@/features/practice/components/InputArea"
import { EvaluationCard } from "@/features/practice/components/EvaluationCard"
import { SessionSummary } from "@/features/practice/components/SessionSummary"
import { ProgressBar } from "@/components/ui/progress-bar"
import { useToast } from "@/components/ui/toast"

export default function PracticePage() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const { state, submitAnswer, nextExercise, startSession, resumeSession, retryExercise } = usePracticeSession()
  const { addToast } = useToast()
  
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.status, (state as any).draftText, (state as any).evaluation])

  // Initialize session on mount
  const isInitializedRef = React.useRef(false)
  React.useEffect(() => {
    if (!isInitializedRef.current && state.status === 'NOT_STARTED') {
      isInitializedRef.current = true
      startSession().catch(console.error)
    }
  }, [state.status, startSession])

  // React to hook-level errors
  React.useEffect(() => {
    if (state.status === 'ERROR') {
      addToast(state.error || 'An error occurred.', 'error')
    }
  }, [state.status, (state as any).error, addToast])

  const [draft, setDraft] = React.useState("")

  const isFinished = state.status === 'COMPLETED'
  const isEvaluating = state.status === 'EVALUATING'
  const showEvaluation = state.status === 'EVALUATION_SUCCESS'
  const disableInput = isEvaluating || showEvaluation || isFinished

  const total = state.status === 'EXERCISE_READY' || state.status === 'EVALUATING' || state.status === 'EVALUATION_SUCCESS' 
    ? 10 // MVP default
    : 10
  
  const completed = state.status === 'COMPLETED' 
    ? state.summary.correct_exercises
    : (state.status === 'EXERCISE_READY' || state.status === 'EVALUATING')
    ? (state.currentExercise?.order_index || 0)
    : state.status === 'EVALUATION_SUCCESS'
    ? (state.currentExercise?.order_index || 0) + 1
    : 0
    
  const progressPercent = (completed / total) * 100

  const handleSubmit = async (text: string, modality: "TEXT" | "VOICE", rawTranscript?: string, wasEdited?: boolean) => {
    if (!navigator.onLine) {
      addToast('You are currently offline. Check your connection.', 'warning')
      return
    }

    const result = await submitAnswer(text, modality, rawTranscript, wasEdited)
    if (result && !(result as any).success) {
      // The hook will already revert state to EXERCISE_READY and pass the error back
      const errMessage = (result as any).error?.message || 'Failed to evaluate answer.'
      addToast(errMessage, 'error')
    } else {
      setDraft("") // clear draft on success
    }
  }

  const handleNext = () => {
    setDraft("")
    nextExercise()
  }

  const handleRetry = () => {
    retryExercise()
  }

  const handleDraftChange = (val: string) => {
    setDraft(val)
  }

  if (state.status === 'NOT_STARTED' || state.status === 'LOADING') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary animate-pulse">Loading your session...</p>
      </div>
    )
  }

  if (isFinished && state.status === 'COMPLETED') {
    return (
      <SessionSummary 
        summary={{
          totalXp: state.summary.xp_earned,
          exercisesCompleted: state.summary.total_exercises || 0,
          masteryUpgrades: state.summary.mastery_upgrades || 0
        }}
      />
    )
  }

  // To avoid TS errors for properties on union states:
  const currentExercise = (state.status === 'EXERCISE_READY' || state.status === 'EVALUATING' || state.status === 'EVALUATION_SUCCESS') 
    ? state.currentExercise 
    : null
    
  const evaluation = (state.status === 'EVALUATION_SUCCESS') ? state.evaluation : null

  return (
    <div className="flex-1 flex flex-col h-full bg-background-app relative">
      <div className="sticky top-0 z-10 w-full bg-surface-default shadow-sm">
        <ProgressBar progress={progressPercent} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* AI Prompt */}
          {currentExercise && (
            <ChatBubble 
              role="ai" 
              content={currentExercise.exercises?.marathi_prompt || "Translate this"} 
              showAudioControl={true}
              audioLang="mr-IN"
            />
          )}

          {/* Evaluating State */}
          {isEvaluating && (
            <div className="flex justify-end">
              <div className="bg-surface-default border border-border-default rounded-2xl rounded-br-md p-4 text-text-muted text-sm shadow-sm">
                Evaluating...
              </div>
            </div>
          )}

          {/* Student Answer */}
          {(isEvaluating || showEvaluation) && (
            <ChatBubble 
              role="student" 
              content={state.status === 'EVALUATING' ? state.attemptText : state.status === 'EVALUATION_SUCCESS' ? state.attemptText : draft || "..."}
              showAudioControl={false}
            />
          )}

          {/* Feedback Card */}
          {showEvaluation && evaluation && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <EvaluationCard 
                evaluation={evaluation}
                errors={state.status === 'EVALUATION_SUCCESS' ? state.errors : undefined}
                studentAnswer={state.attemptText}
                onNext={handleNext}
                onRetry={handleRetry}
              />
            </div>
          )}
          
          <div ref={scrollRef} className="h-4" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-20">
        <InputArea 
          draftText={draft}
          onDraftChange={handleDraftChange}
          onSubmit={handleSubmit}
          disabled={disableInput}
        />
      </div>
    </div>
  )
}
