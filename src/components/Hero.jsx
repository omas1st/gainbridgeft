// src/components/Hero.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/hero.css'

export default function Hero(){
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <h1>Forex Account Management</h1>
          <p className="muted">Automate your forex investments with our bots, put your forex trading on autopilot. Our software executes data-driven strategies, manage risk meticulously, and credit profits to your account daily.</p>
          <div className="hero-actions">
            <Link to="/register" className="hero-btn hero-btn-primary">Sign up</Link>
            {/* Added Login button */}
            <Link to="/login" className="hero-btn hero-btn-ghost">Login</Link>
            <a href="#about" className="hero-btn hero-btn-ghost">About</a>

            {/* Download Application button (opens MediaFire link in a new tab) */}
            <a
              href="https://www.mediafire.com/file/kns8u4p82t6mz3q/Gainbridge.apk/file"
              className="hero-btn hero-btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Android App
            </a>
          </div>
        </div>
        {/* hero-right intentionally removed per previous request */}
      </div>
    </section>
  )
}
