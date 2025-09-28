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
          </div>
        </div>
        {/* hero-right intentionally removed per previous request */}
      </div>
    </section>
  )
}