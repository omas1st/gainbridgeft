import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import backend from '../../services/api'
import '../../styles/AdminMain.css'

export default function AdminMain(){
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [profileFilter, setProfileFilter] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [minCapital, setMinCapital] = useState('')
  const [maxCapital, setMaxCapital] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 30
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const params = []
        if (q) params.push(`q=${encodeURIComponent(q)}`)
        if (profileFilter && profileFilter !== 'all') params.push(`profile=${encodeURIComponent(profileFilter)}`)
        if (from) params.push(`registeredFrom=${encodeURIComponent(from)}`)
        if (to) params.push(`registeredTo=${encodeURIComponent(to)}`)
        if (minCapital) params.push(`minCapital=${encodeURIComponent(minCapital)}`)
        if (maxCapital) params.push(`maxCapital=${encodeURIComponent(maxCapital)}`)
        params.push(`page=${page}`)
        params.push(`perPage=${perPage}`)
        const query = params.length ? `?${params.join('&')}` : ''
        const { data } = await backend.get(`/admin/users${query}`)
        if (!mounted) return
        setUsers(data.users || [])
        setTotal(typeof data.total === 'number' ? data.total : (data.users ? data.users.length : 0))
      } catch (err) {
        console.error('load users', err)
        if (mounted) { setUsers([]); setTotal(0) }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => { mounted = false }
  }, [q, profileFilter, from, to, minCapital, maxCapital, page])

  async function handleDelete(u){
    if(!window.confirm(`Delete user ${u.email}? This will soft-delete the user.`)) return
    try {
      await backend.patch(`/admin/user/${u._id || u.id}`, { deleted: true })
      setUsers(prev => prev.filter(p => (p._id || p.id) !== (u._id || u.id)))
      setTotal(t => Math.max(0, t - 1))
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    }
  }

  const maxPage = Math.max(1, Math.ceil((total || users.length) / perPage))
  const disableNext = page >= maxPage

  return (
    <div className="admin-main-container">
      {/* Admin sub-navigation */}
      <div className="admin-navigation">
        <Link to="/admin" className="admin-nav-btn">Users</Link>
        <Link to="/admin/requests" className="admin-nav-btn">Requests</Link>
        <Link to="/admin/deposits" className="admin-nav-btn">Deposits</Link>
        <Link to="/admin/history" className="admin-nav-btn">History</Link>
        <Link to="/admin/messages" className="admin-nav-btn">Messages</Link>
        <Link to="/admin/settings" className="admin-nav-btn">Settings</Link>

        <div className="admin-user-info">Signed in as: {user?.email}</div>
      </div>

      <div className="admin-main-card">
        <div className="admin-main-header">
          <h2>Admin — Users</h2>
        </div>

        <div className="admin-filters-container">
          <div className="admin-filter-group">
            <label className="admin-filter-label">Search</label>
            <input 
              className="admin-filter-input"
              placeholder="Search by name or email" 
              value={q} 
              onChange={e=>setQ(e.target.value)}
            />
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Profile Type</label>
            <select 
              className="admin-filter-select"
              value={profileFilter} 
              onChange={e=>setProfileFilter(e.target.value)}
            >
              <option value="all">All profile types</option>
              <option value="Investor account">Investor</option>
              <option value="Agent account">Agent</option>
              <option value="admin">Admin</option>
              <option value="management">Management</option>
            </select>
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Registered from</label>
            <input 
              type="date" 
              className="admin-filter-input"
              value={from} 
              onChange={e=>setFrom(e.target.value)} 
            />
          </div>
          
          <div className="admin-filter-group">
            <label className="admin-filter-label">to</label>
            <input 
              type="date" 
              className="admin-filter-input"
              value={to} 
              onChange={e=>setTo(e.target.value)} 
            />
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Min capital</label>
            <input 
              type="number" 
              className="admin-filter-input admin-filter-number"
              value={minCapital} 
              onChange={e=>setMinCapital(e.target.value)} 
            />
          </div>
          
          <div className="admin-filter-group">
            <label className="admin-filter-label">Max capital</label>
            <input 
              type="number" 
              className="admin-filter-input admin-filter-number"
              value={maxCapital} 
              onChange={e=>setMaxCapital(e.target.value)} 
            />
          </div>

          <div className="admin-filter-actions">
            <button className="admin-filter-btn" onClick={()=>{ setPage(1) }}>Filter</button>
            <button className="admin-filter-btn admin-reset-btn" onClick={()=>{ setQ(''); setProfileFilter('all'); setFrom(''); setTo(''); setMinCapital(''); setMaxCapital(''); setPage(1) }}>Reset</button>
          </div>
        </div>

        <div>
          <div className="admin-users-stats">Total users: {total}</div>
          
          {loading && <div className="admin-loading">Loading users...</div>}
          
          {!loading && users.length === 0 && <div className="admin-empty">No users found</div>}
          
          <div className="admin-users-list">
            {users.map(u => (
              <div key={u._id || u.id} className="admin-user-item">
                <div className="admin-user-info">
                  <div className="admin-user-main">
                    {(u.firstName || '') + ' ' + (u.lastName || '')} 
                    <span className="admin-user-email"> ({u.email})</span>
                  </div>
                  <div className="admin-user-details">
                    Profile: {u.profileType || u.role || 'N/A'} • Phone: {u.phone || '—'} • Country: {u.country || '—'}
                  </div>
                  <div className="admin-user-meta">
                    Capital: ${Number(u.capital || 0).toFixed(2)} • Registered: {u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'} • Last login: {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                  </div>
                </div>
                <div className="admin-user-actions">
                  <button className="admin-profile-btn" onClick={()=>nav(`/admin/user/${u._id || u.id}`)}>Profile</button>
                  <button className="admin-delete-btn" onClick={()=>handleDelete(u)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-pagination">
          <div className="admin-pagination-info">Page {page} of {maxPage}</div>
          <div className="admin-pagination-controls">
            <button 
              className="admin-pagination-btn" 
              onClick={()=>setPage(p => Math.max(1, p-1))} 
              disabled={page <= 1}
            >
              Prev
            </button>
            <button 
              className="admin-pagination-btn" 
              onClick={()=>setPage(p => Math.min(maxPage, p+1))} 
              disabled={disableNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}