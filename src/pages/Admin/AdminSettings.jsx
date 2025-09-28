import React, { useEffect, useState } from 'react'
import backend from '../../services/api'
import '../../styles/AdminSettings.css'

function blankMethod(type = 'bank') {
  return {
    id: `m_${Date.now()}`,
    type,
    label: type === 'bank' ? 'Bank transfer' : (type === 'crypto' ? 'Crypto' : 'Other'),
    details: (type === 'bank') ? { bankName: '', accountName: '', accountNumber: '', reference: '' } :
             (type === 'crypto') ? { crypto: '', address: '' } : {},
    content: ''
  }
}

export default function AdminSettings(){
  const [settings, setSettings] = useState({ paymentMethods: [ blankMethod('bank'), blankMethod('crypto') ] })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try {
        const { data } = await backend.get('/admin/settings')
        if(!mounted) return
        if (data.settings) setSettings(data.settings)
      } catch (e) {
        console.warn('load settings', e)
      } finally {
        if(mounted) setLoading(false)
      }
    }
    load()
    return ()=> { mounted = false }
  },[])

  function updateMethod(idx, patch) {
    const pm = [...(settings.paymentMethods || [])]
    pm[idx] = { ...pm[idx], ...patch }
    setSettings({ ...settings, paymentMethods: pm })
  }

  function updateMethodDetail(idx, key, value) {
    const pm = [...(settings.paymentMethods || [])]
    pm[idx] = { ...pm[idx], details: { ...(pm[idx].details || {}), [key]: value } }
    setSettings({ ...settings, paymentMethods: pm })
  }

  function addMethod(type) {
    const pm = [...(settings.paymentMethods || []), blankMethod(type)]
    setSettings({ ...settings, paymentMethods: pm })
  }

  function removeMethod(idx) {
    const pm = [...(settings.paymentMethods || [])]
    pm.splice(idx, 1)
    setSettings({ ...settings, paymentMethods: pm })
  }

  async function save(){
    setSaving(true); setMsg(null); setErr(null)
    try {
      const { data } = await backend.put('/admin/settings', { settings })
      setSettings(data.settings)
      setMsg('Saved')
    } catch (e) {
      setErr(e?.response?.data?.message || e.message)
    } finally {
      setSaving(false)
      setTimeout(()=> setMsg(null), 3000)
    }
  }

  return (
    <div className="admin-settings-container">
      <div className="admin-settings-card">
        <div className="admin-settings-header">
          <h2>Platform Payment Settings</h2>
        </div>
        {loading && <div className="admin-settings-loading">Loading...</div>}

        <div className="admin-settings-actions">
          <button className="admin-settings-add-btn" onClick={()=>addMethod('bank')}>Add bank</button>
          <button className="admin-settings-add-btn" onClick={()=>addMethod('crypto')}>Add crypto</button>
          <button className="admin-settings-add-btn" onClick={()=>addMethod('other')}>Add other</button>
        </div>

        <div className="admin-method-list">
          {(settings.paymentMethods || []).map((m, idx) => (
            <div key={m.id} className="admin-method-item">
              <div className="admin-method-header">
                <div className="admin-method-title">{m.label || `${m.type} — ${m.id}`}</div>
                <div className="admin-method-controls">
                  <select 
                    className="admin-method-type-select"
                    value={m.type} 
                    onChange={e=> updateMethod(idx, { type: e.target.value })}
                  >
                    <option value="bank">bank</option>
                    <option value="crypto">crypto</option>
                    <option value="other">other</option>
                  </select>
                  <button 
                    className="admin-method-delete-btn" 
                    onClick={()=> removeMethod(idx)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="admin-method-form">
                <div className="admin-method-field">
                  <label className="admin-method-label">Label</label>
                  <input 
                    className="admin-method-input"
                    value={m.label || ''} 
                    onChange={e=>updateMethod(idx, { label: e.target.value })} 
                  />
                </div>

                <div className="admin-method-field">
                  <label className="admin-method-label">Content / instructions</label>
                  <textarea 
                    className="admin-method-textarea"
                    value={m.content || ''} 
                    onChange={e=>updateMethod(idx, { content: e.target.value })} 
                  />
                </div>

                {m.type === 'bank' && (
                  <div className="admin-method-details-grid">
                    <div className="admin-method-field">
                      <label className="admin-method-label">Bank name</label>
                      <input 
                        className="admin-method-input"
                        value={m.details?.bankName || ''} 
                        onChange={e=>updateMethodDetail(idx, 'bankName', e.target.value)} 
                      />
                    </div>
                    <div className="admin-method-field">
                      <label className="admin-method-label">Account name</label>
                      <input 
                        className="admin-method-input"
                        value={m.details?.accountName || ''} 
                        onChange={e=>updateMethodDetail(idx, 'accountName', e.target.value)} 
                      />
                    </div>
                    <div className="admin-method-field">
                      <label className="admin-method-label">Account number</label>
                      <input 
                        className="admin-method-input"
                        value={m.details?.accountNumber || ''} 
                        onChange={e=>updateMethodDetail(idx, 'accountNumber', e.target.value)} 
                      />
                    </div>
                    <div className="admin-method-field">
                      <label className="admin-method-label">Reference</label>
                      <input 
                        className="admin-method-input"
                        value={m.details?.reference || ''} 
                        onChange={e=>updateMethodDetail(idx, 'reference', e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                {m.type === 'crypto' && (
                  <div className="admin-method-details-grid">
                    <div className="admin-method-field">
                      <label className="admin-method-label">Crypto (label)</label>
                      <input 
                        className="admin-method-input"
                        value={m.details?.crypto || ''} 
                        onChange={e=>updateMethodDetail(idx, 'crypto', e.target.value)} 
                      />
                    </div>
                    <div className="admin-method-field">
                      <label className="admin-method-label">Wallet address</label>
                      <input 
                        className="admin-method-input"
                        value={m.details?.address || ''} 
                        onChange={e=>updateMethodDetail(idx, 'address', e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                {m.type === 'other' && (
                  <div className="admin-method-field">
                    <label className="admin-method-label">Details (JSON)</label>
                    <textarea 
                      className="admin-method-textarea"
                      value={JSON.stringify(m.details || {}, null, 2)} 
                      onChange={e=>{
                        try {
                          const parsed = JSON.parse(e.target.value)
                          updateMethod(idx, { details: parsed })
                        } catch (err) {
                          updateMethod(idx, { details: e.target.value })
                        }
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <button 
            className="admin-settings-save-btn" 
            onClick={save} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
        
        {msg && <div className="admin-settings-message admin-settings-success">{msg}</div>}
        {err && <div className="admin-settings-message admin-settings-error">{err}</div>}
      </div>
    </div>
  )
}