// src/pages/Dashboard/WithdrawPreview.jsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import backend from '../../services/api'
import '../../styles/Withdraw.css'

export default function WithdrawPreview(){
  const { state } = useLocation()
  const payload = state?.payload
  const userId = state?.userId
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null) // NEW
  const [withdrawalInfo, setWithdrawalInfo] = useState(null) // NEW

  // NEW: Fetch user data and withdrawal info
  useEffect(() => {
    async function fetchUserData() {
      if (!userId) return
      
      try {
        const { data } = await backend.get(`/users/${userId}/overview`)
        setUserData(data.overview)
        setWithdrawalInfo(data.overview.withdrawalSchedule)
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      }
    }
    
    fetchUserData()
  }, [userId])

  if(!payload || !userId) {
    return (
      <div className="withdraw-container">
        <div className="withdraw-card">
          <div className="message message-error">
            No withdrawal data found. Please fill out the withdrawal form first.
          </div>
          <div className="button-group">
            <button 
              className="btn btn-primary" 
              onClick={() => nav('/dashboard/withdraw')}
            >
              Go to Withdrawal Form
            </button>
          </div>
        </div>
      </div>
    )
  }

  // NEW: Check if withdrawal is allowed
  const isWithdrawalAllowed = () => {
    if (userData?.withdrawalRestricted) return false
    if (withdrawalInfo && !withdrawalInfo.allowedToday) return false
    return true
  }

  // NEW: Get withdrawal status message
  const getWithdrawalStatusMessage = () => {
    if (userData?.withdrawalRestricted) {
      return {
        type: 'error',
        message: `Withdrawal is restricted. Reason: ${userData.withdrawalRestrictionReason || 'Contact support for more information.'}`
      }
    }
    
    if (withdrawalInfo && !withdrawalInfo.allowedToday) {
      if (withdrawalInfo.scheduleType === 'daysOfWeek') {
        return {
          type: 'info',
          message: `Withdrawals are only allowed on ${withdrawalInfo.withdrawalDays.join(', ')}. Next withdrawal day: ${withdrawalInfo.nextWithdrawalDay}`
        }
      } else if (withdrawalInfo.scheduleType === 'interval') {
        const daysUntil = Math.ceil((withdrawalInfo.nextWithdrawalDate - new Date()) / (1000 * 60 * 60 * 24))
        return {
          type: 'info',
          message: `Withdrawals are allowed every ${withdrawalInfo.intervalDays} days. Next withdrawal in ${daysUntil} day(s)`
        }
      }
    }
    
    return null
  }

  async function submit(){
    // NEW: Check withdrawal restrictions before submitting
    if (!isWithdrawalAllowed()) {
      const statusMessage = getWithdrawalStatusMessage()
      if (statusMessage) {
        setError(statusMessage.message)
      }
      return
    }

    setError(null)
    setLoading(true)
    try{
      // send to backend endpoint for this user
      await backend.post(`/users/${userId}/withdraw`, payload)
      setLoading(false)
      nav('/dashboard/withdraw/confirm')
    }catch(err){
      setLoading(false)
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  const statusMessage = getWithdrawalStatusMessage() // NEW

  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h2 className="withdraw-header">Review Withdrawal</h2>
        
        {/* NEW: Withdrawal Status Information */}
        {withdrawalInfo && (
          <div className="withdrawal-schedule-info">
            <h4>Withdrawal Schedule</h4>
            {withdrawalInfo.scheduleType === 'daysOfWeek' && (
              <p>Withdrawals are allowed on: <strong>{withdrawalInfo.withdrawalDays.join(', ')}</strong></p>
            )}
            {withdrawalInfo.scheduleType === 'interval' && (
              <p>Withdrawals are allowed every: <strong>{withdrawalInfo.intervalDays} days</strong></p>
            )}
            <p>
              {withdrawalInfo.allowedToday ? (
                <span style={{color: 'green'}}>✓ Withdrawals are allowed today</span>
              ) : (
                <span style={{color: 'orange'}}>
                  Next withdrawal: {withdrawalInfo.nextWithdrawalDate ? new Date(withdrawalInfo.nextWithdrawalDate).toLocaleDateString() : 'Please check back later'}
                </span>
              )}
            </p>
          </div>
        )}

        {/* NEW: Restriction Warning */}
        {userData?.withdrawalRestricted && (
          <div className="message message-error">
            <strong>Withdrawal Restricted:</strong> {userData.withdrawalRestrictionReason || 'Your withdrawal ability has been restricted. Please contact support for more information.'}
          </div>
        )}

        <div className="preview-card">
          <div className="preview-item">
            <span className="preview-label">Method:</span>
            <span className="preview-value">
              {payload.method === 'bank' ? 'Bank Transfer' : 'Cryptocurrency'}
            </span>
          </div>
          
          <div className="preview-item">
            <span className="preview-label">Amount:</span>
            <span className="preview-value">${Number(payload.amount).toFixed(2)}</span>
          </div>

          {payload.method === 'bank' && (
            <>
              <div className="preview-item">
                <span className="preview-label">Bank:</span>
                <span className="preview-value">{payload.bank.bank}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Account Number:</span>
                <span className="preview-value">{payload.bank.accountNumber}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Reference:</span>
                <span className="preview-value">{payload.bank.reference || '—'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Phone:</span>
                <span className="preview-value">{payload.bank.phone || '—'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Account Holder:</span>
                <span className="preview-value">
                  {`${payload.bank.firstName || ''} ${payload.bank.lastName || ''}`.trim()}
                </span>
              </div>
            </>
          )}
          
          {payload.method === 'crypto' && (
            <>
              <div className="preview-item">
                <span className="preview-label">Cryptocurrency:</span>
                <span className="preview-value">{payload.crypto.cryptoWallet}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Wallet Address:</span>
                <span className="preview-value">
                  {payload.crypto.walletAddress.slice(0, 20)}...
                  {payload.crypto.walletAddress.slice(-10)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="button-group">
          <button 
            className="btn btn-primary btn-flex" 
            onClick={submit} 
            disabled={loading || !isWithdrawalAllowed()} // NEW: Disable if not allowed
          >
            {loading ? 'Processing…' : 'Confirm & Submit'}
          </button>
          <button 
            className="btn btn-secondary btn-flex" 
            onClick={() => nav(-1)}
          >
            Edit Details
          </button>
        </div>

        {error && <div className="message message-error">{error}</div>}
        
        {/* NEW: Show status message if withdrawal is not allowed */}
        {statusMessage && !error && (
          <div className={`message message-${statusMessage.type}`}>
            {statusMessage.message}
          </div>
        )}
        
        <div className="message" style={{background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1'}}>
          <strong>Note:</strong> Your withdrawal will be processed within 24 hours once approved by management.
        </div>
      </div>
    </div>
  )
}