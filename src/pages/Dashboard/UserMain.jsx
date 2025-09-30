// src/pages/Dashboard/UserMain.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react'
import '../../styles/dashboard.css'
import { useAuth } from '../../contexts/AuthContext'
import backend from '../../services/api'
import { useNavigate } from 'react-router-dom'
import CountdownTimer from '../../components/CountdownTimer'
import { profitForDeposit } from '../../utils/calcProfit' // frontend profit helper (minute-accurate)

/**
 * UserMain (Dashboard)
 *
 * - Loads server snapshot of user's overview (capital, netProfit, referralEarnings, deposits).
 * - Builds a local snapshot of deposits' profit as-of the snapshot time.
 * - Starts a lightweight per-second client tick that:
 *     - computes current profit for each deposit (using profitForDeposit with `asOf`)
 *     - computes delta since snapshot and applies to server netProfit snapshot
 *     - updates the UI live (smooth minute-by-minute / second-by-second visual)
 * - Periodically re-syncs the server snapshot (every 5 minutes) to pick up withdrawals / admin changes.
 *
 * This design makes the UI feel live and accurate while keeping server as the source of truth.
 */

export default function UserMain(){
  const { user } = useAuth()
  const [account, setAccount] = useState({
    capital: user?.capital || 0,
    netProfit: user?.netProfit || 0,
    referralEarnings: user?.referralEarnings || 0,
    deposits: user?.deposits || []
  })
  const [liveNetProfit, setLiveNetProfit] = useState(Number(user?.netProfit || 0))
  const nav = useNavigate()

  // messages / contact
  const [showMessages, setShowMessages] = useState(false)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [msgStatus, setMsgStatus] = useState(null)

  // Refs to hold snapshot information (mutable, to avoid rerender storms)
  const snapshotRef = useRef({
    serverNetProfit: Number(user?.netProfit || 0), // netProfit returned by server at last sync
    snapshotTime: new Date(), // local time when snapshot was taken
    depositProfitAtSnapshot: new Map() // map depositKey -> profit at snapshotTime
  })

  const tickRef = useRef(null)      // per-second UI tick
  const resyncRef = useRef(null)    // periodic full server resync

  // Helper: unique deposit key (use _id if present, fallback to start+amount)
  const depositKey = (d) => {
    if (!d) return null
    if (d._id) return String(d._id)
    return `${d.startDate || d.approvedAt || ''}::${d.amount || d.capital || ''}`
  }

  // Fetch messages
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

  // Core: load server overview snapshot and prepare client snapshot baseline
  const loadOverview = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await backend.get(`/users/${user?.id}/overview`)
      if (!data?.overview) return

      const ov = data.overview

      // Save account overview (server snapshot values)
      setAccount(ov)

      // Prepare snapshot: server netProfit (already computed server-side),
      // snapshotTime (now), and per-deposit profit at snapshotTime (using frontend helper)
      const now = new Date()
      const perDeposit = new Map()
      const deposits = Array.isArray(ov.deposits) ? ov.deposits : []
      for (const d of deposits) {
        try {
          // compute profit for this deposit as-of snapshotTime
          const p = Number(profitForDeposit(d, now) || 0)
          perDeposit.set(depositKey(d), p)
        } catch (e) {
          perDeposit.set(depositKey(d), 0)
        }
      }

      snapshotRef.current.serverNetProfit = Number(ov.netProfit || 0)
      snapshotRef.current.snapshotTime = now
      snapshotRef.current.depositProfitAtSnapshot = perDeposit

      // Set base live netProfit to server netProfit (UI will apply deltas from tick)
      setLiveNetProfit(Number(ov.netProfit || 0))
    } catch (err) {
      console.warn('loadOverview error', err?.message || err)
    }
  }, [user?.id])

  // Start client-side ticking & periodic server resync
  useEffect(() => {
    // Initial load
    loadOverview()

    // Clear existing timers if any
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (resyncRef.current) {
      clearInterval(resyncRef.current)
      resyncRef.current = null
    }

    // Per-second UI tick to compute liveNetProfit using profitForDeposit diffs
    tickRef.current = setInterval(() => {
      const now = new Date()
      // Sum current profit for each deposit and subtract snapshot profit to get delta
      const deposits = Array.isArray(account.deposits) ? account.deposits : []
      let deltaGross = 0
      for (const d of deposits) {
        try {
          const key = depositKey(d)
          const profitNow = Number(profitForDeposit(d, now) || 0)
          const profitAtSnapshot = snapshotRef.current.depositProfitAtSnapshot.get(key) || 0
          deltaGross += (profitNow - profitAtSnapshot)
        } catch (e) {
          // ignore problematic deposit, continue
        }
      }

      // liveNet = serverNetProfit (snapshot) + deltaGross
      const live = Number(snapshotRef.current.serverNetProfit || 0) + Number(deltaGross || 0)
      // clamp to >=0 and round to 2 decimals
      const clamped = Math.max(0, Number(Number(live).toFixed(2)))
      setLiveNetProfit(clamped)
    }, 1000) // update UI every second (provides smooth minute-by-minute visual)

    // Periodic full resync (server is source of truth) - every 5 minutes
    resyncRef.current = setInterval(() => {
      loadOverview()
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      if (resyncRef.current) clearInterval(resyncRef.current)
    }
  // We intentionally depend on account.deposits so that when deposits array changes (e.g. new deposit)
  // we recompute deltas correctly. loadOverview will reset snapshotRef when server resync happens.
  }, [loadOverview, account.deposits])

  // When we receive a fresh overview from server (account state changed), we already update account state
  // above in loadOverview; but to be defensive also watch for user initial value changes.
  useEffect(() => {
    // Update baseline values if auth user object changed drastically
    if (user) {
      // keep account in sync with user for initial render
      setAccount((prev) => {
        // only replace if prev is empty or very different
        if (!prev || !prev.deposits || prev.deposits.length === 0) {
          return {
            capital: user.capital || 0,
            netProfit: user.netProfit || 0,
            referralEarnings: user.referralEarnings || 0,
            deposits: user.deposits || []
          }
        }
        return prev
      })
    }
  }, [user])

  // compute displayed totals using liveNetProfit (client-side) + other server-provided balances
  const totalPortfolio = Number(account.capital) + Number(liveNetProfit) + Number(account.referralEarnings)
  const availableWithdrawal = Number(liveNetProfit) + Number(account.referralEarnings)

  // ZAR conversion rate (frontend display only)
  const ZAR_RATE = 17
  const toZAR = (usd) => (Number(usd || 0) * ZAR_RATE).toFixed(2)

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
            <div className="overview-value">
              ${totalPortfolio.toFixed(2)}
              <span className="zar-value">(R{toZAR(totalPortfolio)})</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Investment Capital</div>
            <div className="overview-value">
              ${Number(account.capital).toFixed(2)}
              <span className="zar-value">(R{toZAR(account.capital)})</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Available Withdrawal</div>
            <div className="overview-value">
              ${availableWithdrawal.toFixed(2)}
              <span className="zar-value">(R{toZAR(availableWithdrawal)})</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-label">Net Profit <small style={{marginLeft:8, fontSize:12, color:'#666'}}>live</small></div>
            <div className="overview-value">
              ${Number(liveNetProfit).toFixed(2)}
              <span className="zar-value">(R{toZAR(liveNetProfit)})</span>
            </div>
            {/* Note: Synced timestamp intentionally hidden as requested */}
          </div>
          <div className="overview-card">
            <div className="overview-label">Referral Earnings</div>
            <div className="overview-value">
              ${Number(account.referralEarnings).toFixed(2)}
              <span className="zar-value">(R{toZAR(account.referralEarnings)})</span>
            </div>
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