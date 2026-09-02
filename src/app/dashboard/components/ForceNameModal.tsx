'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateDisplayName } from '../actions'

interface ForceNameModalProps {
  initialName: string
}

export function ForceNameModal({ initialName }: ForceNameModalProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // If the user already has a custom name, don't show the modal
  if (initialName !== 'Student') {
    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }

    setIsLoading(true)
    setError('')
    
    const res = await updateDisplayName(name)
    if (!res.success) {
      setError(res.error?.message || 'Failed to update name')
      setIsLoading(false)
    }
    // If successful, the page will revalidate and initialName will change, unmounting this modal automatically
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to the Platform! 🎉</CardTitle>
          <CardDescription className="text-base mt-2">
            Before you start practicing, please let us know what to call you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-text-secondary">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoFocus
                placeholder="e.g. Rahul, Priya..."
                className="w-full mt-1 p-3 border border-border-default rounded-md bg-surface-hover text-text-primary focus:border-primary-default focus:ring-1 focus:ring-primary-default outline-none transition-all"
                required
              />
              {error && <p className="text-status-error text-sm mt-1">{error}</p>}
            </div>
            <Button type="submit" className="w-full text-lg h-12" disabled={isLoading || name.trim().length < 2}>
              {isLoading ? 'Saving...' : 'Start Practicing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
