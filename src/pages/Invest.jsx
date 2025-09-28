// src/pages/Invest.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Invest.css'

/**
 * Updated plans and rates per user's specification:
 *
 * Plan A: $20  -> 2% daily
 * Plan B: $50  -> 2% daily
 * Plan C: $100 -> 2.5% daily
 * Plan D: $200 -> 2.5% daily
 * Plan E: $500 -> 2.5% daily
 * Plan F: $1,000 -> 3% daily
 * Plan G: $2,000 -> 3% daily
 * Plan H: $5,000 -> 3% daily
 * Plan I: $10,000 -> 4% daily
 * Plan J: $20,000 -> 4% daily
 *
 * NOTE: Displayed totals are compounded only for business days (weekdays) inside the provided days window.
 * We convert the calendar window (days) into business days by using floor(days * 5/7).
 * For a 60-day calendar window this yields 42 business days (60 * 5/7 = 42.857 -> floor -> 42).
 */
const PLANS = [
  { amount: 20, rate: 2, days: 60 },
  { amount: 50, rate: 2, days: 60 },
  { amount: 100, rate: 2.5, days: 60 },
  { amount: 200, rate: 2.5, days: 60 },
  { amount: 500, rate: 2.5, days: 60 },
  { amount: 1000, rate: 3, days: 60 },
  { amount: 2000, rate: 3, days: 60 },
  { amount: 5000, rate: 3, days: 60 },
  { amount: 10000, rate: 4, days: 60 },
  { amount: 20000, rate: 4, days: 60 }
]

function calcDailyProfit(amount, ratePercent, days) {
  // Convert calendar-day window to business days (weekdays only)
  const businessDays = Math.floor(days * 5 / 7) // 60 -> 42
  const rate = ratePercent / 100

  // Immediate (first-day) profit (non-compounded snapshot)
  const dailyProfit = Number((amount * rate).toFixed(2))

  // Compound only for business days
  let total = Number(amount)
  for (let i = 0; i < businessDays; i++) {
    total = total * (1 + rate)
  }

  return {
    dailyProfit: dailyProfit.toFixed(2),
    totalAfterDays: Number(total).toFixed(2),
    businessDays
  }
}

export default function Invest(){
  const nav = useNavigate()

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
              
              <div className="plan-amount">${p.amount.toLocaleString()}</div>
              <div className="plan-details">
                {p.rate}% daily — {p.days} days (≈ {calc.businessDays} investment days)
              </div>
              
              <div className="plan-features">
                <div className="plan-feature">
                  <span className="feature-label">Daily Profit:</span>
                  <span className="feature-value">${calc.dailyProfit}</span>
                </div>
                <div className="plan-feature">
                  <span className="feature-label">Total Return:</span>
                  <span className="feature-value">${calc.totalAfterDays}</span>
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