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
            <div className="stat-label">Operating Days</div>
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
        <p className="section-subtitle">See what our investors are saying about their experience</p>
        <Testimonials />
      </section>

      {/* Success Withdrawals Section (NEW) */}
      <section className="section-card withdrawals-section">
        <h2 className="section-title">Recent Successful Withdrawals</h2>
        <p className="section-subtitle">Real withdrawals processed and paid out to our investors</p>
        <SuccessWithdrawals />
      </section>

      {/* About Section */}
      <section id="about" className="section-card about-section">
        <h2 className="section-title">About Gainbridge Investment</h2>
        <div className="about-content">
          <p className="about-text">
            Gainbridge investment is a regulated-minded investment platform that provides 
            short-term, weekday-compounded investment plans focused on transparency and security.
          </p>
          <TeamBios />
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-card cta-section">
        <h2 className="cta-title">Ready to grow your capital?</h2>
        <p className="cta-text">
          Create an account and start earning weekday-compounded returns. 
          Withdrawals are processed after admin approval and verified securely.
        </p>
        <a className="cta-button" href="/register">Get Started Today</a>
      </section>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}
