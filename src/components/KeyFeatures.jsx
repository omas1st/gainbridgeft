import React from 'react'
import '../styles/keyfeatures.css'

export default function KeyFeatures(){
  const features = [
    'Weekday-compounded returns (Mon–Fri)',
    'Clear 60-day investment cycle (≈42 investment days)',
    'Tiered plans to suit small and large capital',
    'Fast KYC & secure withdrawals',
    '24/7 customer support via in app chat',
    'Detailed account and transaction history'
  ]

  return (
    <div className="features-section">
      <h3 className="section-title">Key features</h3>
      <ul className="feature-list">
        {features.map(f => <li key={f}>{f}</li>)}
      </ul>
    </div>
  )
}