import React, { useEffect, useState } from 'react'
import backend from '../services/api'
import '../styles/livemembers.css'

export default function LiveMembers(){
  const [counts, setCounts] = useState({ totalUsers: 0, onlineUsers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        const { data } = await backend.get('/public/stats')
        if(!mounted) return
        if(data && typeof data.totalUsers !== 'undefined') setCounts({ totalUsers: data.totalUsers, onlineUsers: data.onlineUsers })
      }catch(err){
        console.warn('LiveMembers fetch failed', err)
      }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 60 * 1000)
    return ()=>{ mounted = false; clearInterval(iv) }
  },[])

  // show in "thousands" scaled as requested
  const shownRegistered = (counts.totalUsers || 0) * 1000
  const shownOnline = (counts.onlineUsers || 0) * 1000

  return (
    <div className="live-members">
      <div className="member-stat">
        <div className="member-count">{loading ? '—' : shownRegistered.toLocaleString()}</div>
        <div className="member-label">Registered (approx)</div>
        {!loading && <div className="status-indicator"><div className="status-dot"></div><div className="status-text">Live</div></div>}
      </div>

      <div className="member-stat">
        <div className="member-count">{loading ? '—' : shownOnline.toLocaleString()}</div>
        <div className="member-label">Members online (Approx)</div>
        {!loading && <div className="status-indicator"><div className="status-dot"></div><div className="status-text">Active</div></div>}
      </div>
    </div>
  )
}
