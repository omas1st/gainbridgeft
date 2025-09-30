// src/pages/Invest.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Invest.css'

/**
 * Updated plans and rates per user's specification:
 *
 * Plan A: $20  -> 5% daily
 * Plan B: $50  -> 5% daily
 * Plan C: $100 -> 6% daily
 * Plan D: $200 -> 6% daily
 * Plan E: $500 -> 6% daily
 * Plan F: $1,000 -> 7% daily
 * Plan G: $2,000 -> 7% daily
 * Plan H: $5,000 -> 7% daily
 * Plan I: $10,000 -> 8% daily
 * Plan J: $20,000 -> 8% daily
 *
 * NOTE: Uses simple interest over business days (weekdays) inside the provided days window.
 * For a 60-day calendar window this yields 42 business days (approx).
 */
const PLANS = [
  { amount: 20, rate: 5, days: 60 },
  { amount: 50, rate: 5, days: 60 },
  { amount: 100, rate: 6, days: 60 },
  { amount: 200, rate: 6, days: 60 },
  { amount: 500, rate: 6, days: 60 },
  { amount: 1000, rate: 7, days: 60 },
  { amount: 2000, rate: 7, days: 60 },
  { amount: 5000, rate: 7, days: 60 },
  { amount: 10000, rate: 8, days: 60 },
  { amount: 20000, rate: 8, days: 60 }
]

function calcDailyProfit(amount, ratePercent, days) {
  // Convert calendar-day window to business days (weekdays only)
  const businessDays = Math.floor(days * 5 / 7) // 60 -> 42
  const rate = ratePercent / 100

  // Simple interest: dailyProfit = amount * rate
  const dailyProfit = Number((amount * rate).toFixed(2))
  const totalProfit = Number((dailyProfit * businessDays).toFixed(2))
  const totalAfter = Number((Number(amount) + totalProfit).toFixed(2))

  return {
    dailyProfit: dailyProfit.toFixed(2),
    totalAfterDays: totalAfter.toFixed(2),
    businessDays
  }
}

export default function Invest(){
  const nav = useNavigate()

  // ZAR conversion rate (frontend display only)
  const ZAR_RATE = 17
  const toZAR = (usd) => (Number(usd || 0) * ZAR_RATE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  function choose(plan){
    nav('/invest/confirm', { state: { plan } })
  }

  return (
    <div className="invest-container">
      <div className="invest-header-card">
        <h1 className="invest-main-title">Investment Plans</h1>
        <p className="invest-subtitle">Choose the perfect plan for your financial goals</p>
      </div>
      
      <div className="plans-grid">
        {PLANS.map((p, index) => {
          const calc = calcDailyProfit(p.amount, p.rate, p.days)
          const isPopular = p.amount === 1000 || p.amount === 5000 // Mark mid-range plans as popular
          
          return (
            <div className={`plan-card ${isPopular ? 'popular' : ''}`} key={p.amount}>
              {isPopular && <div className="plan-badge">POPULAR</div>}
              
              <div className="plan-amount">
                ${p.amount.toLocaleString()}
                <span className="zar-value">(R{toZAR(p.amount)})</span>
              </div>
              <div className="plan-details">
                {p.rate}% daily — {p.days} days (≈ {calc.businessDays} investment days)
              </div>
              
              <div className="plan-features">
                <div className="plan-feature">
                  <span className="feature-label">Daily Profit:</span>
                  <span className="feature-value">
                    ${calc.dailyProfit}
                    <span className="zar-value">(R{toZAR(calc.dailyProfit)})</span>
                  </span>
                </div>
                <div className="plan-feature">
                  <span className="feature-label">Total Return:</span>
                  <span className="feature-value">
                    ${calc.totalAfterDays}
                    <span className="zar-value">(R{toZAR(calc.totalAfterDays)})</span>
                  </span>
                </div>
                <div className="plan-feature">
                  <span className="feature-label">Duration:</span>
                  <span className="feature-value">{p.days} days</span>
                </div>
              </div>
              
              <button className="plan-button" onClick={()=>choose(p)}>
                Choose Plan
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
