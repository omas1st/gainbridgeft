// src/pages/Dashboard/Withdraw.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/Withdraw.css'

const SA_BANKS = [
  'FNB', 'Standard Bank', 'Absa', 'Nedbank', 'Capitec', 'Investec', 'Postbank', 'Mercantile Bank', 'TymeBank', 'African Bank'
]

export default function Withdraw(){
  const { user } = useAuth()
  const [method, setMethod] = useState('bank')
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState(SA_BANKS[0])
  const [accountNumber, setAccountNumber] = useState('')
  const [reference, setReference] = useState('')
  const [cryptoWallet, setCryptoWallet] = useState('Bitcoin')
  const [walletAddress, setWalletAddress] = useState('')
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const nav = useNavigate()
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Instead of POSTing immediately, navigate to preview with payload and userId.
  // The preview page will POST to the proper backend endpoint when user confirms.
  async function handleProceed(e){
    e.preventDefault()
    setError(null)

    if (!user || !user.id) { setError('User not authenticated'); return }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount'); return }

    const payload = { method, amount: Number(amount) }
    if (method === 'bank') {
      payload.bank = { bank, accountNumber, reference, firstName, lastName, phone }
    } else {
      payload.crypto = { cryptoWallet, walletAddress }
    }

    setSubmitting(true)
    try {
      // Navigate to preview; preview will perform the final POST to `/users/:id/withdraw`
      nav('/dashboard/withdraw/preview', { state: { payload, userId: user.id } })
    } catch (err) {
      setError(err?.message || 'Navigation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h2 className="withdraw-header">Withdraw Funds</h2>
        
        <div className="method-toggle">
          <button 
            type="button"
            className={`method-option ${method === 'bank' ? 'active' : ''}`}
            onClick={() => setMethod('bank')}
          >
            Bank Transfer
          </button>
          <button 
            type="button"
            className={`method-option ${method === 'crypto' ? 'active' : ''}`}
            onClick={() => setMethod('crypto')}
          >
            Cryptocurrency
          </button>
        </div>

        <form onSubmit={handleProceed} className="withdraw-form">
          <div className="form-group">
            <label className="form-label">Amount (USD)</label>
            <div className="amount-input-group">
              <span className="currency-symbol">$</span>
              <input 
                className="form-input amount-input"
                value={amount} 
                onChange={e=>setAmount(e.target.value)} 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="0.00"
              />
            </div>
          </div>

          {method === 'bank' ? (
            <div className="method-section">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input 
                    className="form-input"
                    value={firstName} 
                    onChange={e=>setFirstName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input 
                    className="form-input"
                    value={lastName} 
                    onChange={e=>setLastName(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input 
                  className="form-input"
                  value={phone} 
                  onChange={e=>setPhone(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank</label>
                <select 
                  className="form-input"
                  value={bank} 
                  onChange={e=>setBank(e.target.value)}
                >
                  {SA_BANKS.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account number</label>
                <input 
                  className="form-input"
                  value={accountNumber} 
                  onChange={e=>setAccountNumber(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reference (optional)</label>
                <input 
                  className="form-input"
                  value={reference} 
                  onChange={e=>setReference(e.target.value)} 
                />
              </div>
            </div>
          ) : (
            <div className="method-section">
              <div className="form-group">
                <label className="form-label">Crypto Wallet</label>
                <select 
                  className="form-input"
                  value={cryptoWallet} 
                  onChange={e=>setCryptoWallet(e.target.value)}
                >
                  <option>Bitcoin</option>
                  <option>Ethereum</option>
                  <option>Toncoin</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Wallet Address</label>
                <input 
                  className="form-input"
                  value={walletAddress} 
                  onChange={e=>setWalletAddress(e.target.value)} 
                  placeholder="Enter your wallet address"
                />
              </div>
            </div>
          )}

          <div className="button-group">
            <button 
              className="btn btn-primary btn-flex" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Proceed to Preview'}
            </button>
          </div>
          
          {error && <div className="message message-error">{error}</div>}
        </form>
      </div>
    </div>
  )
}