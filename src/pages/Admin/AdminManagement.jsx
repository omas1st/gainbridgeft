import React, { useEffect, useState } from 'react'
import backend from '../../services/api'
import '../../styles/AdminManagement.css'

export default function AdminManagement(){
  const [requests, setRequests] = useState([])

  useEffect(()=>{
    async function load(){
      try{
        const { data } = await backend.get('/admin/requests')
        setRequests(data.requests || [])
      }catch(e){}
    }
    load()
  },[])

  async function approve(id){
    await backend.post(`/admin/requests/${id}/approve`)
    setRequests(prev => prev.filter(r=>r._id !== id))
  }
  async function reject(id){
    await backend.post(`/admin/requests/${id}/reject`)
    setRequests(prev => prev.filter(r=>r._id !== id))
  }

  return (
    <div className="admin-management-container">
      <div className="admin-management-card">
        <div className="admin-management-header">
          <h2>Management — Deposit & Withdraw Requests</h2>
        </div>
        
        {requests.length === 0 && <div className="admin-management-empty">No requests</div>}
        
        <div className="admin-requests-list">
          {requests.map(r=>(
            <div key={r._id} className="admin-request-item">
              <div className="admin-request-info">
                <div className="admin-request-main">{r.user.email} — {r.type}</div>
                <div className="admin-request-details">{r.details}</div>
              </div>
              <div className="admin-request-actions">
                <button className="admin-request-approve" onClick={()=>approve(r._id)}>Approve</button>
                <button className="admin-request-reject" onClick={()=>reject(r._id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}