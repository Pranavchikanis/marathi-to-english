import * as React from "react"
import { PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

interface SessionSummaryProps {
  summary: {
    totalXp: number
    exercisesCompleted: number
    masteryUpgrades: number
  }
}

export function SessionSummary({ summary }: SessionSummaryProps) {
  const router = useRouter()

  React.useEffect(() => {
    // Play sound
    import('@/lib/utils/audio').then(({ playCompletionSound }) => {
      playCompletionSound();
    }).catch(e => console.error('Failed to load audio utils', e));

    // Trigger confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
      <Card className="w-full max-w-md text-center shadow-md">
        <CardHeader className="pb-2">
          <div className="mx-auto bg-primary-default/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <PartyPopper className="h-8 w-8 text-primary-default" />
          </div>
          <CardTitle className="text-2xl font-bold">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-text-secondary">
            Great job! You've completed {summary.exercisesCompleted} exercises today.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary-default p-4 rounded-md">
              <p className="text-3xl font-bold text-primary-default">+{summary.totalXp}</p>
              <p className="text-xs text-text-secondary uppercase font-semibold mt-1">XP Gained</p>
            </div>
            <div className="bg-secondary-default p-4 rounded-md">
              <p className="text-3xl font-bold text-status-success">{summary.masteryUpgrades}</p>
              <p className="text-xs text-text-secondary uppercase font-semibold mt-1">Mastery Upgrades</p>
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            size="lg"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
