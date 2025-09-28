// src/pages/Dashboard/WithdrawConfirm.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/Withdraw.css'

export default function WithdrawConfirm(){
  return (
    <div className="withdraw-container">
      <div className="withdraw-card confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h2 className="confirmation-title">Withdrawal Submitted</h2>
        <p className="confirmation-message">
          Your withdrawal request has been submitted and is being processed. 
          It will be delivered within 24 hours once approved by our team.
        </p>
        <div className="button-group">
          <Link to="/dashboard" className="btn btn-primary btn-flex">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}