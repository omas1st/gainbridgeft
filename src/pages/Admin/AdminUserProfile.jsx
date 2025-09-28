import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import backend from '../../services/api'
import '../../styles/AdminUserProfile.css'

export default function AdminUserProfile(){
  const { id } = useParams()
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(false)

  useEffect(()=> {
    let mounted = true
    async function loadUser(){
      setLoading(true)
      try {
        const { data } = await backend.get(`/admin/user/${id}`)
        if(!mounted) return
        setUser(data.user)
      } catch (e) {
        if(!mounted) return
        setErr(e?.response?.data?.message || e.message)
      } finally {
        if(mounted) setLoading(false)
      }
    }
    if(id) loadUser()
    return ()=> { mounted = false }
  }, [id])

  useEffect(()=> {
    let mounted = true
    async function loadTx(){
      setTxLoading(true)
      try {
        const { data } = await backend.get(`/admin/user/${id}/transactions`)
        if(!mounted) return
        setTransactions(data.transactions || [])
      } catch (e) {
        console.warn('load transactions', e)
        setTransactions([])
      } finally {
        if(mounted) setTxLoading(false)
      }
    }
    if(id) loadTx()
    return ()=> { mounted = false }
  }, [id])

  async function save(){
    setSaving(true); setMsg(null); setErr(null)
    try {
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        country: user.country,
        profileType: user.profileType,
        role: user.role,
        capital: Number(user.capital || 0),
        netProfit: Number(user.netProfit || 0),
        referralEarnings: Number(user.referralEarnings || 0),
        referrals: user.referrals
      }
      const { data } = await backend.patch(`/admin/user/${id}`, payload)
      setUser(data.user)
      setMsg('Saved')
    } catch (e) {
      setErr(e?.response?.data?.message || e.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeUser(){
    if(!window.confirm('Soft-delete this user? This will mark user as deleted.')) return
    try {
      await backend.patch(`/admin/user/${id}`, { deleted: true })
      setMsg('User soft-deleted')
      setTimeout(() => nav('/admin'), 700)
    } catch (e) {
      setErr(e?.response?.data?.message || e.message)
    }
  }

  function updateReferral(index, key, value){
    setUser(prev => {
      const copy = { ...prev }
      copy.referrals = Array.isArray(copy.referrals) ? [...copy.referrals] : []
      copy.referrals[index] = { ...copy.referrals[index], [key]: value }
      return copy
    })
  }

  const getTransactionClass = (transaction) => {
    const baseClass = 'admin-transaction-item'
    if (transaction.type === 'deposit') return `${baseClass} admin-transaction-item-deposit`
    if (transaction.type === 'withdrawal') return `${baseClass} admin-transaction-item-withdrawal`
    return baseClass
  }

  const getBadgeClass = (status) => {
    return `admin-badge admin-badge--${status.toLowerCase()}`
  }

  if (loading) return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-card">
        <div className="admin-user-profile-loading">Loading...</div>
      </div>
    </div>
  )

  if (!user) return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-card">
        {err ? <div className="admin-user-profile-error">{err}</div> : 'User not found'}
      </div>
    </div>
  )

  return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-card">
        <div className="admin-user-profile-header">
          <h2>User profile — {user.email}</h2>
        </div>

        <div className="admin-user-profile-grid">
          <div className="admin-user-profile-section">
            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">First name</label>
              <input 
                className="admin-user-profile-input"
                value={user.firstName || ''} 
                onChange={e=>setUser({...user, firstName:e.target.value})} 
              />
            </div>

            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Last name</label>
              <input 
                className="admin-user-profile-input"
                value={user.lastName || ''} 
                onChange={e=>setUser({...user, lastName:e.target.value})} 
              />
            </div>

            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Email</label>
              <input 
                className="admin-user-profile-input"
                value={user.email || ''} 
                disabled 
              />
            </div>

            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Phone</label>
              <input 
                className="admin-user-profile-input"
                value={user.phone || ''} 
                onChange={e=>setUser({...user, phone:e.target.value})} 
              />
            </div>

            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Country</label>
              <input 
                className="admin-user-profile-input"
                value={user.country || ''} 
                onChange={e=>setUser({...user, country:e.target.value})} 
              />
            </div>
          </div>

          <div className="admin-user-profile-section">
            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Profile type</label>
              <select 
                className="admin-user-profile-select"
                value={user.profileType || user.role || 'Investor account'} 
                onChange={e=>setUser({...user, profileType: e.target.value})}
              >
                <option>Investor account</option>
                <option>Agent account</option>
                <option>admin</option>
                <option>management</option>
              </select>
            </div>

            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Capital</label>
              <input 
                type="number" 
                className="admin-user-profile-input"
                value={user.capital ?? 0} 
                onChange={e=>setUser({...user, capital: e.target.value})} 
              />
            </div>

            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Net Profit</label>
              <input 
                type="number" 
                className="admin-user-profile-input"
                value={user.netProfit ?? 0} 
                onChange={e=>setUser({...user, netProfit: e.target.value})} 
              />
            </div>

            <div className="admin-user-profile-field">
              <label className="admin-user-profile-label">Referral Earnings</label>
              <input 
                type="number" 
                className="admin-user-profile-input"
                value={user.referralEarnings ?? 0} 
                onChange={e=>setUser({...user, referralEarnings: e.target.value})} 
              />
            </div>

            <div className="admin-user-profile-actions">
              <button className="admin-user-profile-save-btn" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="admin-user-profile-delete-btn" onClick={removeUser}>
                Delete
              </button>
              <button className="admin-user-profile-back-btn" onClick={()=>nav('/admin')}>
                Back
              </button>
            </div>
            
            {msg && <div className="admin-user-profile-message admin-user-profile-success">{msg}</div>}
            {err && <div className="admin-user-profile-message admin-user-profile-error">{err}</div>}
          </div>
        </div>

        <div>
          <h3 className="admin-user-profile-section-header">Referrals</h3>
          {(!user.referrals || user.referrals.length === 0) && (
            <div className="admin-user-profile-empty">No referrals</div>
          )}
          
          <div className="admin-referrals-list">
            {(user.referrals || []).map((r, idx) => (
              <div key={r._id || r.user || idx} className="admin-referral-item">
                <div className="admin-referral-header">
                  <div className="admin-referral-email">
                    {r.email || r.emailAddress || (r.user && r.user.email) || '—'}
                  </div>
                  <div className="admin-referral-controls">
                    <div className="admin-referral-field">
                      <label className="admin-referral-label">Capital</label>
                      <input 
                        type="number" 
                        className="admin-referral-input"
                        value={r.capital ?? 0} 
                        onChange={e=>updateReferral(idx, 'capital', Number(e.target.value || 0))} 
                      />
                    </div>
                    <div className="admin-referral-field">
                      <label className="admin-referral-label">Commission</label>
                      <input 
                        type="number" 
                        className="admin-referral-input"
                        value={r.commissionEarned ?? r.referralEarning ?? 0} 
                        onChange={e=>updateReferral(idx, 'commissionEarned', Number(e.target.value || 0))} 
                      />
                    </div>
                  </div>
                </div>
                <div className="admin-referral-meta">
                  Referred user id: {r.user ? (r.user._id || r.user) : '—'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="admin-referral-note">
            Editing referral capital/commission updates the stored referral snapshot on this user's profile. 
            If you want to update the referred user's own account balances, edit that user profile separately.
          </div>
        </div>

        <div>
          <h3 className="admin-user-profile-section-header">Transactions</h3>
          {txLoading && <div className="admin-user-profile-loading">Loading transactions...</div>}
          {(!transactions || transactions.length === 0) && !txLoading && (
            <div className="admin-user-profile-empty">No transactions</div>
          )}
          
          <div className="admin-transactions-list">
            {transactions.map(t => (
              <div key={t._id || t.id} className={getTransactionClass(t)}>
                <div className="admin-transaction-main">
                  <div className="admin-transaction-info">
                    <div className="admin-transaction-type">
                      {t.type} — ${t.amount} — <span className={getBadgeClass(t.status)}>{t.status}</span>
                    </div>
                    <div className="admin-transaction-meta">
                      Date: {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'} • Method: {t.method || t.details?.method || '—'}
                    </div>
                    {t.adminRemarks && (
                      <div className="admin-transaction-meta">Admin: {t.adminRemarks}</div>
                    )}
                  </div>
                  <div className="admin-transaction-details">
                    {t.details?.approvedAmount && (
                      <div className="admin-transaction-approved">
                        Approved: ${t.details.approvedAmount}
                      </div>
                    )}
                    {t.details?.bank && (
                      <div className="admin-transaction-bank-details">
                        Bank: {t.details.bank.bank || t.details.bank.bankName} • A/C: {t.details.bank.accountNumber}
                      </div>
                    )}
                    {t.details?.crypto && (
                      <div className="admin-transaction-bank-details">
                        Crypto: {t.details.crypto.walletAddress || t.details.crypto.address} • Network: {t.details.crypto.network}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-user-profile-footer">
          Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
        </div>
      </div>
    </div>
  )
}