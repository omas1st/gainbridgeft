import React from 'react'
import '../styles/about.css'

export default function About(){
  return (
    <div className="about-container">
      <div className="about-card">
        <h2 className="about-title">About GainBridge</h2>
        <div className="about-content">
          <p className="about-text">
            GainBridge is a simplified investment platform offering tiered plans with daily returns.
            Our mission is to provide transparent investment products and easy onboarding for investors and agents.
          </p>

          <div className="about-mission">
            <h3 className="mission-title">Our mission</h3>
            <p className="mission-text">To create a secure and accessible investment experience with clear returns and timely customer support.</p>
          </div>

          <div className="about-mission">
            <h3 className="mission-title">Our Team</h3>
            <p className="mission-text">Small team of fintech enthusiasts building practical investment tools focused on clarity and trust.</p>
          </div>
        </div>
      </div>
    </div>
  )
}