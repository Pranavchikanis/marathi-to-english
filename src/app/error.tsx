'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    if (error.message !== 'ACCOUNT_PENDING_APPROVAL') {
      console.error('App Route Error Boundary Caught:', error)
    }
  }, [error])

  if (error.message === 'ACCOUNT_PENDING_APPROVAL') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-surface-default p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-interactive-default/10 rounded-full flex items-center justify-center text-interactive-default mb-4 shadow-sm">
          <Clock className="w-10 h-10" />
        </div>
        
        <h2 className="text-3xl font-bold text-text-primary">
          Pending Admin Approval
        </h2>
        
        <p className="text-text-secondary max-w-md text-lg">
          Your account has been created successfully! However, you need to wait for an administrator to approve your account before you can start practicing.
        </p>

        <div className="pt-6">
          <Button onClick={() => window.location.href = '/login'} variant="secondary" className="mr-4">
            Sign In with different account
          </Button>
          <Button onClick={() => reset()} variant="default">
            Check Status
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center text-status-error mb-4">
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
