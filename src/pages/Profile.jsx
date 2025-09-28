// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react'
import backend from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Profile.css'

export default function Profile(){
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', country: ''
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState(null)

  useEffect(()=>{
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        country: user.country || ''
      })
    }
  }, [user])

  async function saveProfile(e){
    e.preventDefault()
    setErr(null); setMsg(null); setLoading(true)
    try {
      const payload = { ...form }
      const res = await backend.patch(`/users/${user.id}`, payload)
      // update local user object
      const updatedUser = { ...user, ...res.data.user }
      setUser(updatedUser)
      setMsg('Profile updated successfully')
    } catch (error) {
      setErr(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  async function changePassword(e){
    e.preventDefault()
    setPwMsg(null); setErr(null)
    try {
      if (!currentPassword || !newPassword) { setPwMsg('Provide both current and new password'); return }
      const res = await backend.post('/auth/change-password', { currentPassword, newPassword })
      setPwMsg(res.data.message || 'Password changed')
      setCurrentPassword(''); setNewPassword('')
    } catch (error) {
      setPwMsg(error?.response?.data?.message || 'Password change failed')
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-header">Profile Settings</h2>
        
        <form onSubmit={saveProfile} className="profile-form">
          <div className="form-group">
            <label className="form-label">First name</label>
            <input 
              className="form-input"
              value={form.firstName} 
              onChange={e=>setForm({...form, firstName: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last name</label>
            <input 
              className="form-input"
              value={form.lastName} 
              onChange={e=>setForm({...form, lastName: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input 
              className="form-input"
              value={form.phone} 
              onChange={e=>setForm({...form, phone: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Country</label>
            <input 
              className="form-input"
              value={form.country} 
              onChange={e=>setForm({...form, country: e.target.value})} 
            />
          </div>

          <div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          {msg && <div className="message message-success">{msg}</div>}
          {err && <div className="message message-error">{err}</div>}
        </form>

        <div className="profile-divider" />

        <div className="password-section">
          <h3 className="profile-section-title">Change Password</h3>
          <form onSubmit={changePassword} className="profile-form">
            <div className="form-group">
              <label className="form-label">Current password</label>
              <input 
                type="password" 
                className="form-input"
                value={currentPassword} 
                onChange={e=>setCurrentPassword(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">New password</label>
              <input 
                type="password" 
                className="form-input"
                value={newPassword} 
                onChange={e=>setNewPassword(e.target.value)} 
              />
            </div>

            <div>
              <button className="btn btn-primary" type="submit">Change Password</button>
            </div>
            {pwMsg && (
              <div className={`message ${pwMsg.toLowerCase().includes('failed') ? 'message-error' : 'message-success'}`}>
                {pwMsg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}