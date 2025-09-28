// src/pages/Dashboard/WithdrawPreview.jsx
import React, { useState } from 'react'
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

  async function submit(){
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

  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h2 className="withdraw-header">Review Withdrawal</h2>
        
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
            disabled={loading}
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
        
        <div className="message" style={{background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1'}}>
          <strong>Note:</strong> Your withdrawal will be processed within 24 hours once approved by management.
        </div>
      </div>
    </div>
  )
}