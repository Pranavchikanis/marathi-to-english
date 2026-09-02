'use client'

import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { updateDisplayName } from '../actions'

interface NameEditorProps {
  initialName: string
}

export function NameEditor({ initialName }: NameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (name.trim() === initialName) {
      setIsEditing(false)
      return
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    setIsLoading(true)
    setError('')
    const res = await updateDisplayName(name)
    if (res.success) {
      setIsEditing(false)
    } else {
      setError(res.error?.message || 'Failed to update name')
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setName(initialName)
      setIsEditing(false)
      setError('')
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col items-center sm:items-start mb-2 space-y-1">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">Welcome </h1>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoFocus
            className="text-3xl font-bold bg-surface-hover border-b-2 border-primary-default outline-none w-48 focus:border-primary-hover px-1"
          />
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="p-1.5 text-status-success hover:bg-status-success/10 rounded-full transition-colors disabled:opacity-50"
            title="Save Name"
          >
            <Check size={24} />
          </button>
          <button 
            onClick={() => {
              setName(initialName)
              setIsEditing(false)
              setError('')
            }} 
            disabled={isLoading}
            className="p-1.5 text-text-secondary hover:bg-surface-hover rounded-full transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X size={24} />
          </button>
        </div>
        {error && <span className="text-sm text-status-error">{error}</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center sm:justify-start mb-2 group">
      <h1 className="text-3xl font-bold">Welcome {initialName}!</h1>
      <button 
        onClick={() => setIsEditing(true)}
        className="ml-3 p-1.5 text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-primary-default hover:bg-primary-default/10 rounded-full transition-all"
        title="Edit Name"
      >
        <Pencil size={18} />
      </button>
    </div>
  )
}
