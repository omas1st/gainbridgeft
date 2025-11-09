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
  const [minReferrals, setMinReferrals] = useState('') // NEW
  const [maxReferrals, setMaxReferrals] = useState('') // NEW
  const [withdrawalRestrictedFilter, setWithdrawalRestrictedFilter] = useState('') // NEW
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState([]) // NEW
  const [selectAll, setSelectAll] = useState(false) // NEW
  
  // NEW: Modals state
  const [showRestrictModal, setShowRestrictModal] = useState(false)
  const [showWithdrawalSettingsModal, setShowWithdrawalSettingsModal] = useState(false)
  const [restrictionReason, setRestrictionReason] = useState('')
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    scheduleType: 'daysOfWeek',
    daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    intervalDays: 2
  })
  
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
        if (minReferrals) params.push(`minReferrals=${encodeURIComponent(minReferrals)}`) // NEW
        if (maxReferrals) params.push(`maxReferrals=${encodeURIComponent(maxReferrals)}`) // NEW
        if (withdrawalRestrictedFilter !== '') params.push(`withdrawalRestricted=${encodeURIComponent(withdrawalRestrictedFilter)}`) // NEW
        params.push(`page=${page}`)
        params.push(`perPage=${perPage}`)
        const query = params.length ? `?${params.join('&')}` : ''
        const { data } = await backend.get(`/admin/users${query}`)
        if (!mounted) return
        setUsers(data.users || [])
        setTotal(typeof data.total === 'number' ? data.total : (data.users ? data.users.length : 0))
        setSelectedUsers([])
        setSelectAll(false)
      } catch (err) {
        console.error('load users', err)
        if (mounted) { setUsers([]); setTotal(0) }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => { mounted = false }
  }, [q, profileFilter, from, to, minCapital, maxCapital, minReferrals, maxReferrals, withdrawalRestrictedFilter, page])

  // NEW: Load withdrawal settings on component mount
  useEffect(() => {
    async function loadWithdrawalSettings() {
      try {
        const { data } = await backend.get('/admin/withdrawal-settings')
        if (data.settings) {
          setWithdrawalSettings({
            scheduleType: data.settings.withdrawalScheduleType,
            daysOfWeek: data.settings.withdrawalDaysOfWeek,
            intervalDays: data.settings.withdrawalIntervalDays
          })
        }
      } catch (err) {
        console.error('Failed to load withdrawal settings:', err)
      }
    }
    loadWithdrawalSettings()
  }, [])

  // NEW: Handle user selection
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // NEW: Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u._id || u.id))
    }
    setSelectAll(!selectAll)
  }

  // NEW: Bulk update withdrawal restriction
  const handleBulkWithdrawalRestriction = async (restricted) => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user')
      return
    }

    if (restricted && !restrictionReason.trim()) {
      alert('Please provide a reason for restriction')
      return
    }

    try {
      await backend.patch('/admin/users/bulk-withdrawal-restriction', {
        userIds: selectedUsers,
        restricted,
        reason: restricted ? restrictionReason : ''
      })
      
      alert(`Successfully ${restricted ? 'restricted' : 'enabled'} withdrawal for ${selectedUsers.length} users`)
      setShowRestrictModal(false)
      setRestrictionReason('')
      
      // Refresh users list
      setPage(1)
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update withdrawal restriction')
    }
  }

  // NEW: Update withdrawal settings
  const handleUpdateWithdrawalSettings = async () => {
    try {
      await backend.put('/admin/withdrawal-settings', {
        scheduleType: withdrawalSettings.scheduleType,
        daysOfWeek: withdrawalSettings.daysOfWeek,
        intervalDays: withdrawalSettings.intervalDays
      })
      
      alert('Withdrawal settings updated successfully')
      setShowWithdrawalSettingsModal(false)
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update withdrawal settings')
    }
  }

  // NEW: Toggle day in week selection
  const toggleDayOfWeek = (day) => {
    setWithdrawalSettings(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }))
  }

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

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

        {/* NEW: Withdrawal Management Section */}
        <div className="admin-withdrawal-management">
          <h3>Withdrawal Management</h3>
          <div className="withdrawal-management-buttons">
            <button 
              className="admin-action-btn restrict-btn"
              onClick={() => setShowRestrictModal(true)}
              disabled={selectedUsers.length === 0}
            >
              {selectedUsers.some(id => {
                const user = users.find(u => (u._id || u.id) === id)
                return user && user.withdrawalRestricted
              }) ? 'Enable Withdrawal' : 'Restrict Withdrawal'}
            </button>
            <button 
              className="admin-action-btn settings-btn"
              onClick={() => setShowWithdrawalSettingsModal(true)}
            >
              Set Withdrawal Schedule
            </button>
          </div>
          {selectedUsers.length > 0 && (
            <div className="selection-info">
              {selectedUsers.length} user(s) selected
            </div>
          )}
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

          {/* NEW: Referral count filters */}
          <div className="admin-filter-group">
            <label className="admin-filter-label">Min referrals</label>
            <input 
              type="number" 
              className="admin-filter-input admin-filter-number"
              value={minReferrals} 
              onChange={e=>setMinReferrals(e.target.value)} 
            />
          </div>
          
          <div className="admin-filter-group">
            <label className="admin-filter-label">Max referrals</label>
            <input 
              type="number" 
              className="admin-filter-input admin-filter-number"
              value={maxReferrals} 
              onChange={e=>setMaxReferrals(e.target.value)} 
            />
          </div>

          {/* NEW: Withdrawal restriction filter */}
          <div className="admin-filter-group">
            <label className="admin-filter-label">Withdrawal Status</label>
            <select 
              className="admin-filter-select"
              value={withdrawalRestrictedFilter} 
              onChange={e=>setWithdrawalRestrictedFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Restricted</option>
              <option value="false">Enabled</option>
            </select>
          </div>

          <div className="admin-filter-actions">
            <button className="admin-filter-btn" onClick={()=>{ setPage(1) }}>Filter</button>
            <button className="admin-filter-btn admin-reset-btn" onClick={()=>{ 
              setQ(''); 
              setProfileFilter('all'); 
              setFrom(''); 
              setTo(''); 
              setMinCapital(''); 
              setMaxCapital('');
              setMinReferrals('');
              setMaxReferrals('');
              setWithdrawalRestrictedFilter('');
              setPage(1) 
            }}>Reset</button>
          </div>
        </div>

        <div>
          <div className="admin-users-stats">Total users: {total}</div>
          
          {loading && <div className="admin-loading">Loading users...</div>}
          
          {!loading && users.length === 0 && <div className="admin-empty">No users found</div>}
          
          <div className="admin-users-list">
            {users.length > 0 && (
              <div className="admin-user-item header">
                <div className="admin-user-select">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="admin-user-info">
                  <div className="admin-user-main">
                    User Information
                  </div>
                </div>
                <div className="admin-user-actions">
                  Actions
                </div>
              </div>
            )}
            {users.map(u => (
              <div key={u._id || u.id} className="admin-user-item">
                <div className="admin-user-select">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(u._id || u.id)}
                    onChange={() => handleUserSelect(u._id || u.id)}
                  />
                </div>
                <div className="admin-user-info">
                  <div className="admin-user-main">
                    {(u.firstName || '') + ' ' + (u.lastName || '')} 
                    <span className="admin-user-email"> ({u.email})</span>
                    {u.withdrawalRestricted && (
                      <span className="restriction-badge">RESTRICTED</span>
                    )}
                  </div>
                  <div className="admin-user-details">
                    Profile: {u.profileType || u.role || 'N/A'} • Phone: {u.phone || '—'} • Country: {u.country || '—'}
                    {u.referrals && <span> • Referrals: {u.referrals.length}</span>}
                  </div>
                  <div className="admin-user-meta">
                    Capital: ${Number(u.capital || 0).toFixed(2)} • Registered: {u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'} • Last login: {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                  </div>
                  {u.withdrawalRestricted && u.withdrawalRestrictionReason && (
                    <div className="admin-user-restriction-reason">
                      Restriction Reason: {u.withdrawalRestrictionReason}
                    </div>
                  )}
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

      {/* NEW: Restriction Modal */}
      {showRestrictModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Withdrawal Restriction</h3>
            <p>You are about to {selectedUsers.some(id => {
              const user = users.find(u => (u._id || u.id) === id)
              return user && user.withdrawalRestricted
            }) ? 'enable' : 'restrict'} withdrawal for {selectedUsers.length} user(s).</p>
            
            {!selectedUsers.some(id => {
              const user = users.find(u => (u._id || u.id) === id)
              return user && user.withdrawalRestricted
            }) && (
              <div className="modal-input-group">
                <label>Reason for restriction:</label>
                <textarea 
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  placeholder="Enter reason for restricting withdrawal..."
                  rows="3"
                />
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                className="admin-action-btn confirm-btn"
                onClick={() => handleBulkWithdrawalRestriction(
                  !selectedUsers.some(id => {
                    const user = users.find(u => (u._id || u.id) === id)
                    return user && user.withdrawalRestricted
                  })
                )}
              >
                Confirm
              </button>
              <button 
                className="admin-action-btn cancel-btn"
                onClick={() => {
                  setShowRestrictModal(false)
                  setRestrictionReason('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Withdrawal Settings Modal */}
      {showWithdrawalSettingsModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Set Withdrawal Schedule</h3>
            
            <div className="modal-input-group">
              <label>Schedule Type:</label>
              <select 
                value={withdrawalSettings.scheduleType}
                onChange={(e) => setWithdrawalSettings(prev => ({
                  ...prev,
                  scheduleType: e.target.value
                }))}
              >
                <option value="daysOfWeek">Days of Week</option>
                <option value="interval">Days Interval</option>
              </select>
            </div>

            {withdrawalSettings.scheduleType === 'daysOfWeek' && (
              <div className="modal-input-group">
                <label>Allowed Days:</label>
                <div className="days-selection">
                  {dayNames.map((day, index) => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={withdrawalSettings.daysOfWeek.includes(index)}
                        onChange={() => toggleDayOfWeek(index)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {withdrawalSettings.scheduleType === 'interval' && (
              <div className="modal-input-group">
                <label>Interval (days):</label>
                <input 
                  type="number"
                  min="1"
                  max="30"
                  value={withdrawalSettings.intervalDays}
                  onChange={(e) => setWithdrawalSettings(prev => ({
                    ...prev,
                    intervalDays: parseInt(e.target.value) || 1
                  }))}
                />
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="admin-action-btn confirm-btn"
                onClick={handleUpdateWithdrawalSettings}
              >
                Save Settings
              </button>
              <button 
                className="admin-action-btn cancel-btn"
                onClick={() => setShowWithdrawalSettingsModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}