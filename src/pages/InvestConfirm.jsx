// src/pages/InvestConfirm.jsx
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import backend from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import '../styles/InvestConfirm.css'

export default function InvestConfirm(){
  const loc = useLocation()
  const nav = useNavigate()
  const { user } = useAuth()
  const plan = loc.state?.plan
  const [methodId, setMethodId] = useState(null)
  const [methods, setMethods] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [copiedField, setCopiedField] = useState(null) // Track which field was copied

  // Fixed conversion rate (display-only) — do not use this to change the payment amount sent to backend.
  const USD_TO_ZAR = 17 // 1 USD ≈ 17 ZAR (display only)
  const zarAmount = plan ? Number(plan.amount) * USD_TO_ZAR : 0

  useEffect(()=>{ 
    let mounted = true
    async function loadSettings(){
      try {
        const { data } = await backend.get('/settings')
        if (!mounted) return
        const pm = (data.settings && data.settings.paymentMethods) ? data.settings.paymentMethods : []
        setMethods(pm)
        if (pm.length > 0) setMethodId(pm[0].id)
      } catch (err) {
        console.warn('load settings', err)
      }
    }
    loadSettings()
    return ()=> { mounted = false }
  },[])

  if(!plan) return (
    <div className="container">
      <div className="card" style={{marginTop:16}}>No plan selected. Go back to <a href="/invest">Invest</a>.</div>
    </div>
  )

  // Use business days approximation for display: 60 calendar days ≈ 60 * 5/7 => ~42 business days
  // NOTE: switched to SIMPLE-interest calculation (same as the invest page & backend)
  const businessDays = Math.floor((plan.days || 60) * 5 / 7)
  const dailyProfit = Number((plan.amount * (plan.rate / 100)).toFixed(2)) // simple interest per day
  const totalProfit = Number((dailyProfit * businessDays).toFixed(2))
  const totalAfter = Number((Number(plan.amount) + totalProfit).toFixed(2))

  function selectedMethod(){
    return methods.find(m => m.id === methodId) || null
  }

  async function markPaid(){
    setError(null)
    setMsg(null)
    if (!user || !user.id) { setError('User not authenticated'); return }
    if (!methodId) { setError('Please select a payment method'); return }
    setLoading(true)
    try {
      // Send only the method id to avoid backend/model casting issues.
      // Backend will store method id in the transaction.method field and keep the full method details in details.method (if needed).
      // IMPORTANT: we send the USD amount (plan.amount) — the ZAR conversion shown on this page is display-only and does not change the amount sent to the server.
      await backend.post(`/users/${user.id}/deposit`, { amount: plan.amount, method: methodId, plan })
      // show pending message, then redirect
      setMsg('Payment request submitted — your payment is now pending. Your account will be credited within 24 hours once the payment is confirmed by an administrator.')
      // Redirect after a short moment so user reads message
      setTimeout(()=> nav('/dashboard'), 2200)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to notify payment')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text, fieldName){
    if (!navigator?.clipboard) {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try { 
        document.execCommand('copy'); 
        setCopiedField(fieldName);
        setTimeout(()=> setCopiedField(null), 1500);
      } catch(e){ 
        console.error('Copy failed:', e);
      }
      document.body.removeChild(ta)
      return;
    }
    
    navigator.clipboard.writeText(text).then(()=> {
      setCopiedField(fieldName);
      setTimeout(()=> setCopiedField(null), 1500);
    }).catch((err) => {
      console.error('Copy failed:', err);
    });
  }

  // Helper function to determine if a field was recently copied
  const isCopied = (fieldName) => copiedField === fieldName;

  return (
    <div className="invest-confirm-container">
      <div className="invest-confirm-card">
        {/* Confirm Payment Section */}
        <section className="confirm-payment-section">
          <h2 className="section-title">Confirm Payment</h2>
          <div className="payment-amount">
            <span className="amount-usd">${Number(plan.amount).toFixed(2)}</span>
            {zarAmount && <span className="amount-zar">≈ R{zarAmount.toFixed(2)} ZAR</span>}
          </div>
        </section>

        {/* Investment Details Section */}
        <section className="investment-details-section">
          <h3 className="section-subtitle">Investment Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Daily Return:</span>
              <span className="detail-value">${dailyProfit.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Investment Period:</span>
              <span className="detail-value">{plan.days} days ({businessDays} business days)</span>
            </div>
            <div className="detail-item total-return">
              <span className="detail-label">Total After {plan.days} Days:</span>
              <span className="detail-value">${totalAfter.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Payment Method Section */}
        <section className="payment-method-section">
          <h3 className="section-subtitle">Select Payment Method</h3>
          <div className="method-selector">
            <label className="method-label">Payment Method</label>
            <select 
              value={methodId || ''} 
              onChange={e=>setMethodId(e.target.value)}
              className="method-dropdown"
            >
              {methods.map(m => <option key={m.id} value={m.id}>{m.label || `${m.type} — ${m.id}`}</option>)}
              {methods.length === 0 && <option value="bank">Bank transfer</option>}
            </select>
          </div>
        </section>

        {/* Payment Details Section */}
        <section className="payment-details-section">
          <h3 className="section-subtitle">Payment Instructions</h3>
          <div className="payment-instructions">
            {selectedMethod() ? (
              <>
                <div className="method-header">
                  <h4 className="method-title">{selectedMethod().label}</h4>
                  <div className="method-description">{selectedMethod().content}</div>
                </div>

                {selectedMethod().type === 'bank' && (
                  <div className="bank-details">
                    <div className="detail-row">
                      <span className="detail-label">Bank:</span>
                      <span className="detail-value">{selectedMethod().details?.bankName || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account Name:</span>
                      <span className="detail-value">{selectedMethod().details?.accountName || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account Number:</span>
                      <div className="detail-with-copy">
                        <span className="detail-value">{selectedMethod().details?.accountNumber || '—'}</span>
                        {selectedMethod().details?.accountNumber && (
                          <button 
                            className={`copy-btn ${isCopied('accountNumber') ? 'copied' : ''}`} 
                            onClick={()=>copyToClipboard(selectedMethod().details.accountNumber, 'accountNumber')}
                          >
                            {isCopied('accountNumber') ? '✓ Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Reference (Compulsory):</span>
                      <div className="detail-with-copy">
                        <span className="detail-value">{selectedMethod().details?.reference || '—'}</span>
                        {selectedMethod().details?.reference && (
                          <button 
                            className={`copy-btn ${isCopied('reference') ? 'copied' : ''}`} 
                            onClick={()=>copyToClipboard(selectedMethod().details.reference, 'reference')}
                          >
                            {isCopied('reference') ? '✓ Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="payment-note">
                      Make exact payment of ${Number(plan.amount).toFixed(2)} {zarAmount ? `(≈ R${zarAmount.toFixed(2)} ZAR)` : ''} and use the reference.
                      <div className="important-note" style={{marginTop:8,fontStyle:'italic'}}>
                        Note: Transfers via Capitec bank are not allowed — Capitec bank users should use an ATM deposit instead.
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod().type === 'crypto' && (
                  <div className="crypto-details">
                    <div className="detail-row">
                      <span className="detail-label">Cryptocurrency:</span>
                      <span className="detail-value">{selectedMethod().details?.crypto || selectedMethod().label || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Wallet Address:</span>
                      <div className="detail-with-copy">
                        <span className="detail-value">{selectedMethod().details?.address || selectedMethod().details?.wallet || '—'}</span>
                        {(selectedMethod().details?.address || selectedMethod().details?.wallet) && (
                          <button 
                            className={`copy-btn ${isCopied('wallet') ? 'copied' : ''}`} 
                            onClick={()=>copyToClipboard(selectedMethod().details.address || selectedMethod().details.wallet, 'wallet')}
                          >
                            {isCopied('wallet') ? '✓ Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="payment-note">
                      Make exact payment of ${Number(plan.amount).toFixed(2)} {zarAmount ? `(≈ R${zarAmount.toFixed(2)} ZAR)` : ''} 
                    </div>
                  </div>
                )}

                {selectedMethod().type === 'other' && (
                  <div className="other-details">
                    <pre className="method-json">{JSON.stringify(selectedMethod().details || {}, null, 2)}</pre>
                  </div>
                )}
              </>
            ) : (
              <div className="bank-details">
                <div className="detail-row">
                  <span className="detail-label">Bank:</span>
                  <span className="detail-value">FnB</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Name:</span>
                  <span className="detail-value">GainBridge</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Number:</span>
                  <div className="detail-with-copy">
                    <span className="detail-value">62509963139</span>
                    <button 
                      className={`copy-btn ${isCopied('fallback-account') ? 'copied' : ''}`} 
                      onClick={()=>copyToClipboard('62509963139', 'fallback-account')}
                    >
                      {isCopied('fallback-account') ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reference (Compulsory):</span>
                  <div className="detail-with-copy">
                    <span className="detail-value">0657350788</span>
                    <button 
                      className={`copy-btn ${isCopied('fallback-reference') ? 'copied' : ''}`} 
                      onClick={()=>copyToClipboard('0657350788', 'fallback-reference')}
                    >
                      {isCopied('fallback-reference') ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="payment-note">
                  Make exact payment of ${Number(plan.amount).toFixed(2)} {zarAmount ? `(≈ R${zarAmount.toFixed(2)} ZAR)` : ''} and use the reference.
                  <div className="important-note" style={{marginTop:8,fontStyle:'italic'}}>
                    Note: Transfers via Capitec bank are not allowed — Capitec bank users should use an ATM deposit instead.
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Action Section */}
        <section className="action-section">
          <div className="action-instruction">
            <p className="instruction-text">
              After completing your payment using the instructions above, please click the button below to notify us.
              <br />
              <strong>It is compulsory to send your payment receipt/proof to our platform email: <a href="mailto:gainbridgeinvest@gmail.com">gainbridgeinvest@gmail.com</a>.</strong>
            </p>
          </div>
          
          <div className="action-buttons">
            <button 
              className="confirm-btn primary" 
              onClick={markPaid} 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'I Have Made Payment'}
            </button>
            <button 
              className="confirm-btn secondary" 
              onClick={()=>nav('/invest')}
            >
              Cancel
            </button>
          </div>

          {msg && <div className="message success">{msg}</div>}
          {error && <div className="message error">{error}</div>}
        </section>
      </div>
    </div>
  )
}
