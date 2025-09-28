import React from 'react'
import '../styles/about.css'

export default function TeamBios(){
  const teamMembers = [
    {
      name: "Financial Experts",
      role: "Investment Team",
      bio: "Our team comprises seasoned financial professionals with decades of combined experience in investment management and market analysis."
    },
    {
      name: "Tech Specialists",
      role: "Technology Team", 
      bio: "Dedicated to building secure, scalable platforms with cutting-edge technology to ensure your investment experience is seamless."
    },
    {
      name: "Support Team",
      role: "Customer Success",
      bio: "Available 24/7 to assist with any questions or concerns, ensuring you have the support you need throughout your investment journey."
    }
  ]

  return (
    <div className="about-team">
      <h3 className="team-title">Our Team</h3>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <div className="member-name">{member.name}</div>
            <div className="member-role">{member.role}</div>
            <div className="member-bio">{member.bio}</div>
          </div>
        ))}
      </div>
    </div>
  )
}