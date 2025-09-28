import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  async function handle(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const resp = await login(email.toLowerCase(), password)
      const userObj = resp?.user || resp || {}
      const roleRaw = (userObj?.role || userObj?.profileType || '').toString().toLowerCase()

      const destFromLocation = location.state?.from?.pathname

      if (roleRaw === 'admin') {
        nav('/admin')
      } else if (roleRaw === 'agent' || roleRaw === 'agent account' || roleRaw === 'agent_account') {
        nav('/agent')
      } else {
        if (destFromLocation) {
          nav(destFromLocation, { replace: true })
        } else {
          nav('/dashboard')
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.details ? err.response.data.details.join(', ') : null) ||
        err?.message ||
        'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo">GB</div>
          <div className="brand-text">Gainbridge Investment</div>
          <div className="brand-subtitle">Welcome back</div>
        </div>
        
        <h2>Sign In</h2>
        
        <form onSubmit={handle} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <div className="password-input-wrapper">
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="loading-spinner"></span>Signing In...</> : 'Sign In'}
          </button>
        </form>

        {error && <div className="auth-message auth-error">{error}</div>}

        <div className="auth-actions">
          <button className="auth-link auth-secondary" type="button" onClick={() => nav('/register')}>
            Create New Account
          </button>
          <button className="auth-link" type="button" onClick={() => nav('/reset-password')}>
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  )
}