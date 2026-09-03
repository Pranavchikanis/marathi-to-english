'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toggleStudentAccess, getAllStudents } from '@/features/admin/actions'

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    const res = await getAllStudents()
    if (res.success) {
      if (res.data) setStudents(res.data)
    } else {
      console.error(res.error.message)
    }
    setLoading(false)
  }

  const handleToggleBlock = async (studentId: string, currentStatus: boolean) => {
    // Optimistic update
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, is_blocked: !currentStatus } : s))
    
    const res = await toggleStudentAccess(studentId, !currentStatus)
    if (!res.success) {
      // Revert if failed
      alert(res.error?.message || 'Failed to update access')
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, is_blocked: currentStatus } : s))
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-text-secondary animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary">Total Users: {students.length}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-default text-text-secondary">
                <tr>
                  <th className="pb-3 font-semibold">User ID</th>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Joined</th>
                  <th className="pb-3 font-semibold">XP</th>
                  <th className="pb-3 font-semibold">Streak</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3 text-xs text-text-tertiary font-mono">{student.id.split('-')[0]}...</td>
                    <td className="py-3 text-text-primary font-medium">{student.display_name}</td>
                    <td className="py-3 text-text-secondary">{new Date(student.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-text-secondary">{student.total_xp} XP</td>
                    <td className="py-3 text-text-secondary">{student.current_streak} days</td>
                    <td className="py-3">
                      {student.is_blocked ? (
                        <span className="px-2 py-1 bg-status-error/10 text-status-error text-xs rounded-full font-medium">Blocked</span>
                      ) : (
                        <span className="px-2 py-1 bg-status-success/10 text-status-success text-xs rounded-full font-medium">Active</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant={student.is_blocked ? "default" : "secondary"}
                        onClick={() => handleToggleBlock(student.id, student.is_blocked)}
                      >
                        {student.is_blocked ? 'Unblock' : 'Block User'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-text-secondary">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
