import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number // 0 to 100
}

export function ProgressBar({ progress, className, ...props }: ProgressBarProps) {
  return (
    <div
      className={cn("h-1 w-full overflow-hidden bg-secondary-default", className)}
      {...props}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary-default transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
