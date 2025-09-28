import React, { useEffect, useState } from 'react'
import backend from '../../services/api'
import '../../styles/AdminHistory.css'

function formatDate(d){ if(!d) return '—'; try { return new Date(d).toLocaleString() } catch(e){ return d } }

export default function AdminHistory(){
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [qUser, setQUser] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('all')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const params = []
        if (qUser) params.push(`q=${encodeURIComponent(qUser)}`)
        if (from) params.push(`from=${encodeURIComponent(from)}`)
        if (to) params.push(`to=${encodeURIComponent(to)}`)
        if (type && type !== 'all') params.push(`type=${encodeURIComponent(type)}`)
        const q = params.length ? `?${params.join('&')}` : ''
        const { data } = await backend.get(`/admin/history${q}`)
        if (!mounted) return
        setHistory(data.history || [])
      } catch (err) {
        console.warn('admin history load failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [qUser, from, to, type])

  function downloadCSV(){
    if (!history || history.length === 0) return alert('No records to export')
    const cols = ['date','type','userEmail','amount','status','details']
    const rows = history.map(h => ([
      h.createdAt ? new Date(h.createdAt).toISOString() : '',
      h.type || '',
      h.userEmail || (h.user && h.user.email) || '',
      h.amount ?? '',
      h.status || '',
      (h.details && typeof h.details === 'string') ? h.details : JSON.stringify(h.details || '')
    ]))
    const csv = [cols.join(','), ...rows.map(r=>r.map(c=>`"${(''+c).replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gainbridge_history_${(new Date()).toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const getHistoryItemClass = (itemType) => {
    if (itemType === 'deposit') return 'admin-history-item admin-history-item-deposit'
    if (itemType === 'withdraw') return 'admin-history-item admin-history-item-withdraw'
    return 'admin-history-item'
  }

  return (
    <div className="admin-history-container">
      <div className="admin-history-card">
        <div className="admin-history-header">
          <h2>Management History</h2>
        </div>

        <div className="admin-history-filters">
          <input 
            className="admin-history-filter-input"
            placeholder="Search user email or name" 
            value={qUser} 
            onChange={e=>setQUser(e.target.value)} 
          />
          
          <div className="admin-history-filter-group">
            <label className="admin-history-filter-label">From</label>
            <input 
              type="date" 
              className="admin-history-filter-input"
              value={from} 
              onChange={e=>setFrom(e.target.value)} 
            />
          </div>
          
          <div className="admin-history-filter-group">
            <label className="admin-history-filter-label">To</label>
            <input 
              type="date" 
              className="admin-history-filter-input"
              value={to} 
              onChange={e=>setTo(e.target.value)} 
            />
          </div>
          
          <div className="admin-history-filter-group">
            <label className="admin-history-filter-label">Type</label>
            <select 
              className="admin-history-filter-select"
              value={type} 
              onChange={e=>setType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdrawal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="admin-history-actions">
            <button className="btn" onClick={()=>{}}>Apply</button>
            <button className="admin-history-export-btn" onClick={downloadCSV}>Export CSV</button>
          </div>
        </div>

        <div className="admin-history-list">
          {loading && <div className="admin-history-loading">Loading...</div>}
          {history.length === 0 && !loading && <div className="admin-history-empty">No history yet</div>}
          {history.map(h => (
            <div key={h._id || h.id} className={getHistoryItemClass(h.type)}>
              <div>
                <div className="admin-history-main-info">
                  {h.type} — ${h.amount} — {h.status}
                </div>
                <div className="admin-history-meta">
                  User: {h.userEmail || (h.user && h.user.email)} • Date: {formatDate(h.createdAt)}
                </div>
                {h.details && (
                  <div className="admin-history-details">
                    Details: {typeof h.details === 'string' ? h.details : JSON.stringify(h.details)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}