import React from 'react'

/**
 * Plans - calculates compounded returns for weekday-only compounding over a 60-day cycle
 * Uses approx 42 weekdays as provided by the business spec.
 *
 * DO NOT change the nominal dailyRates mapping unless plans change.
 */

const PLAN_DEFINITIONS = [
  { amount: 20,   dailyRate: 0.02 },
  { amount: 50,   dailyRate: 0.02 },
  { amount: 100,  dailyRate: 0.025 },
  { amount: 200,  dailyRate: 0.025 },
  { amount: 500,  dailyRate: 0.025 },
  { amount: 1000, dailyRate: 0.03 },
  { amount: 2000, dailyRate: 0.03 },
  { amount: 5000, dailyRate: 0.03 },
  { amount: 10000,dailyRate: 0.04 },
  { amount: 20000,dailyRate: 0.04 },
]

// Business rule: 60-day period = ~42 weekdays (investment days)
const INVESTMENT_DAYS = 42

function formatMoney(n){
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export default function Plans(){
  return (
    <div className="plans-grid">
      {PLAN_DEFINITIONS.map((p) => {
        const final = p.amount * Math.pow(1 + p.dailyRate, INVESTMENT_DAYS)
        const profit = final - p.amount
        const roiPercent = (profit / p.amount) * 100

        return (
          <div className="plan-card" key={p.amount}>
            <div className="plan-header">
              <div className="plan-amount">{formatMoney(p.amount)}</div>
              <div className="plan-sub">Daily: {(p.dailyRate * 100).toFixed(2)}% (Mon–Fri)</div>
            </div>

            <div className="plan-body">
              <div className="plan-row">
                <div className="label">Investment days</div>
                <div className="value">{INVESTMENT_DAYS} days</div>
              </div>

              <div className="plan-row">
                <div className="label">Estimated final payout</div>
                <div className="value">{formatMoney(final)}</div>
              </div>

              <div className="plan-row">
                <div className="label">Estimated profit</div>
                <div className="value">{formatMoney(profit)} <span className="muted small">({roiPercent.toFixed(2)}% ROI)</span></div>
              </div>
            </div>

            <div className="plan-actions">
              <a className="btn primary small" href="/register">Sign up</a>
              <a className="btn ghost small" href={`/invest?amount=${p.amount}`}>Select</a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
