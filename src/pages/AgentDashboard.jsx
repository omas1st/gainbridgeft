// src/pages/AgentDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react'
import '../styles/dashboard.css'
import { useAuth } from '../contexts/AuthContext'
import backend from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function AgentDashboard(){
  const { user } = useAuth()
  const [overview, setOverview] = useState({ monthlyBonus: 0, totalReferralEarnings: 0, availableWithdrawal: 0 })
  const [referrals, setReferrals] = useState([])
  const nav = useNavigate()

  // messages
  const [showMessages, setShowMessages] = useState(false)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [msgStatus, setMsgStatus] = useState(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        if (!user?.id) return
        const { data } = await backend.get(`/users/${user.id}/referrals`)
        if (!mounted) return
        setReferrals(data.referrals || [])
        const totalReferralEarnings = data.totalReferralEarnings || 0
        setOverview({
          monthlyBonus: user?.monthlyBonus || 0,
          totalReferralEarnings,
          availableWithdrawal: Number(user?.monthlyBonus || 0) + Number(totalReferralEarnings)
        })
      }catch(err){
        console.warn('agent dashboard load err', err?.message || err)
      }
    }
    load()
    return () => { mounted = false }
  },[user])

  // useCallback ensures stable identity so useEffect dependencies are satisfied
  const loadMessages = useCallback(async () => {
    if(!user?.id) return
    try {
      const { data } = await backend.get(`/users/${user.id}/messages`)
      setMessages(data.messages || [])
    } catch (err) {
      console.warn('load messages', err)
      setMessages([])
    }
  }, [user?.id])

  // When showMessages toggles on, load messages (dependency includes loadMessages)
  useEffect(() => {
    if (showMessages) loadMessages()
  }, [showMessages, loadMessages])

  async function sendMessage(){
    if (!msgText) return setMsgStatus('Message text required')
    setSending(true); setMsgStatus(null)
    try {
      await backend.post(`/users/${user.id}/messages`, { text: msgText })
      setMsgStatus('Message sent')
      setMsgText('')
      // reload messages after sending
      await loadMessages()
    } catch (err) {
      setMsgStatus(err?.response?.data?.message || err.message)
    } finally { setSending(false) }
  }

  const totalPortfolio = Number(overview.monthlyBonus) + Number(overview.totalReferralEarnings)

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-welcome">Agent Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {user?.firstName || 'Agent'}!</p>
      </div>

      {/* Agent Overview */}
      <div className="dashboard-overview">
        <h2 className="action-title">Agent Overview</h2>
        <div className="overview-grid">
          <div className="overview-card primary">
            <div className="overview-label">Total Portfolio Balance</div>
            <div className="overview-value">${totalPortfolio.toFixed(2)}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Monthly Bonus</div>
            <div className="overview-value">${Number(overview.monthlyBonus).toFixed(2)}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Total Referral Earnings</div>
            <div className="overview-value">${Number(overview.totalReferralEarnings).toFixed(2)}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Available Withdrawal</div>
            <div className="overview-value">${Number(overview.availableWithdrawal).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Agent Actions */}
      <div className="dashboard-actions">
        <div className="action-grid">
          <div className="action-card">
            <h3 className="action-title">Agent Actions</h3>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={()=>nav('/dashboard/withdraw')}>
                💳 Agent Withdraw
              </button>
              <button className="btn btn-success" onClick={()=>nav('/dashboard/referrals')}>
                👥 Agent Referrals
              </button>
              <button 
                className="btn btn-warning" 
                onClick={()=>setShowMessages(s=>!s)}
              >
                {showMessages ? '📪 Hide Messages' : '💬 Messages'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      {showMessages && (
        <div className="messages-section">
          <div className="action-card">
            <h3 className="action-title">Support Messages</h3>
            <div className="message-form">
              <div className="form-group">
                <label className="form-label">Write message to admin</label>
                <textarea 
                  className="form-textarea"
                  rows={4} 
                  value={msgText} 
                  onChange={e=>setMsgText(e.target.value)}
                  placeholder="Type your message to admin..."
                />
              </div>
              <div className="message-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={sendMessage} 
                  disabled={sending}
                >
                  {sending ? '⏳ Sending...' : '📤 Send Message'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={()=>{ setMsgText(''); setMsgStatus(null) }}
                >
                  🗑️ Clear
                </button>
              </div>
              {msgStatus && (
                <div className={`message-status ${msgStatus.toLowerCase().includes('sent') ? 'status-success' : 'status-error'}`}>
                  {msgStatus}
                </div>
              )}
            </div>

            <div className="messages-list">
              <h4>Message History</h4>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <div className="empty-text">No messages yet</div>
                  <div className="empty-subtext">Start a conversation with admin</div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className="message-item">
                    <div className="message-header">
                      <div className={`message-sender ${m.from === 'admin' ? 'message-admin' : 'message-you'}`}>
                        {m.from === 'admin' ? (m.subject || 'Admin') : (m.name || m.email || 'You')}
                      </div>
                      <div className="message-time">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}
                      </div>
                    </div>
                    {m.subject && <div className="message-subject">{m.subject}</div>}
                    <div className="message-body">
                      {m.from === 'admin' ? (m.body || '') : (m.text || '')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Referrals Section */}
      <div className="referrals-section">
        <div className="action-card">
          <h3 className="action-title">Your Referrals</h3>
          {referrals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-text">No referrals yet</div>
              <div className="empty-subtext">Start referring users to see them here</div>
            </div>
          ) : (
            <div className="referrals-grid">
              {referrals.map(r => (
                <div key={r._id} className="referral-item">
                  <div className="referral-email">{r.email}</div>
                  <div className="referral-details">
                    <span className="referral-capital">Capital: ${r.capital || 0}</span>
                    <span className="referral-earnings">Earnings: ${r.referralEarning || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}