import React, { useEffect, useState, useCallback } from 'react'
import backend from '../../services/api'
import ConfirmModal from '../../components/ConfirmModal'
import '../../styles/AdminRequests.css'

function formatDate(d){ if(!d) return '—'; try { return new Date(d).toLocaleString() } catch(e){ return d } }

export default function AdminRequests(){
  const [loading, setLoading] = useState(false)
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [qUser, setQUser] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const buildQuery = useCallback(() => {
    const params = []
    if (qUser) params.push(`q=${encodeURIComponent(qUser)}`)
    if (from) params.push(`from=${encodeURIComponent(from)}`)
    if (to) params.push(`to=${encodeURIComponent(to)}`)
    if (type && type !== 'all') params.push(`type=${encodeURIComponent(type)}`)
    return params.length ? `?${params.join('&')}` : ''
  }, [qUser, from, to, type])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const q = buildQuery()
        const { data } = await backend.get(`/admin/requests${q}`)
        if (!mounted) return
        setDeposits(data.deposits || [])
        setWithdrawals(data.withdrawals || [])
      } catch (err) {
        console.warn('load admin requests', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [buildQuery])

  function openConfirmFor(request, reqType){
    setModalData({ request, reqType })
    setModalOpen(true)
  }

  async function doApprove(){
    if(!modalData) return
    const { request, reqType } = modalData
    setModalLoading(true)
    try {
      const { data } = await backend.post(`/admin/requests/${request._id || request.id}/approve`, {})

      // If API returned the updated transaction, apply update locally for immediacy
      if (data && data.tx) {
        const tx = data.tx
        if (reqType === 'deposit') {
          setDeposits(prev => prev.map(d => {
            const id = d._id || d.id
            const txId = tx._id || tx.id
            if (String(id) === String(txId) || String(id) === String(tx.transactionId || tx.txId || tx._id)) {
              return {
                ...d,
                status: tx.status || 'approved',
                approvedAt: tx.approvedAt || (tx.details && tx.details.approvedAt) || new Date().toISOString(),
                details: { ...(d.details || {}), ...(tx.details || {}) }
              }
            }
            return d
          }))
        } else {
          // withdrawal
          setWithdrawals(prev => prev.map(w => {
            const id = w._id || w.id
            const txId = tx._id || tx.id
            if (String(id) === String(txId) || String(id) === String(tx.transactionId || tx.txId || tx._id)) {
              return {
                ...w,
                status: tx.status || 'approved',
                approvedAt: tx.approvedAt || (tx.details && tx.details.approvedAt) || new Date().toISOString(),
                details: { ...(w.details || {}), ...(tx.details || {}) }
              }
            }
            return w
          }))
        }
      } else {
        // fallback: refetch list using current filters
        const q = buildQuery()
        const resp = await backend.get(`/admin/requests${q}`)
        setDeposits(resp.data?.deposits || resp.deposits || [])
        setWithdrawals(resp.data?.withdrawals || resp.withdrawals || [])
      }

      setModalOpen(false)
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    } finally {
      setModalLoading(false)
    }
  }

  async function doReject(request){
    if(!request) return
    if(!window.confirm('Reject this request?')) return
    try {
      await backend.post(`/admin/requests/${request._id || request.id}/reject`, {})
      const { data } = await backend.get(`/admin/requests${buildQuery()}`)
      setDeposits(data.deposits || [])
      setWithdrawals(data.withdrawals || [])
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  function renderModalContent(){
    if(!modalData) return null
    const { request, reqType } = modalData
    const user = request.user || request.userObj || request.userData || null
    const amount = Number(request.amount || 0)
    const currentNet = user ? Number(user.netProfit || 0) : Number(request.netProfitBefore || 0)
    const currentRef = user ? Number(user.referralEarnings || 0) : Number(request.referralEarningsBefore || 0)
    const currentAvailable = Number((currentNet || 0) + (currentRef || 0))
    const currentCapital = user ? Number(user.capital || 0) : Number(request.capitalBefore || 0)

    if(reqType === 'deposit') {
      const newCapital = currentCapital + amount
      return (
        <div className="admin-requests-modal-content">
          <div className="admin-requests-modal-user">
            Deposit request for <strong>{request.userEmail || user?.email || request.email}</strong>
          </div>
          <div className="admin-requests-modal-details">
            <div className="admin-requests-modal-row">
              Name / Email: <strong>{(user && `${user.firstName || ''} ${user.lastName || ''}`.trim()) || request.userName || '—'} / {request.userEmail || user?.email || request.email}</strong>
            </div>
            <div className="admin-requests-modal-row">
              Current capital: <strong>${currentCapital.toFixed(2)}</strong>
            </div>
            <div className="admin-requests-modal-amount">
              Deposit amount: ${amount.toFixed(2)}
            </div>
            <div className="admin-requests-modal-row">
              After approval (capital): <strong>${newCapital.toFixed(2)}</strong>
            </div>
            <div className="admin-requests-modal-note">
              Approving will credit the user's capital and start the investment period (per plan in the transaction).
            </div>
            <div className="admin-requests-modal-note">
              Plan: {request.details?.plan ? JSON.stringify(request.details.plan) : '—'}
            </div>
          </div>
        </div>
      )
    } else {
      const newAvailable = Math.max(0, currentAvailable - amount)
      const method = request.method || request.details?.method || ''
      const bank = request.details?.bank || request.bank || {}
      const crypto = request.details?.crypto || request.crypto || {}
      return (
        <div className="admin-requests-modal-content">
          <div className="admin-requests-modal-user">
            Withdrawal request for <strong>{request.userEmail || user?.email || request.email}</strong>
          </div>
          <div className="admin-requests-modal-details">
            <div className="admin-requests-modal-row">
              Name: <strong>{(user && `${user.firstName || ''} ${user.lastName || ''}`.trim()) || request.userName || '—'}</strong>
            </div>
            <div className="admin-requests-modal-row">
              Email: <strong>{request.userEmail || user?.email || request.email}</strong>
            </div>
            <div className="admin-requests-modal-row">
              Account overview — Capital: <strong>${currentCapital.toFixed(2)}</strong> • Net profit: <strong>${currentNet.toFixed(2)}</strong> • Referral: <strong>${currentRef.toFixed(2)}</strong>
            </div>
            <div className="admin-requests-modal-amount">
              Requested amount: ${amount.toFixed(2)}
            </div>
            <div className="admin-requests-modal-row">
              Current available for withdrawal (net + referral): <strong>${currentAvailable.toFixed(2)}</strong>
            </div>
            <div className="admin-requests-modal-row">
              After approval (available - requested): <strong>${newAvailable.toFixed(2)}</strong>
            </div>
            <div className="admin-requests-modal-note">
              Withdrawal method: <strong>{method || request.method}</strong>
            </div>
            {method === 'bank' || bank.accountNumber ? (
              <div className="admin-requests-modal-bank-details">
                Bank: {bank.bank || bank.bankName || '—'} • A/C: {bank.accountNumber || bank.accNo || '—'} • Name: {bank.accountName || '—'}
              </div>
            ) : (
              <div className="admin-requests-modal-bank-details">
                Crypto wallet: {crypto.walletAddress || crypto.address || '—'} • Network: {crypto.network || '—'}
              </div>
            )}
            <div className="admin-requests-modal-note">
              Note: backend will deduct from net profit first, then referral earnings when processing approval.
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="admin-requests-container">
      <div className="admin-requests-card">
        <div className="admin-requests-header">
          <h2>Pending Requests</h2>
        </div>

        <div className="admin-requests-filters">
          <input 
            className="admin-requests-filter-input"
            placeholder="Search user email or name" 
            value={qUser} 
            onChange={e=>setQUser(e.target.value)} 
          />
          
          <div className="admin-requests-filter-group">
            <label className="admin-requests-filter-label">From</label>
            <input 
              type="date" 
              className="admin-requests-filter-input"
              value={from} 
              onChange={e=>setFrom(e.target.value)} 
            />
          </div>
          
          <div className="admin-requests-filter-group">
            <label className="admin-requests-filter-label">To</label>
            <input 
              type="date" 
              className="admin-requests-filter-input"
              value={to} 
              onChange={e=>setTo(e.target.value)} 
            />
          </div>
          
          <div className="admin-requests-filter-group">
            <label className="admin-requests-filter-label">Type</label>
            <select 
              className="admin-requests-filter-select"
              value={type} 
              onChange={e=>setType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>

          <button 
            className="admin-requests-apply-btn"
            onClick={async () => {
              setLoading(true)
              try {
                const { data } = await backend.get(`/admin/requests${buildQuery()}`)
                setDeposits(data.deposits || [])
                setWithdrawals(data.withdrawals || [])
              } catch (err) {
                console.warn(err)
              } finally { setLoading(false) }
            }}
          >
            Apply
          </button>
          
          <div className="admin-requests-info">Showing live requests. Use filters to narrow results.</div>
        </div>

        <hr className="admin-requests-divider" />

        <div className="admin-requests-section">
          <h3 className="admin-requests-section-header">Deposit requests</h3>
          {loading && <div className="admin-requests-loading">Loading...</div>}
          {deposits.length === 0 && !loading && <div className="admin-requests-empty">No pending deposits</div>}
          
          <div className="admin-requests-list">
            {deposits.map(d => (
              <div key={d._id || d.id} className="admin-request-item admin-request-item-deposit">
                <div className="admin-request-info">
                  <div className="admin-request-main">
                    {d.user?.email || d.userEmail || d.email} — ${Number(d.amount).toFixed(2)}
                  </div>
                  <div className="admin-request-meta">
                    Plan: {d.details?.plan?.amount ? `$${d.details.plan.amount}` : (d.plan?.amount ? `$${d.plan.amount}` : '—')} • Method: {d.method || d.details?.method} • Created: {formatDate(d.createdAt)}
                    { (d.approvedAt || (d.details && d.details.approvedAt)) && (
                      <span> • Approved: {formatDate(d.approvedAt || d.details.approvedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="admin-request-actions">
                  <button className="admin-request-approve" onClick={()=>openConfirmFor(d, 'deposit')}>Approve</button>
                  <button className="admin-request-reject" onClick={()=>doReject(d)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-requests-section">
          <h3 className="admin-requests-section-header">Withdrawal requests</h3>
          {withdrawals.length === 0 && !loading && <div className="admin-requests-empty">No pending withdrawals</div>}
          
          <div className="admin-requests-list">
            {withdrawals.map(w => {
              const bank = w.details?.bank || w.bank || {}
              const crypto = w.details?.crypto || w.crypto || {}
              const method = w.method || w.details?.method || (bank.accountNumber ? 'bank' : (crypto.walletAddress ? 'crypto' : '—'))
              return (
                <div key={w._id || w.id} className="admin-request-item admin-request-item-withdrawal">
                  <div className="admin-request-info">
                    <div className="admin-request-main">
                      {w.user?.email || w.userEmail || w.email} — ${Number(w.amount).toFixed(2)}
                    </div>
                    <div className="admin-request-meta">
                      Method: {method} • Details: {method === 'bank' ? `${bank.bank || bank.bankName || '—'} / ${bank.accountNumber || bank.accNo || '—'}` : (crypto.walletAddress || crypto.address || '—')} • Created: {formatDate(w.createdAt)}
                      { (w.approvedAt || (w.details && w.details.approvedAt)) && (
                        <span> • Approved: {formatDate(w.approvedAt || w.details.approvedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="admin-request-actions">
                    <button className="admin-request-approve" onClick={()=>openConfirmFor(w, 'withdrawal')}>Approve</button>
                    <button className="admin-request-reject" onClick={()=>doReject(w)}>Reject</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Confirm request approval"
        onCancel={()=>setModalOpen(false)}
        onConfirm={doApprove}
        confirmLabel="Approve"
        loading={modalLoading}
      >
        {renderModalContent()}
      </ConfirmModal>
    </div>
  )
}
