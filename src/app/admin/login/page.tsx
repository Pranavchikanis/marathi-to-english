'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { loginAdmin } from '@/features/admin/actions'

export default function AdminLogin() {
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const res = await loginAdmin(secret)
    if (res.success) {
      router.push('/admin')
    } else {
      setError(res.error?.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Portal Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Secret Key</label>
              <input 
                type="password" 
                value={secret}
                onChange={e => setSecret(e.target.value)}
                className="w-full mt-1 p-2 border border-border-default rounded-md bg-surface-hover text-text-primary"
                required
              />
            </div>
            {error && <p className="text-status-error text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
