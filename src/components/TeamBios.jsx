import React from 'react'
import '../styles/about.css'

export default function TeamBios(){
  const teamMembers = [
    {
      name: "Forex Trading Experts",
      role: "Senior Trading Team",
      bio: "Our senior traders have decades of combined experience in currency markets, with backgrounds in institutional trading, hedge fund management, and proprietary trading firms. They specialize in technical analysis, risk management, and strategic position sizing."
    },
    {
      name: "Market Analysts",
      role: "Research & Analysis Team", 
      bio: "Dedicated to comprehensive market research, economic analysis, and real-time monitoring of global currency markets. They provide the strategic insights that drive our trading decisions across major and minor currency pairs."
    },
    {
      name: "Risk Management Specialists",
      role: "Risk Management Team",
      bio: "Focused on protecting investor capital through sophisticated risk management strategies. They ensure no single trade risks more than 2% of account capital and implement strict stop-loss protocols across all positions."
    },
    {
      name: "Client Support Team",
      role: "Customer Success & Support",
      bio: "Available during market hours to assist with investment questions, account management, and provide updates on trading performance. Your dedicated partners in the investment journey.",
      contact: "Contact: Gainbridgeinvest@gmail.com"
    }
  ]

  return (
    <div className="about-team">
      <h3 className="team-title">Our Trading & Management Team</h3>
      <p className="team-description">
        Meet the professional team behind GainBridge's forex account management services. 
        Each team brings specialized expertise to ensure your investments are managed with 
        the highest level of professionalism and strategic execution.
      </p>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <div className="member-name">{member.name}</div>
            <div className="member-role">{member.role}</div>
            <div className="member-bio">{member.bio}</div>
            {member.contact && <div className="member-contact">{member.contact}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}