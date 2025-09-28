// src/pages/Auth/Register.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import COUNTRIES from '../../utils/countries'
import PasswordStrength from '../../components/PasswordStrength'
import '../../styles/auth.css'

export default function Register(){
  const [profileType, setProfileType] = useState('Investor account')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('Male')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [pwValid, setPwValid] = useState(false)
  const { register } = useAuth()
  const nav = useNavigate()

  async function handle(e){
    e.preventDefault()
    setError(null)

    if (!pwValid) {
      setError('Please choose a stronger password that meets all requirements.')
      return
    }

    if(password !== confirm) { setError('Passwords do not match'); return }
    try{
      const payload = { profileType, firstName, lastName, gender, phone, email: email.toLowerCase(), country, password }
      const { user } = await register(payload)
      if(user.role === 'agent') nav('/agent')
      else nav('/dashboard')
    }catch(err){
      setError(err?.response?.data?.message || (err?.response?.data?.details ? err.response.data.details.join(', ') : err.message) || 'Registration failed')
    }
  }

  return (
    <div className="container" style={{maxWidth:680}}>
      <div className="card" style={{marginTop:20}}>
        <h2>Create Account</h2>
        <form onSubmit={handle} noValidate>
          <label>Profile type</label>
          <select value={profileType} onChange={e=>setProfileType(e.target.value)}>
            <option>Investor account</option>
            <option>Agent account</option>
          </select>

          <label>First name</label>
          <input value={firstName} onChange={e=>setFirstName(e.target.value)} required />

          <label>Last name</label>
          <input value={lastName} onChange={e=>setLastName(e.target.value)} required />

          <label>Gender</label>
          <select value={gender} onChange={e=>setGender(e.target.value)}>
            <option>Male</option>
            <option>Female</option>
          </select>

          <label>Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} />

          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />

          <label>Country</label>
          <select value={country} onChange={e=>setCountry(e.target.value)} required>
            <option value="">Select country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            aria-describedby="password-requirements"
            required
            style={{marginBottom:6}}
          />

          {/* Password strength UI placed directly under the password textbox */}
          <PasswordStrength password={password} onValidityChange={setPwValid} />

          <label style={{marginTop:10}}>Confirm password</label>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />

          <div style={{marginTop:12}}>
            <button className="btn" type="submit" disabled={!pwValid || password === '' || confirm === ''}>Register</button>
          </div>

          {!pwValid && (
            <div style={{marginTop:8, color:'#b45309', fontSize:13}}>
              Password must meet all requirements above to register.
            </div>
          )}

          {error && <div className="muted small" style={{marginTop:8,color:'red'}}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
