import React, { useEffect, useState } from 'react'
import '../../styles/dashboard.css'
import { useAuth } from '../contexts/AuthContext'
import backend from '../../services/api'
import { useNavigate } from 'react-router-dom'

export default function AgentDashboard(){
  const { user } = useAuth()
  const [overview, setOverview] = useState({ monthlyBonus: 0, totalReferralEarnings: 0, availableWithdrawal: 0 })
  const [referrals, setReferrals] = useState([])
  const nav = useNavigate()

  useEffect(()=>{
    async function load(){
      try{
        const { data } = await backend.get(`/users/${user.id}/referrals`)
        setReferrals(data.referrals || [])
        const totalReferralEarnings = data.totalReferralEarnings || 0
        // monthly bonus is stored in user.monthlyBonus? fallback
        setOverview({
          monthlyBonus: user.monthlyBonus || 0,
          totalReferralEarnings,
          availableWithdrawal: Number(user.monthlyBonus || 0) + Number(totalReferralEarnings)
        })
      }catch(err){}
    }
    if(user?.id) load()
  },[user])

  return (
    <div className="container">
      <div className="card" style={{marginTop:16}}>
        <h2>Agent Dashboard</h2>
        <div className="dashboard-grid">
          <div className="card">
            <div className="small muted">Total Portfolio Balance</div>
            <div style={{fontWeight:700}}>${(Number(overview.monthlyBonus)+Number(overview.totalReferralEarnings)).toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="small muted">Monthly Bonus</div>
            <div style={{fontWeight:700}}>${Number(overview.monthlyBonus).toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="small muted">Total Referral Earnings</div>
            <div style={{fontWeight:700}}>${Number(overview.totalReferralEarnings).toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="small muted">Available withdrawal</div>
            <div style={{fontWeight:700}}>${Number(overview.availableWithdrawal).toFixed(2)}</div>
          </div>
        </div>

        <div style={{marginTop:12, display:'flex',gap:8}}>
          <button className="btn" onClick={()=>nav('/dashboard/withdraw')}>Agent Withdraw</button>
          <button className="btn" onClick={()=>nav('/dashboard/referrals')}>Agent Referrals</button>
        </div>

        <div style={{marginTop:12}}>
          <h3>Your referrals</h3>
          {referrals.length === 0 && <div className="muted small">No referrals yet</div>}
          {referrals.map(r => (
            <div key={r._id} className="card" style={{marginTop:8}}>
              <div><strong>{r.email}</strong></div>
              <div className="muted small">Capital: ${r.capital} — Referral earnings: ${r.referralEarning}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
