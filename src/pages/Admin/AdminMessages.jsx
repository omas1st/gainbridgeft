import React, { useState } from 'react'
import backend from '../../services/api'
import '../../styles/AdminMessages.css'

export default function AdminMessages(){
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserMessages, setSelectedUserMessages] = useState([])

  async function search(e){
    e && e.preventDefault()
    if(!query) return setResults([])
    setLoading(true)
    try {
      const { data } = await backend.get(`/admin/users?q=${encodeURIComponent(query)}&perPage=50`)
      setResults(data.users || [])
    } catch (err) {
      console.warn('search users', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(id){
    setSelected(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  async function sendToSelected(e){
    e.preventDefault()
    if (!subject || !body) return setStatus('Provide subject and body')
    const to = Array.from(selected)
    if (to.length === 0) return setStatus('Select at least one user')
    setStatus(null)
    try {
      await backend.post('/admin/message', { to, subject, body })
      setStatus('Messages sent')
      setSelected(new Set())
      setSubject(''); setBody('')
    } catch (err) {
      setStatus(err?.response?.data?.message || err.message)
    }
  }

  async function sendToSingle(userId){
    if(!subject || !body) return setStatus('Provide subject and body')
    try {
      await backend.post('/admin/message', { to: [userId], subject, body })
      setStatus('Message sent')
      setSubject(''); setBody('')
    } catch (err) {
      setStatus(err?.response?.data?.message || err.message)
    }
  }

  async function viewMessagesFor(user){
    setSelectedUser(user)
    setSelectedUserMessages([])
    try {
      const { data } = await backend.get(`/admin/user/${user._id}/messages`)
      setSelectedUserMessages(data.messages || [])
    } catch (err) {
      console.warn('load user messages', err)
      setSelectedUserMessages([])
    }
  }

  return (
    <div className="admin-messages-container">
      <div className="admin-messages-card">
        <div className="admin-messages-header">
          <h2>Admin Messages</h2>
        </div>

        <form onSubmit={search} className="admin-messages-search">
          <input 
            className="admin-search-input"
            placeholder="Search users by name or email" 
            value={query} 
            onChange={e=>setQuery(e.target.value)} 
          />
          <button 
            className="admin-search-btn" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <div className="admin-search-info">Select users and send message(s)</div>
        </form>

        <div className="admin-users-list">
          {results.length === 0 && <div className="admin-empty">No users (try searching)</div>}
          {results.map(u => (
            <div key={u._id || u.id} className="admin-user-item">
              <div className="admin-user-info">
                <div className="admin-user-main">
                  {(u.firstName || '') + ' ' + (u.lastName || '')} 
                  <span style={{fontSize:12,color:'#6b7280'}}> ({u.email})</span>
                </div>
                <div className="admin-user-details">
                  Profile: {u.profileType || u.role || '—'} • Phone: {u.phone || '—'}
                </div>
              </div>
              <div className="admin-user-actions">
                <label className="admin-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selected.has(u._id)} 
                    onChange={()=>toggleSelect(u._id)} 
                  />
                  Select
                </label>
                <button className="admin-message-btn" onClick={()=>sendToSingle(u._id)}>Message</button>
                <button className="admin-view-btn" onClick={()=>viewMessagesFor(u)}>View messages</button>
              </div>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="admin-user-messages">
            <h3>Messages for {selectedUser.email}</h3>
            {selectedUserMessages.length === 0 && <div className="admin-empty">No messages</div>}
            <div className="admin-messages-list">
              {selectedUserMessages.map((m, idx) => (
                <div key={idx} className="admin-message-item">
                  <div className="admin-message-header">
                    {m.from === 'admin' ? (m.subject || 'Message from admin') : (m.name || m.email)}
                  </div>
                  <div className="admin-message-body">
                    {m.from === 'admin' ? (m.body || '') : (m.text || '')}
                  </div>
                  <div className="admin-message-meta">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'} • {m.from}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-compose-section">
          <h3 className="admin-compose-header">Compose</h3>
          <form className="admin-compose-form" onSubmit={sendToSelected}>
            <div>
              <label className="admin-compose-label">Subject</label>
              <input 
                className="admin-compose-input"
                value={subject} 
                onChange={e=>setSubject(e.target.value)} 
              />
            </div>
            <div>
              <label className="admin-compose-label">Message</label>
              <textarea 
                className="admin-compose-textarea"
                value={body} 
                onChange={e=>setBody(e.target.value)} 
                rows={6} 
              />
            </div>
            <div className="admin-compose-actions">
              <button className="admin-send-btn" type="submit">Send to selected</button>
              <button 
                className="admin-clear-btn" 
                type="button"
                onClick={()=>{ setSubject(''); setBody(''); setStatus(null) }}
              >
                Clear
              </button>
            </div>
            {status && (
              <div className={`admin-status-message ${
                status.toLowerCase().includes('sent') ? 'admin-status-success' : 'admin-status-error'
              }`}>
                {status}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}