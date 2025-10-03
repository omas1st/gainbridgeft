// src/pages/AgentDashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import '../styles/dashboard.css'
import '../styles/agent-dashboard.css'
import { useAuth } from '../contexts/AuthContext'
import backend from '../services/api'
import { useNavigate } from 'react-router-dom'

// Currency configuration
const CURRENCY_CONFIG = {
  'South Africa': { code: 'ZAR', rate: 17, symbol: 'R' },
  'Nigeria': { code: 'NGN', rate: 1500, symbol: '₦' },
  'Ghana': { code: 'GHS', rate: 12.50, symbol: 'GH₵' },
  'Philippines': { code: 'PHP', rate: 58, symbol: '₱' }
};

// Move LEVELS to module scope
const LEVELS = [
  { id: 1, title: 'Level 1', requirement: 10, salary: 20 },
  { id: 2, title: 'Level 2', requirement: 25, salary: 50 },
  { id: 3, title: 'Level 3', requirement: 50, salary: 100 },
  { id: 4, title: 'Level 4', requirement: 100, salary: 200 }
]

export default function AgentDashboard(){
  const { user } = useAuth()
  const [overview, setOverview] = useState({
    monthlyBonus: 0,
    capital: 0,
    netProfit: 0,
    referralEarnings: 0,
    totalPortfolio: 0,
    availableWithdrawal: 0
  })
  const [referrals, setReferrals] = useState([])
  const nav = useNavigate()

  // messages
  const [showMessages, setShowMessages] = useState(false)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [msgStatus, setMsgStatus] = useState(null)

  // Get currency configuration based on user's country
  const getCurrencyConfig = () => {
    const userCountry = user?.country;
    return CURRENCY_CONFIG[userCountry] || null;
  };

  // Format converted amount
  const formatConvertedAmount = (usdAmount) => {
    const currencyConfig = getCurrencyConfig();
    if (!currencyConfig) return null;
    
    const converted = (Number(usdAmount || 0) * currencyConfig.rate).toFixed(2);
    return `(${currencyConfig.symbol}${converted})`;
  };

  const currencyConfig = getCurrencyConfig();
  const showCurrencyConversion = currencyConfig !== null;

  // Fetch overview + referrals together
  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        if (!user?.id) return

        // parallel requests for overview and referrals
        const [ovRes, refRes] = await Promise.allSettled([
          backend.get(`/users/${user.id}/overview`),
          backend.get(`/users/${user.id}/referrals`)
        ])

        if (!mounted) return

        // referrals
        if (refRes.status === 'fulfilled' && refRes.value?.data) {
          const data = refRes.value.data
          setReferrals(data.referrals || [])
        } else {
          setReferrals([])
          if (refRes.status === 'rejected') {
            console.warn('failed to load referrals', refRes.reason)
          }
        }

        // overview
        if (ovRes.status === 'fulfilled' && ovRes.value?.data && ovRes.value.data.overview) {
          const o = ovRes.value.data.overview || {}
          const capital = Number(o.capital || 0)
          const netProfit = Number(o.netProfit || 0)
          const referralEarnings = Number(o.referralEarnings || 0)
          const totalPortfolio = Number(o.totalPortfolio || (capital + netProfit + referralEarnings))
          const availableWithdrawal = Number((netProfit || 0) + (referralEarnings || 0))

          setOverview({
            monthlyBonus: Number(user?.monthlyBonus || 0),
            capital,
            netProfit,
            referralEarnings,
            totalPortfolio,
            availableWithdrawal
          })
        } else {
          const totalReferralEarnings = (refRes.status === 'fulfilled' && refRes.value?.data) ? (refRes.value.data.totalReferralEarnings || 0) : 0
          setOverview({
            monthlyBonus: Number(user?.monthlyBonus || 0),
            capital: Number(user?.capital || 0),
            netProfit: Number(user?.netProfit || 0),
            referralEarnings: Number(totalReferralEarnings),
            totalPortfolio: Number(Number(user?.capital || 0) + Number(user?.netProfit || 0) + Number(totalReferralEarnings)),
            availableWithdrawal: Number(Number(user?.netProfit || 0) + Number(totalReferralEarnings))
          })
        }
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

  // Use overview totals (authoritative)
  const totalPortfolio = Number(overview.totalPortfolio || 0)

  // -------------------------
  // Agent levels data & helpers
  // -------------------------

  // Consider a referral as VERIFIED when it has a capital > 0 (i.e. deposited)
  const verifiedReferrals = useMemo(() => referrals.filter(r => Number(r.capital) > 0), [referrals])
  const verifiedCount = verifiedReferrals.length
  const pendingCount = referrals.length - verifiedCount

  // Determine current level and progress
  const levelInfo = useMemo(() => {
    // highest level where verifiedCount >= requirement
    let achieved = LEVELS.slice().reverse().find(l => verifiedCount >= l.requirement) || null
    if (!achieved) achieved = null

    // next level (the first level with requirement > verifiedCount)
    const next = LEVELS.find(l => l.requirement > verifiedCount) || null

    // progress towards next level (relative between current level requirement and next)
    let progressPercent = 0
    if (!next) {
      progressPercent = 100
    } else {
      const prevReq = achieved ? achieved.requirement : 0
      const span = next.requirement - prevReq
      progressPercent = span === 0 ? 100 : Math.min(100, Math.round(((verifiedCount - prevReq) / span) * 100))
      if (progressPercent < 0) progressPercent = 0
    }

    return {
      achieved,
      next,
      progressPercent
    }
  }, [verifiedCount])

  const getLevelStatus = (level) => {
    return verifiedCount >= level.requirement ? 'achieved' : (verifiedCount > 0 ? 'in-progress' : 'locked')
  }

  // -------------------------
  // Render
  // -------------------------
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
            <div className="overview-value">
              ${totalPortfolio.toFixed(2)}
              {showCurrencyConversion && (
                <span className="zar-value">{formatConvertedAmount(totalPortfolio)}</span>
              )}
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Monthly Bonus</div>
            <div className="overview-value">
              ${Number(overview.monthlyBonus).toFixed(2)}
              {showCurrencyConversion && (
                <span className="zar-value">{formatConvertedAmount(overview.monthlyBonus)}</span>
              )}
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Total Referral Earnings</div>
            <div className="overview-value">
              ${Number(overview.referralEarnings).toFixed(2)}
              {showCurrencyConversion && (
                <span className="zar-value">{formatConvertedAmount(overview.referralEarnings)}</span>
              )}
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Available Withdrawal</div>
            <div className="overview-value">
              ${Number(overview.availableWithdrawal).toFixed(2)}
              {showCurrencyConversion && (
                <span className="zar-value">{formatConvertedAmount(overview.availableWithdrawal)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Benefits & Requirements */}
      <div className="agent-requirements-section">
        <div className="action-card">
          <h2 className="action-title">Agent Benefits & Qualification Requirements</h2>

          <p className="agent-intro">
            To qualify for an agent level within a calendar month, you must refer the required number of new users
            via your unique agent referral link. Each referred user must complete a deposit within the same month
            for the referral to count. Agents who meet a level's requirement receive the fixed monthly Bonus shown
            for that level, plus a commission of <strong>5% of each referred user's invested capital</strong>, Then 
            send the screenshot of your current level at the end of each month, to our 
            email: gainbridgeinvest@gmail.com, to be credited with your monthly bonus.
          </p>

          <div className="agent-levels">
            {LEVELS.map(level => (
              <div key={level.id} className={`level-card ${getLevelStatus(level)}`}>
                <div className="level-header">
                  <div className="level-title">{level.title}</div>
                  <div className="level-salary">Bonus: ${level.salary.toLocaleString()}</div>
                </div>
                <div className="level-body">
                  <div className="level-requirement">
                    Requirement: <strong>{level.requirement} verified deposits</strong> within the month
                  </div>
                  <div className="level-commission">
                    Commission: <strong>5% of capital</strong> from each referred user's deposit
                  </div>
                  <div className="level-status">
                    Status: <span className="status-text">{getLevelStatus(level) === 'achieved' ? 'Achieved' : (getLevelStatus(level) === 'in-progress' ? 'In progress' : 'Locked')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="agent-progress">
            <div className="progress-summary">
              <div className="progress-item">
                <div className="progress-label">Verified referrals (deposited)</div>
                <div className="progress-value">{verifiedCount}</div>
              </div>
              <div className="progress-item">
                <div className="progress-label">Pending referrals (no deposit)</div>
                <div className="progress-value">{pendingCount}</div>
              </div>
              <div className="progress-item">
                <div className="progress-label">Current level</div>
                <div className="progress-value">{levelInfo.achieved ? levelInfo.achieved.title : 'None'}</div>
              </div>
              <div className="progress-item">
                <div className="progress-label">Progress to next level</div>
                <div className="progress-value">{levelInfo.next ? `${levelInfo.progressPercent}%` : 'Max'}</div>
              </div>
            </div>

            {levelInfo.next && (
              <div className="progress-bar-wrap" aria-hidden>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${levelInfo.progressPercent}%` }} />
                </div>
                <div className="progress-note">
                  You need <strong>{levelInfo.next.requirement - verifiedCount}</strong> more verified deposit(s) to reach <strong>{levelInfo.next.title}</strong>.
                </div>
              </div>
            )}

            {!levelInfo.next && (
              <div className="progress-note">
                You've reached the highest agent level. Keep building referrals to maintain your status and commissions.
              </div>
            )}
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
                    <span className="referral-capital">
                      Capital: ${r.capital || 0}
                      {showCurrencyConversion && (
                        <span className="zar-value">{formatConvertedAmount(r.capital || 0)}</span>
                      )}
                    </span>
                    <span className="referral-earnings">
                      Earnings: ${r.referralEarning || 0}
                      {showCurrencyConversion && (
                        <span className="zar-value">{formatConvertedAmount(r.referralEarning || 0)}</span>
                      )}
                    </span>
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