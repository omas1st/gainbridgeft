import React, { useEffect, useState } from 'react'
import backend from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/Referral.css'

export default function Referral(){
  const { user } = useAuth()
  const [refs, setRefs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState(null) // null | 'copied' | 'failed'

  useEffect(()=>{
    let mounted = true
    async function load(){
      if (!user?.id) return
      setLoading(true)
      try{
        const { data } = await backend.get(`/users/${user.id}/referrals`)
        if (!mounted) return
        setRefs(data.referrals || [])
        setTotal(data.totalReferralEarnings || 0)
      }catch(e){
        console.warn('load referrals err', e)
        if (mounted) { setRefs([]); setTotal(0) }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  },[user])

  const referralLink = `${window.location.origin}/register?ref=${encodeURIComponent(user?.username || '')}`

  // robust copy: use clipboard API when available, fallback to textarea+execCommand
  async function copyToClipboard(text){
    setCopyStatus(null)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        // avoid scrolling to bottom
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (!ok) throw new Error('execCommand copy failed')
      }
      setCopyStatus('copied')
      // reset status after a short delay
      setTimeout(()=>setCopyStatus(null), 2200)
    } catch (err) {
      console.warn('copy failed', err)
      setCopyStatus('failed')
      setTimeout(()=>setCopyStatus(null), 2200)
    }
  }

  return (
    <div className="referral-container">
      {/* Header Section */}
      <div className="referral-header">
        <h1 className="referral-title">Referral Program</h1>
        <p className="referral-subtitle">Earn rewards by referring friends to our platform</p>
      </div>

      <div className="referral-card">
        {/* Referral Link Section */}
        <div className="referral-link-section">
          <div className="referral-link-header">
            <span className="referral-link-icon">🔗</span>
            <h3 className="referral-link-title">Your Referral Link</h3>
          </div>
          
          <div className="referral-link-container">
            <div className="referral-link-display">
              <span className="referral-link-label">Share this link with friends:</span>
              <div className="referral-link-value">{referralLink}</div>
            </div>
            
            <div className="referral-link-actions">
              <button 
                className={`btn ${copyStatus === 'copied' ? 'btn-success' : 'btn-primary'}`}
                onClick={()=>copyToClipboard(referralLink)}
              >
                {copyStatus === 'copied' ? '✅ Copied!' : 
                 copyStatus === 'failed' ? '❌ Failed' : 
                 '📋 Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="earnings-summary">
          <div className="earnings-label">Total Referral Earnings</div>
          <div className="earnings-amount">${Number(total).toFixed(2)}</div>
        </div>

        {/* Referrals List */}
        <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Your Referrals ({refs.length})</h3>
        
        {loading && (
          <div className="referral-loading">
            <span className="loading-spinner"></span>
            Loading referrals...
          </div>
        )}
        
        {!loading && refs.length === 0 ? (
          <div className="referral-empty">
            <div className="referral-empty-icon">👥</div>
            <div className="referral-empty-title">No referrals yet</div>
            <div className="referral-empty-text">
              Share your referral link to start earning rewards!
            </div>
          </div>
        ) : (
          <div className="referrals-list">
            {refs.map(r=>(
              <div key={r._id || r.email} className="referral-item">
                <div className="referral-info">
                  <div className="referral-email">{r.email}</div>
                  <div className="referral-detail">
                    Investment Capital: ${Number(r.capital || 0).toFixed(2)}
                  </div>
                </div>
                <div className="referral-earnings">
                  <div className="earnings-amount-sm">${Number(r.referralEarning || 0).toFixed(2)}</div>
                  <div className="earnings-label-sm">Your Earnings</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}