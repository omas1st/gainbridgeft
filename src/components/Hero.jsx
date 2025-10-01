// src/components/Hero.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/hero.css'

export default function Hero(){
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <h1>Invest smart. Grow faster — Welcome to Gainbridge investment</h1>
          <p className="muted">White-glove-grade oversight and weekday-compounded returns in clearly defined plans.</p>
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
              Download Application
            </a>
          </div>
        </div>
        {/* hero-right intentionally removed per previous request */}
      </div>
    </section>
  )
}
