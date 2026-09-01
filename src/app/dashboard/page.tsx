import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let studentName = "Student";
  let totalXp = 0;
  let streak = 0;

  if (user) {
    const { data: student } = await (supabase.from('students') as any)
      .select('display_name, total_xp, current_streak')
      .eq('auth_user_id', user.id)
      .single();

    if (student) {
      studentName = student.display_name || "Student";
      totalXp = student.total_xp || 0;
      streak = student.current_streak || 0;
    }
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <header className="w-full mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold mb-2">Welcome {studentName}!</h1>
        <p className="text-text-secondary">Ready to practice your English today?</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-semibold uppercase">Current Streak</p>
              <p className="text-3xl font-bold text-status-major">{streak} Days</p>
            </div>
            <Flame className="h-10 w-10 text-status-major opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-semibold uppercase">Total XP</p>
              <p className="text-3xl font-bold text-primary-default">{totalXp}</p>
            </div>
            <Trophy className="h-10 w-10 text-primary-default opacity-80" />
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-2xl text-center space-y-6">
        <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px] text-lg rounded-full">
          <Link href="/practice">
            Start Practice
          </Link>
        </Button>
        
        <p className="text-sm text-text-muted">
          Your daily plan includes 10 translation exercises.
        </p>
      </div>
    </div>
  )
}
