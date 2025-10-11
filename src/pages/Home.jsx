import React, { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import LiveMembers from '../components/LiveMembers'
import Testimonials from '../components/Testimonials'
import ValueProposition from '../components/ValueProposition'
import KeyFeatures from '../components/KeyFeatures'
import TeamBios from '../components/TeamBios'
import Footer from '../components/Footer'
import SuccessWithdrawals from '../components/SuccessWithdrawals'
import '../styles/home.css'
import { useAuth } from '../contexts/AuthContext'

export default function Home(){
  const { user, logout } = useAuth()
  const [showFooter, setShowFooter] = useState(false)

  useEffect(() => {
    try {
      if (user) {
        if (typeof logout === 'function') {
          logout()
        }
      }
    } catch (e) {
      // swallow errors so home page still loads even if logout fails
    }
  }, [user, logout])

  useEffect(() => {
    try {
      const existingFooter = document.querySelector('footer')
      if (!existingFooter) setShowFooter(true)
      else setShowFooter(false)
    } catch (e) {
      setShowFooter(true)
    }
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Hero />
      </section>

      {/* Quick Stats Section */}
      <section className="quick-stats">
        <LiveMembers registeredCount={5} onlineCount={3} />
        
        <div className="site-stats">
          <div className="stat-item">
            <div className="stat-value">Monday — Friday</div>
            <div className="stat-label">Trading Days</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Professional</div>
            <div className="stat-label">Forex Management</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">60 calendar days</div>
            <div className="stat-label">Investment Cycle</div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="section-card">
        <ValueProposition />
      </section>

      {/* Key Features Section */}
      <section className="section-card">
        <KeyFeatures />
      </section>

      {/* Testimonials Section */}
      <section className="section-card">
        <h2 className="section-title">Success Stories</h2>
        <p className="section-subtitle">See what our investors are saying about their forex investment experience</p>
        <Testimonials />
      </section>

      {/* Success Withdrawals Section (NEW) */}
      <section className="section-card withdrawals-section">
        <h2 className="section-title">Recent Successful Withdrawals</h2>
        <p className="section-subtitle">Real withdrawals processed and paid out to our investors from forex trading profits</p>
        <SuccessWithdrawals />
      </section>

      {/* About Section */}
      <section id="about" className="section-card about-section">
        <h2 className="section-title">About GainBridge Forex Management</h2>
        <div className="about-content">
          <p className="about-text">
            GainBridge is a premier forex account management platform that specializes in professional 
            currency trading and investment management. We combine advanced trading strategies with 
            rigorous risk management to deliver consistent returns for our investors.
          </p>
          <div className="home-about-highlights">
            <div className="highlight-item">
              <h4>Expert Forex Trading</h4>
              <p>Professional traders managing your investments in global currency markets</p>
            </div>
            <div className="highlight-item">
              <h4>Risk Management</h4>
              <p>Advanced strategies to protect your capital while maximizing returns</p>
            </div>
            <div className="highlight-item">
              <h4>Daily Returns</h4>
              <p>Consistent profit distribution from successful forex trades</p>
            </div>
          </div>
          <TeamBios />
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-card cta-section">
        <h2 className="cta-title">Ready to grow your capital with forex?</h2>
        <p className="cta-text">
          Join our professionally managed forex investment platform and start earning daily returns. 
          Your capital is traded by experts in global currency markets with proven risk management strategies.
        </p>
        <a className="cta-button" href="/register">Start Investing Today</a>
      </section>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}