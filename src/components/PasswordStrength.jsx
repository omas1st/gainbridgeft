// src/components/PasswordStrength.jsx
import React, { useEffect, useMemo } from 'react'

/**
 * PasswordStrength
 * - Renders a list of checks (min length, uppercase, lowercase, number, special).
 * - Calls onValidityChange(valid:boolean) whenever overall validity changes.
 * - Designed to be placed immediately under the password textbox.
 */
export default function PasswordStrength({ password = '', onValidityChange = () => {} }) {
  const checks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    // any non-alphanumeric character
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  }), [password])

  const keys = [
    { k: 'minLength', label: 'At least 8 characters' },
    { k: 'hasUpper', label: 'One uppercase letter (A–Z)' },
    { k: 'hasLower', label: 'One lowercase letter (a–z)' },
    { k: 'hasNumber', label: 'One number (0–9)' },
    { k: 'hasSpecial', label: 'One special character (e.g. !@#$%)' }
  ]

  const valid = Object.values(checks).every(Boolean)

  useEffect(() => {
    onValidityChange(valid)
  }, [valid, onValidityChange])

  const containerStyle = {
    marginTop: 8,
    padding: '8px 10px',
    borderRadius: 8,
    background: '#fafafa',
    border: '1px solid #eee'
  }

  const listStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }
  const item = (ok) => ({
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    color: ok ? '#065f46' : '#6b7280',
    fontSize: 13
  })
  const icon = (ok) => ({
    minWidth: 20,
    height: 20,
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: ok ? '#bbf7d0' : '#e6e6e6',
    color: ok ? '#065f46' : '#6b7280',
    fontWeight: 700,
    fontSize: 12
  })

  return (
    <div id="password-requirements" style={containerStyle} aria-live="polite">
      <div style={{ marginBottom: 6, fontSize: 13, color: '#374151' }}>
        Password must include:
      </div>

      <ul style={listStyle}>
        {keys.map(({ k, label }) => {
          const ok = !!checks[k]
          return (
            <li key={k} style={item(ok)}>
              <span style={icon(ok)} aria-hidden="true">{ok ? '✓' : '•'}</span>
              <span>{label}</span>
            </li>
          )
        })}
      </ul>

      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 8, background: '#e6e6e6', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100}%`,
              transition: 'width 160ms',
              background: valid ? '#059669' : '#f59e0b'
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: valid ? '#059669' : '#6b7280', minWidth: 120, textAlign: 'right' }}>
          {valid ? 'Strong password ✅' : 'Password not strong enough'}
        </div>
      </div>
    </div>
  )
}
