import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Card, Heading, Input, Button, Panel } from '@survey-kit/registry'
import {
  loginRespondent,
  registerRespondent,
  confirmRespondent,
  getRespondentToken,
} from '../services/respondentAuth'

export function ParticipantLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'register' | 'confirm'>('signin')
  const navigate = useNavigate()

  if (getRespondentToken()) {
    return <Navigate to="/participant/profile" replace />
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const result = await loginRespondent(email, password)
    setLoading(false)
    if (result.success) {
      navigate('/participant/profile')
    } else {
      setError(result.error || 'Sign in failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const result = await registerRespondent(email, registerPassword)
    setLoading(false)
    if (!result.success) {
      setError(result.error || 'Registration failed')
      return
    }
    if (result.needsConfirmation) {
      setInfo('Check your email for a confirmation code, then enter it below.')
      setMode('confirm')
    } else {
      setInfo('Account ready. You can sign in.')
      setMode('signin')
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const result = await confirmRespondent(email, code)
    setLoading(false)
    if (result.success) {
      setInfo('Email confirmed. You can sign in.')
      setMode('signin')
      setCode('')
    } else {
      setError(result.error || 'Confirmation failed')
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 my-8">
      <Card className="w-full max-w-md border rounded-md p-8">
        <Heading level="h2" className="text-2xl mb-2 text-center">
          Participant account
        </Heading>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in to complete the demo survey and earn badges.
        </p>

        {error && (
          <Panel variant="error" className="mb-4">
            {error}
          </Panel>
        )}
        {info && (
          <Panel variant="info" className="mb-4">
            {info}
          </Panel>
        )}

        {mode === 'confirm' ? (
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="participant-email"
                className="block text-sm font-medium mb-1"
              >
                Email
              </label>
              <Input
                id="participant-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                autoComplete="email"
              />
            </div>
            <div>
              <label
                htmlFor="participant-code"
                className="block text-sm font-medium mb-1"
              >
                Confirmation code
              </label>
              <Input
                id="participant-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full"
                autoComplete="one-time-code"
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Confirming…' : 'Confirm email'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setMode('signin')
                setError('')
              }}
            >
              Back to sign in
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <Heading level="h3" className="text-base font-semibold">
                Sign in
              </Heading>
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-sm font-medium mb-1"
                >
                  Password
                </label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-4 border-t border-border pt-8"
            >
              <Heading level="h3" className="text-base font-semibold">
                Create account
              </Heading>
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium mb-1"
                >
                  Password
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="w-full"
                  autoComplete="new-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                variant="secondary"
                disabled={loading}
              >
                {loading ? 'Working…' : 'Register'}
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  )
}
