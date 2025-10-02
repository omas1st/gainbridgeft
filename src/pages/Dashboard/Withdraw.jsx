import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import backend from '../../services/api'
import '../../styles/Withdraw.css'

const SA_BANKS = [
  'FNB', 'Standard Bank', 'Absa', 'Nedbank', 'Capitec', 'Investec', 'Postbank', 'Mercantile Bank', 'TymeBank', 'African Bank'
]

// Currency configuration
const CURRENCY_CONFIG = {
  'South Africa': { code: 'ZAR', rate: 17, symbol: 'R' },
  'Nigeria': { code: 'NGN', rate: 1500, symbol: '₦' },
  'Ghana': { code: 'GHS', rate: 12.50, symbol: 'GH₵' },
  'Philippines': { code: 'PHP', rate: 58, symbol: '₱' }
};

export default function Withdraw(){
  const { user } = useAuth()
  const [method, setMethod] = useState('')
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

  // Available withdrawal amount
  const [availableUSD, setAvailableUSD] = useState(null)
  const [loadingAvailable, setLoadingAvailable] = useState(true)

  // Get currency configuration based on user's country
  const getCurrencyConfig = () => {
    const userCountry = user?.country;
    return CURRENCY_CONFIG[userCountry] || null;
  };

  // Format converted amount
  const formatConvertedAmount = (usdAmount) => {
    const currencyConfig = getCurrencyConfig();
    if (!currencyConfig) return '';
    
    const converted = (Number(usdAmount || 0) * currencyConfig.rate).toFixed(2);
    return `${currencyConfig.symbol}${converted}`;
  };

  const currencyConfig = getCurrencyConfig();
  const showCurrencyConversion = currencyConfig !== null;
  
  // Check if user is from South Africa
  const isSouthAfrican = user?.country === 'South Africa';

  // Set default method based on user's country
  useEffect(() => {
    if (isSouthAfrican) {
      setMethod('bank');
    } else {
      setMethod('crypto');
    }
  }, [isSouthAfrican]);

  useEffect(() => {
    let mounted = true
    async function fetchOverview() {
      if (!user || !user.id) {
        setAvailableUSD(0)
        setLoadingAvailable(false)
        return
      }
      setLoadingAvailable(true)
      try {
        const res = await backend.get(`/users/${user.id}/overview`)
        const overview = res?.data?.overview || {}
        const netProfit = Number(overview.netProfit || 0)
        const referralEarnings = Number(overview.referralEarnings || 0)
        const available = Number((netProfit + referralEarnings) || 0)
        if (mounted) {
          setAvailableUSD(Number(available.toFixed(2)))
        }
      } catch (err) {
        const fallbackAvailable = Number((user?.netProfit || 0) + (user?.referralEarnings || 0))
        if (mounted) setAvailableUSD(Number((fallbackAvailable || 0).toFixed(2)))
      } finally {
        if (mounted) setLoadingAvailable(false)
      }
    }
    fetchOverview()
    return () => { mounted = false }
  }, [user])

  function validateAmountValue(val) {
    const n = Number(val)
    if (isNaN(n)) return { ok: false, message: 'Invalid amount' }
    if (n < 2) return { ok: false, message: 'Minimum withdrawal is $2' }
    if (availableUSD !== null && n > availableUSD) return { ok: false, message: 'Amount exceeds available withdrawal balance' }
    return { ok: true }
  }

  async function handleProceed(e){
    e.preventDefault()
    setError(null)

    if (!user || !user.id) { setError('User not authenticated'); return }

    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount'); return }

    const amountNum = Number(amount)
    const amountValidation = validateAmountValue(amountNum)
    if (!amountValidation.ok) {
      setError(amountValidation.message)
      return
    }

    if (method === 'bank') {
      if (!accountNumber || String(accountNumber).trim() === '') {
        setError('Account number is required for bank transfers')
        return
      }
    } else {
      if (!walletAddress || String(walletAddress).trim() === '') {
        setError('Wallet address is required for cryptocurrency withdrawals')
        return
      }
    }

    const payload = { method, amount: amountNum }
    if (method === 'bank') {
      payload.bank = { bank, accountNumber, reference, firstName, lastName, phone }
    } else {
      payload.crypto = { cryptoWallet, walletAddress }
    }

    setSubmitting(true)
    try {
      nav('/dashboard/withdraw/preview', { state: { payload, userId: user.id } })
    } catch (err) {
      setError(err?.message || 'Navigation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const convertedAmount = amount ? formatConvertedAmount(amount) : showCurrencyConversion ? formatConvertedAmount(0) : ''
  const availableConverted = (availableUSD !== null) ? formatConvertedAmount(availableUSD) : showCurrencyConversion ? formatConvertedAmount(0) : ''
  const minAmount = 2
  const maxAmountAttr = (availableUSD !== null && !isNaN(availableUSD)) ? availableUSD : undefined

  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h2 className="withdraw-header">Withdraw Funds</h2>

        {/* Top: show available withdrawal with currency conversion */}
        <div className="available-row" style={{ marginBottom: 12 }}>
          <strong>Available to withdraw:&nbsp;</strong>
          {loadingAvailable ? (
            <span>Loading...</span>
          ) : (
            <span>
              ${availableUSD !== null ? availableUSD.toFixed(2) : '0.00'}
              {showCurrencyConversion && (
                <span> &nbsp;({availableConverted})</span>
              )}
            </span>
          )}
        </div>

        {/* Method Toggle - Only show if user is from South Africa */}
        {isSouthAfrican && (
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
        )}

        {/* Display method info for non-South African users */}
        {!isSouthAfrican && (
          <div className="method-info" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <strong>Withdrawal Method:</strong> Cryptocurrency
          </div>
        )}

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
                min={minAmount}
                {...(maxAmountAttr !== undefined ? { max: maxAmountAttr } : {})}
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <small className="field-subtext">
              {convertedAmount && `${convertedAmount} — `}Min ${minAmount}{availableUSD !== null ? `, Max $${availableUSD.toFixed(2)}` : ''}
            </small>
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
                  required
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
                  required
                />
              </div>
            </div>
          )}

          <div className="button-group">
            <button
              className="btn btn-primary btn-flex"
              type="submit"
              disabled={submitting || loadingAvailable || (availableUSD !== null && availableUSD < minAmount)}
            >
              {submitting ? 'Processing...' : 'Proceed to Preview'}
            </button>
          </div>

          {error && <div className="message message-error">{error}</div>}
          {availableUSD !== null && availableUSD < minAmount && (
            <div className="message message-info" style={{ marginTop: 8 }}>
              Your available withdrawal is less than the minimum (${minAmount}). You cannot withdraw at this time.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}