// src/components/ConfirmModal.jsx
import React from 'react'

export default function ConfirmModal({ open, title, children, onCancel, onConfirm, confirmLabel = 'Confirm', loading = false }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{ width: 720, maxWidth: '94%', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 700 }}>{title}</div>
        <div style={{ padding: 16, maxHeight: '60vh', overflow: 'auto' }}>{children}</div>
        <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" style={{ background: '#9ca3af' }} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn" onClick={onConfirm} disabled={loading}>{loading ? 'Processing...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
