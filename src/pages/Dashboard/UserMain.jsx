// src/pages/Dashboard/UserMain.jsx
import React, { useEffect, useState, useCallback } from 'react'
import '../../styles/dashboard.css'
import { useAuth } from '../../contexts/AuthContext'
import backend from '../../services/api'
import { useNavigate } from 'react-router-dom'
import CountdownTimer from '../../components/CountdownTimer'

export default function UserMain(){
  const { user } = useAuth()
  const [account, setAccount] = useState({
    capital: user?.capital || 0,
    netProfit: user?.netProfit || 0,
    referralEarnings: user?.referralEarnings || 0,
    deposits: user?.deposits || []
  })
  const nav = useNavigate()

  // messages / contact
  const [showMessages, setShowMessages] = useState(false)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [msgStatus, setMsgStatus] = useState(null)

  useEffect(()=>{
    async function load(){
      try{
        const { data } = await backend.get(`/users/${user?.id}/overview`)
        if(data?.overview) setAccount(data.overview)
      }catch(e){}
    }
    load()
  },[user])

  // useCallback to keep stable identity and satisfy react-hooks/exhaustive-deps
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
      await loadMessages()
    } catch (err) {
      setMsgStatus(err?.response?.data?.message || err.message)
    } finally { setSending(false) }
  }

  const totalPortfolio = Number(account.capital) + Number(account.netProfit) + Number(account.referralEarnings)
  const availableWithdrawal = Number(account.netProfit) + Number(account.referralEarnings)

  // Determine latest active deposit start date (most-recent approved deposit)
  const activeDeposits = Array.isArray(account.deposits) ? account.deposits.filter(d => d && d.status === 'active' && (d.startDate || d.approvedAt)) : []
  // Some systems store startDate or approvedAt; prefer startDate then approvedAt
  const normalizeStart = (d) => d.startDate ? new Date(d.startDate) : (d.approvedAt ? new Date(d.approvedAt) : null)
  const latestActive = activeDeposits
    .map(d => ({ d, start: normalizeStart(d) }))
    .filter(x => x.start)
    .sort((a,b) => b.start - a.start)[0]

  const startDateToShow = latestActive ? latestActive.start.toISOString() : null

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-welcome">Welcome back, {user?.firstName || 'User'}!</h1>
        <p className="dashboard-subtitle">Here's your investment overview</p>
      </div>

      {/* Account Overview */}
      <div className="dashboard-overview">
        <h2 className="action-title">Account Overview</h2>

        {/* Countdown Timer */}
        {startDateToShow && (
          <div className="countdown-container">
            <div className="countdown-title">Current Investment Cycle</div>
            <CountdownTimer startDate={startDateToShow} days={60} />
          </div>
        )}

        <div className="overview-grid">
          <div className="overview-card primary">
            <div className="overview-label">Total Portfolio Balance</div>
            <div className="overview-value">${totalPortfolio.toFixed(2)}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Investment Capital</div>
            <div className="overview-value">${Number(account.capital).toFixed(2)}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Available Withdrawal</div>
            <div className="overview-value">${availableWithdrawal.toFixed(2)}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Net Profit</div>
            <div className="overview-value">${Number(account.netProfit).toFixed(2)}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Referral Earnings</div>
            <div className="overview-value">${Number(account.referralEarnings).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="dashboard-actions">
        <div className="action-grid">
          <div className="action-card">
            <h3 className="action-title">Investment Actions</h3>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={()=>nav('/invest')}>
                💰 Invest Now
              </button>
              <button className="btn btn-success" onClick={()=>nav('/dashboard/withdraw')}>
                💳 Withdraw Funds
              </button>
              <button className="btn btn-warning" onClick={()=>nav('/dashboard/transactions')}>
                📊 Transaction History
              </button>
            </div>
          </div>

          <div className="action-card">
            <h3 className="action-title">Referral Program</h3>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={()=>nav('/dashboard/referrals')}>
                👥 Referral Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Messages Section */}
      <div className="messages-section">
        <div className="action-card">
          <h3 className="action-title">Support & Notifications</h3>
          <button 
            className="btn messages-toggle" 
            onClick={()=>setShowMessages(s=>!s)}
          >
            {showMessages ? '📪 Hide Messages' : '📬 Contact Support'}
          </button>

          {showMessages && (
            <div className="messages-content">
              <div className="message-form">
                <h4>Send Message to Support</h4>
                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea 
                    className="form-textarea"
                    rows={4} 
                    value={msgText} 
                    onChange={e=>setMsgText(e.target.value)}
                    placeholder="Type your message here..."
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
                    <div className="empty-subtext">Start a conversation with support</div>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} className="message-item">
                      <div className="message-header">
                        <div className={`message-sender ${m.from === 'admin' ? 'message-admin' : 'message-you'}`}>
                          {m.from === 'admin' ? (m.subject || 'Support Team') : (m.name || m.email || 'You')}
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
          )}
        </div>
      </div>
    </div>
  )
}