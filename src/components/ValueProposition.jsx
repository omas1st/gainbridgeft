import React from 'react'
import '../styles/keyfeatures.css'

export default function ValueProposition(){
  const propositions = [
    {
      icon: '📈',
      title: 'Daily Compounding',
      description: 'Earn returns that compound every business day for maximum growth potential'
    },
    {
      icon: '🛡️',
      title: 'Secure Platform',
      description: 'Bank-level security and regulatory compliance for peace of mind'
    },
    {
      icon: '⚡',
      title: 'Fast Processing',
      description: 'Quick withdrawals processed within 24 hours after approval'
    },
    {
      icon: '👥',
      title: 'Referral Program',
      description: 'Earn additional income by referring friends and family'
    }
  ]

  return (
    <div className="features-section">
      <h3 className="section-title">Why Choose Gainbridge?</h3>
      <p className="section-subtitle">Experience the difference with our investor-focused platform</p>
      <div className="features-grid">
        {propositions.map((prop, index) => (
          <div key={index} className="feature-item">
            <div className="feature-icon">{prop.icon}</div>
            <h4 className="feature-title">{prop.title}</h4>
            <p className="feature-description">{prop.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}