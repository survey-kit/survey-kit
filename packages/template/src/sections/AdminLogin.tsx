import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Card, Heading, Input, Button, Panel } from '@survey-kit/registry'
import {
  loginAdmin,
  respondToNewPasswordChallenge,
  getAuthToken,
} from '../services/auth'

/**
 * Component representing the administrator login interface.
 * Handles the initial login flow and new password challenge responses.
 */
export function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [challengeSession, setChallengeSession] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const navigate = useNavigate()

  // Redirect if already logged in
  if (getAuthToken()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = challengeSession
      ? await respondToNewPasswordChallenge(
          username,
          newPassword,
          challengeSession
        )
      : await loginAdmin(username, password)

    setLoading(false)

    if (result.success) {
      navigate('/admin/dashboard')
    } else if (result.challenge === 'NEW_PASSWORD_REQUIRED') {
      setChallengeSession(result.session || '')
      setError('You must create a new permanent password to continue.')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 my-8">
      <Card className="w-full max-w-md border rounded-md p-8">
        <Heading level="h2" className="text-2xl mb-6 text-center">
          Admin Login
        </Heading>

        {error && (
          <Panel variant="error" className="mb-4">
            {error}
          </Panel>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@survey-kit.com"
              required
              disabled={!!challengeSession}
              className="w-full disabled:opacity-50"
            />
          </div>
          {!challengeSession ? (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-600">
                New Permanent Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-blue-300 focus:border-blue-500"
              />
              <Panel variant="info" className="mt-4">
                Password must be at least 8 characters long and contain
                uppercase, lowercase, numbers, and symbols.
              </Panel>
            </div>
          )}
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading
              ? 'Processing...'
              : challengeSession
                ? 'Set New Password'
                : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
