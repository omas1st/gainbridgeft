import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import backend from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import '../styles/InvestConfirm.css'

// Currency configuration
const CURRENCY_CONFIG = {
  'South Africa': { code: 'ZAR', rate: 17, symbol: 'R' },
  'Nigeria': { code: 'NGN', rate: 1500, symbol: '₦' },
  'Ghana': { code: 'GHS', rate: 12.50, symbol: 'GH₵' },
  'Philippines': { code: 'PHP', rate: 58, symbol: '₱' }
};

export default function InvestConfirm(){
  const loc = useLocation()
  const nav = useNavigate()
  const { user } = useAuth()
  const plan = loc.state?.plan
  const [methodId, setMethodId] = useState(null)
  const [filteredMethods, setFilteredMethods] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [receiptFile, setReceiptFile] = useState(null)

  // Get currency configuration based on user's country
  const getCurrencyConfig = () => {
    const userCountry = user?.country;
    return CURRENCY_CONFIG[userCountry] || null;
  };

  // Format converted amount for display
  const formatConvertedAmount = (usdAmount) => {
    const currencyConfig = getCurrencyConfig();
    if (!currencyConfig) return null;
    
    const converted = (Number(usdAmount || 0) * currencyConfig.rate).toFixed(2);
    return `${currencyConfig.symbol}${converted}`;
  };

  const currencyConfig = getCurrencyConfig();
  const showCurrencyConversion = currencyConfig !== null;
  const convertedAmount = plan ? formatConvertedAmount(plan.amount) : null;
  
  // Check if user is from South Africa
  const isSouthAfrican = user?.country === 'South Africa';

  useEffect(()=>{ 
    let mounted = true
    async function loadSettings(){
      try {
        const { data } = await backend.get('/settings')
        if (!mounted) return
        const paymentMethods = (data.settings && data.settings.paymentMethods) ? data.settings.paymentMethods : []
        
        // Filter methods based on user's country
        let filtered = [];
        if (isSouthAfrican) {
          // For South African users, show both bank and crypto methods
          filtered = paymentMethods;
        } else {
          // For non-South African users, show only crypto methods
          filtered = paymentMethods.filter(method => 
            method.type === 'crypto' || 
            (method.label && method.label.toLowerCase().includes('crypto')) ||
            (method.details && method.details.crypto)
          );
          
          // If no crypto methods found, keep all methods but default to crypto
          if (filtered.length === 0 && paymentMethods.length > 0) {
            filtered = paymentMethods;
          }
        }
        
        setFilteredMethods(filtered);
        
        // Set default method
        if (filtered.length > 0) {
          setMethodId(filtered[0].id);
        }
      } catch (err) {
        console.warn('load settings', err)
      }
    }
    loadSettings()
    return ()=> { mounted = false }
  },[isSouthAfrican])

  if(!plan) return (
    <div className="container">
      <div className="card" style={{marginTop:16}}>No plan selected. Go back to <a href="/invest">Invest</a>.</div>
    </div>
  )

  // Use business days approximation for display: 60 calendar days ≈ 60 * 5/7 => ~42 business days
  const businessDays = Math.floor((plan.days || 60) * 5 / 7)
  const dailyProfit = Number((plan.amount * (plan.rate / 100)).toFixed(2))
  const totalProfit = Number((dailyProfit * businessDays).toFixed(2))
  const totalAfter = Number((Number(plan.amount) + totalProfit).toFixed(2))

  function selectedMethod(){
    return filteredMethods.find(m => m.id === methodId) || null
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid file (JPEG, PNG, JPG, or PDF)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setReceiptFile(file);
      setError(null);
    }
  };

  async function markPaid(){
    setError(null)
    setMsg(null)
    if (!user || !user.id) { setError('User not authenticated'); return }
    if (!methodId) { setError('Please select a payment method'); return }
    if (!receiptFile) { setError('Please upload your payment receipt'); return }
    
    setLoading(true)
    try {
      // First upload the receipt to Cloudinary
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      console.log('Uploading receipt...');
      
      // FIXED: Use the correct endpoint - '/users/upload/receipt' instead of '/upload/receipt'
      const uploadResponse = await backend.post('/users/upload/receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const receiptUrl = uploadResponse.data.url;
      console.log('Receipt uploaded successfully:', receiptUrl);

      // Then submit the deposit request with the receipt URL
      console.log('Submitting deposit request...');
      await backend.post(`/users/${user.id}/deposit`, { 
        amount: plan.amount, 
        method: methodId, 
        plan,
        receiptUrl 
      })
      
      setMsg('Payment request submitted — your payment is now pending. Your account will be credited within 24 hours once the payment is confirmed by an administrator.')
      setTimeout(()=> nav('/dashboard'), 2200)
    } catch (err) {
      console.error('Payment submission error:', err);
      console.error('Error response:', err.response);
      
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to submit payment request';
      setError(errorMessage);
      
      // More specific error messages based on status code
      if (err.response?.status === 404) {
        setError('Upload service unavailable. Please try again later or contact support.');
      } else if (err.response?.status === 413) {
        setError('File too large. Please select a file smaller than 5MB.');
      } else if (err.response?.status === 400) {
        setError(`Upload error: ${errorMessage}`);
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      }
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
            {showCurrencyConversion && (
              <span className="amount-zar">≈ {convertedAmount} {currencyConfig?.code}</span>
            )}
          </div>
        </section>

        {/* Investment Details Section */}
        <section className="investment-details-section">
          <h3 className="section-subtitle">Investment Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Daily Return:</span>
              <span className="detail-value">
                ${dailyProfit.toFixed(2)}
                {showCurrencyConversion && (
                  <span style={{fontSize: '0.9em', color: '#666', marginLeft: '4px'}}>
                    ({formatConvertedAmount(dailyProfit)})
                  </span>
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Investment Period:</span>
              <span className="detail-value">{plan.days} days ({businessDays} business days)</span>
            </div>
            <div className="detail-item total-return">
              <span className="detail-label">Total After {plan.days} Days:</span>
              <span className="detail-value">
                ${totalAfter.toFixed(2)}
                {showCurrencyConversion && (
                  <span style={{fontSize: '0.9em', color: '#666', marginLeft: '4px'}}>
                    ({formatConvertedAmount(totalAfter)})
                  </span>
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Bitcoin Payment Guide Section */}
        <section className="bitcoin-guide-section">
          <h3 className="section-subtitle">How to Pay with Bitcoin</h3>
          <div className="guide-content">
            <p className="guide-text">
              We recommend watching this video guide to understand how to make payments using Cryptocurrency.
              This will help ensure your payment is processed correctly and without delays.
            </p>
            <button 
              className="video-guide-btn"
              onClick={() => window.open('https://youtu.be/jh0RXXXsBmY', '_blank')}
            >
              Watch Bitcoin Payment Guide
            </button>
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
              {filteredMethods.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label || `${m.type} — ${m.id}`}
                </option>
              ))}
              {filteredMethods.length === 0 && (
                <option value="crypto">Cryptocurrency</option>
              )}
            </select>
            {!isSouthAfrican && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                Cryptocurrency payment is required for your region.
              </div>
            )}
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
                      Make exact payment of ${Number(plan.amount).toFixed(2)} 
                      {showCurrencyConversion && ` (≈ ${convertedAmount} ${currencyConfig?.code})`} 
                      and use the reference.
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
                      Make exact payment of ${Number(plan.amount).toFixed(2)} 
                      {showCurrencyConversion && ` (≈ ${convertedAmount} ${currencyConfig?.code})`}
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
              // Fallback for when no methods are available
              <div className="crypto-details">
                <div className="detail-row">
                  <span className="detail-label">Cryptocurrency:</span>
                  <span className="detail-value">Bitcoin</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Wallet Address:</span>
                  <div className="detail-with-copy">
                    <span className="detail-value">3Liim5xHAkLEgUjzfw2DNFqbEkzaXgWWu8</span>
                    <button 
                      className={`copy-btn ${isCopied('fallback-wallet') ? 'copied' : ''}`} 
                      onClick={()=>copyToClipboard('3Liim5xHAkLEgUjzfw2DNFqbEkzaXgWWu8', 'fallback-wallet')}
                    >
                      {isCopied('fallback-wallet') ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="payment-note">
                  Make exact payment of ${Number(plan.amount).toFixed(2)} 
                  {showCurrencyConversion && ` (≈ ${convertedAmount} ${currencyConfig?.code})`}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Upload Payment Receipt Section */}
        <section className="receipt-upload-section">
          <h3 className="section-subtitle">Upload Payment Receipt</h3>
          <div className="receipt-upload-area">
            <div className="upload-instructions">
              <p>After making your payment, please upload a screenshot or photo of your payment receipt/proof.</p>
              <p><strong>Supported formats:</strong> JPG, PNG, PDF (Max 5MB)</p>
            </div>
            
            <div className="file-input-group">
              <input 
                type="file" 
                id="receipt-upload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="receipt-upload" className="file-input-label">
                Choose File
              </label>
              {receiptFile && (
                <span className="file-name">{receiptFile.name}</span>
              )}
            </div>
          </div>
        </section>

        {/* Action Section */}
        <section className="action-section">
          <div className="action-instruction">
            <p className="instruction-text">
              After completing your payment and uploading the receipt above, please click the button below to notify us.
            </p>
          </div>
          
          <div className="action-buttons">
            <button 
              className="confirm-btn primary" 
              onClick={markPaid} 
              disabled={loading || !receiptFile}
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