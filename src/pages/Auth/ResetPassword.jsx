// src/pages/Auth/ResetPassword.jsx
import React, { useState } from 'react'
import '../../styles/reset-password.css'
import backend from '../../services/api'
import { useNavigate } from 'react-router-dom'

// Updated ResetPassword flow:
// 1) Verify identity by email + firstName + lastName + phone -> POST /auth/verify-reset
//    (server should validate those fields and return { allowed: true, resetToken })
// 2) If verified, show new password + confirm inputs with validation and strength meter
// 3) Proceed -> POST /auth/reset-password with { email, password, resetToken }
//    On success navigate to /login

export default function ResetPassword(){
  const [step, setStep] = useState('verify') // 'verify' | 'reset' | 'done'

  // identity fields
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  // reset token received from server after successful verification
  const [resetToken, setResetToken] = useState(null)

  // password fields
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const nav = useNavigate()

  // Password rules regexes
  const rules = {
    length: (p) => p && p.length >= 8,
    upper: (p) => /[A-Z]/.test(p),
    lower: (p) => /[a-z]/.test(p),
    number: (p) => /[0-9]/.test(p),
    special: (p) => /[^A-Za-z0-9]/.test(p)
  }

  function evaluateStrength(pw){
    if (!pw) return { score: 0, label: 'Very weak' }
    let score = 0
    if (rules.length(pw)) score += 1
    if (rules.lower(pw)) score += 1
    if (rules.upper(pw)) score += 1
    if (rules.number(pw)) score += 1
    if (rules.special(pw)) score += 1

    const labels = ['Very weak','Weak','Fair','Good','Strong','Very strong']
    return { score, label: labels[Math.min(score, labels.length-1)] }
  }

  const strength = evaluateStrength(password)

  // handle identity verification
  async function handleVerify(e){
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try{
      // normalize email
      const payload = {
        email: (email || '').toLowerCase(),
        firstName: (firstName || '').trim(),
        lastName: (lastName || '').trim(),
        phone: (phone || '').trim()
      }

      const { data } = await backend.post('/auth/verify-reset', payload)
      // expected response: { allowed: true, resetToken: '...' }
      if (data && data.allowed) {
        setResetToken(data.resetToken || null)
        setStep('reset')
        setMessage('Identity verified — please choose a new password.')
      } else {
        setError(data?.message || 'Verification failed — details do not match our records')
      }
    } catch (err){
      setError(err?.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  // handle final password submission
  async function handleReset(e){
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // basic client-side validations
    if (!rules.length(password) || !rules.upper(password) || !rules.lower(password) || !rules.number(password) || !rules.special(password)){
      setError('Password does not meet the required security criteria.')
      setLoading(false)
      return
    }
    if (password !== confirmPassword){
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try{
      const payload = {
        email: (email || '').toLowerCase(),
        password,
        resetToken
      }

      const { data } = await backend.post('/auth/reset-password', payload)
      // expected success response: { message: 'Password updated' }
      setMessage(data?.message || 'Password updated successfully. Redirecting to login...')
      setStep('done')

      // short delay so user sees success; then navigate to login
      setTimeout(() => nav('/login'), 1200)
    } catch (err){
      setError(err?.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // allow user to go back to verification step to change identity fields
  function backToVerify(){
    setStep('verify')
    setResetToken(null)
    setPassword('')
    setConfirmPassword('')
    setMessage(null)
    setError(null)
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-icon">🔒</div>

        <h2>Reset Password</h2>

        {step === 'verify' && (
          <>
            <p className="reset-description">
              To reset your password, enter the <strong>email</strong> and the <strong>first and last name</strong>
              and <strong>phone number</strong> you used when registering. If the details match, you'll be allowed
              to set a new password.
            </p>

            <form onSubmit={handleVerify} className="reset-form">
              <div className="form-group">
                <label className="form-label required">Email Address</label>
                <input
                  type="email"
                  className="reset-input"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">First Name</label>
                  <input
                    type="text"
                    className="reset-input"
                    value={firstName}
                    onChange={e=>setFirstName(e.target.value)}
                    required
                    placeholder="First name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Last Name</label>
                  <input
                    type="text"
                    className="reset-input"
                    value={lastName}
                    onChange={e=>setLastName(e.target.value)}
                    required
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Phone Number</label>
                <input
                  type="tel"
                  className="reset-input"
                  value={phone}
                  onChange={e=>setPhone(e.target.value)}
                  required
                  placeholder="e.g. +2348012345678"
                />
              </div>

              <button className="reset-submit" type="submit" disabled={loading}>
                {loading ? <><span className="loading-spinner"></span> Verifying...</> : 'Verify Identity'}
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <p className="reset-description">Create a new password for <strong>{email}</strong>.</p>

            <form onSubmit={handleReset} className="reset-form">
              <div className="form-group">
                <label className="form-label required">New Password</label>
                <input
                  type="password"
                  className="reset-input"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Confirm New Password</label>
                <input
                  type="password"
                  className="reset-input"
                  value={confirmPassword}
                  onChange={e=>setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
              </div>

              <div className="password-rules">
                <div className="rules-title">Password must include:</div>
                <ul>
                  <li className={rules.length(password) ? 'rule-ok' : 'rule-fail'}>At least 8 characters</li>
                  <li className={rules.upper(password) ? 'rule-ok' : 'rule-fail'}>One uppercase letter (A–Z)</li>
                  <li className={rules.lower(password) ? 'rule-ok' : 'rule-fail'}>One lowercase letter (a–z)</li>
                  <li className={rules.number(password) ? 'rule-ok' : 'rule-fail'}>One number (0–9)</li>
                  <li className={rules.special(password) ? 'rule-ok' : 'rule-fail'}>One special character (e.g. !@#$%)</li>
                </ul>
              </div>

              <div className="password-strength">
                <div className="strength-label">Strength: {strength.label}</div>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
              </div>

              <div className="reset-actions-inline">
                <button className="reset-submit" type="submit" disabled={loading}>
                  {loading ? <><span className="loading-spinner"></span> Saving...</> : 'Proceed'}
                </button>

                <button className="auth-link auth-secondary" type="button" onClick={backToVerify}>
                  Back
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <div className="success-title">Password Updated</div>
            <p className="success-description">
              Your password has been successfully updated. You will be redirected to the sign in page to log in.
            </p>
          </div>
        )}

        {message && <div className="auth-message auth-success">{message}</div>}
        {error && <div className="auth-message auth-error">{error}</div>}

        <div className="reset-actions">
          <button className="auth-link auth-secondary" type="button" onClick={() => nav('/login')}>
            Back to Sign In
          </button>
          <button className="auth-link" type="button" onClick={() => nav('/register')}>
            Create New Account
          </button>
        </div>
      </div>
    </div>
  )
}
