'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('App Route Error Boundary Caught:', error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-error-default/10 rounded-full flex items-center justify-center text-error-default mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <h2 className="text-xl font-semibold text-text-primary">
        Something went wrong
      </h2>
      
      <p className="text-text-secondary max-w-md">
        We encountered an unexpected error while loading this page. 
        Don't worry, your progress is safe.
      </p>

      <div className="pt-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
      </div>
    </div>
  )
}
