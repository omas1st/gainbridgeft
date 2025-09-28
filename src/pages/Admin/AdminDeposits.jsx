import React, { useEffect, useState } from 'react'
import backend from '../../services/api'
import ConfirmModal from '../../components/ConfirmModal'
import '../../styles/AdminDeposits.css'

export default function AdminDeposits(){
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { data } = await backend.get('/admin/deposits')
        if (!mounted) return
        setDeposits(data.deposits || [])
      } catch (err) {
        console.warn('admin deposits load failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  function openConfirm(d) {
    setModalData(d)
    setModalOpen(true)
  }

  async function approve() {
    if (!modalData) return
    setModalLoading(true)
    try {
      await backend.post(`/admin/deposits/${modalData._id || modalData.id}/approve`)
      setModalOpen(false)
      const { data } = await backend.get('/admin/deposits')
      setDeposits(data.deposits || [])
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    } finally {
      setModalLoading(false)
    }
  }

  async function doReject(d) {
    if (!d) return
    if (!window.confirm('Reject deposit?')) return
    try {
      await backend.post(`/admin/deposits/${d._id || d.id}/reject`)
      const { data } = await backend.get('/admin/deposits')
      setDeposits(data.deposits || [])
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="admin-deposits-container">
      <div className="admin-deposits-card">
        <div className="admin-deposits-header">
          <h2>Deposit Requests</h2>
        </div>
        
        {loading && <div className="admin-deposits-loading">Loading...</div>}
        
        {deposits.length === 0 && !loading && (
          <div className="admin-deposits-empty">No deposits pending</div>
        )}
        
        <div className="admin-deposits-list">
          {deposits.map(d => (
            <div key={d._id || d.id} className="admin-deposit-item">
              <div className="admin-deposit-info">
                <div className="admin-deposit-user">
                  {d.userEmail || d.user?.email} — ${Number(d.amount).toFixed(2)}
                </div>
                <div className="admin-deposit-meta">
                  Plan: {d.plan?.amount || '—'} • Method: {d.method} • {new Date(d.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="admin-deposit-actions">
                <button className="admin-deposit-approve-btn" onClick={() => openConfirm(d)}>
                  Approve
                </button>
                <button className="admin-deposit-reject-btn" onClick={() => doReject(d)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Confirm deposit approval"
        onCancel={() => setModalOpen(false)}
        onConfirm={approve}
        confirmLabel="Approve deposit"
        loading={modalLoading}
      >
        {modalData && (
          <div className="admin-deposit-modal-content">
            <div className="admin-deposit-modal-user">
              Approve deposit for <strong>{modalData.userEmail || modalData.user?.email}</strong>
            </div>
            <div>
              <div className="admin-deposit-modal-amount">
                Deposit amount: ${Number(modalData.amount).toFixed(2)}
              </div>
              <div className="admin-deposit-modal-note">
                This will credit the user's capital and mark the deposit as successful.
              </div>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}