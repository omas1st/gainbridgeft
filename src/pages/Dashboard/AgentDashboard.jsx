import React from 'react'
import '../styles/dashboard.css'

export default function AgentDashboard(){
  return (
    <div className="container">
      <div className="card" style={{marginTop:16}}>
        <h2>Agent Dashboard</h2>
        <p>Agent features: Monthly bonus, referral commissions, withdraw requests and performance metrics.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:12}}>
          <div className="card">
            <div className="muted small">Monthly Bonus</div>
            <div style={{fontWeight:700}}>$0.00</div>
          </div>
          <div className="card">
            <div className="muted small">Total referral earnings</div>
            <div style={{fontWeight:700}}>$0.00</div>
          </div>
          <div className="card">
            <div className="muted small">Available withdrawal</div>
            <div style={{fontWeight:700}}>$0.00</div>
          </div>
        </div>
      </div>
    </div>
  )
}
