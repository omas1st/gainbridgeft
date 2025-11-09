// src/utils/calcProfit.js
// Frontend helper updated to match backend rules:
// - Simple interest (not compound).
// - Profit accrues minute-by-minute during business days (Mon-Fri).
// - Profit starts immediately at deposit start/approvedAt (no 24-hour delay).
// - Capped at 60 calendar days.

/**
 * calcPlanProfit
 *
 * Returns:
 *  - dailyProfit: number (principal * ratePercent/100)
 *  - businessDays: integer (approx weekdays in the days window)
 *  - totalProfit: number (dailyProfit * businessDays)  <-- this is "Total Return" (profit only)
 *  - totalAfter: number (principal + totalProfit)       <-- final payout
 */
export function calcPlanProfit(principal, ratePercent, days = 60) {
  const businessDays = Math.floor(days * 5 / 7)
  const rate = ratePercent / 100
  const dailyProfit = Number((principal * rate))
  const totalProfit = Number((dailyProfit * businessDays))
  const totalAfter = Number((Number(principal) + totalProfit))
  return {
    dailyProfit: Number(dailyProfit.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    totalAfter: Number(totalAfter.toFixed(2)),
    businessDays
  }
}

// Utility: business minutes between two dates (Mon-Fri)
function businessMinutesBetween(startDate, endDate) {
  const s = new Date(startDate)
  const e = new Date(endDate)
  if (e <= s) return 0
  s.setSeconds(0,0)
  e.setSeconds(0,0)

  let minutes = 0
  const cur = new Date(s)
  while (cur < e) {
    const day = cur.getDay()
    const nextDay = new Date(cur)
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(0,0,0,0)
    const segmentEnd = nextDay < e ? nextDay : e
    if (day !== 0 && day !== 6) {
      minutes += Math.floor((segmentEnd - cur) / (60 * 1000))
    }
    cur.setDate(cur.getDate() + 1)
    cur.setHours(0,0,0,0)
  }
  return minutes
}

// Map amounts to rates (frontend mirror of backend mapping)
function rateForAmount(amount) {
  const mapping = [
    { amount: 30, rate: 4 },
    { amount: 50, rate: 4 },
    { amount: 100, rate: 4.5 },
    { amount: 200, rate: 4.5 },
    { amount: 500, rate: 5 },
    { amount: 1000, rate: 6 },
    { amount: 2000, rate: 6 },
    { amount: 5000, rate: 6 },
    { amount: 10000, rate: 7 },
    { amount: 20000, rate: 7 }
  ]

  const exact = mapping.find(m => Number(m.amount) === Number(amount))
  if (exact) return exact.rate
  const sorted = mapping.map(m => m).sort((a,b)=>a.amount - b.amount)
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (amount >= sorted[i].amount) return sorted[i].rate
  }
  return 5
}

// Compute profit for a single deposit up to `asOf` (simple-interest, minute-accurate, business-time only)
export function profitForDeposit(deposit, asOf = new Date()) {
  if (!deposit) return 0
  const startCandidate = deposit.startDate || deposit.approvedAt
  if (!startCandidate) return 0
  const start = new Date(startCandidate)
  const explicitEnd = deposit.endDate ? new Date(deposit.endDate) : null
  const asOfDate = new Date(asOf)

  // cap at 60 calendar days
  const cap = new Date(start)
  cap.setDate(cap.getDate() + 60)

  let upto = asOfDate
  if (explicitEnd && explicitEnd < upto) upto = explicitEnd
  if (cap < upto) upto = cap

  // Profit starts immediately at start (no +24h delay)
  const profitStart = new Date(start.getTime())
  if (profitStart >= upto) return 0

  const minutes = businessMinutesBetween(profitStart, upto)
  if (minutes <= 0) return 0

  const principal = Number(deposit.amount || deposit.capital || 0)
  const ratePercent = (typeof deposit.ratePercent === 'number' && !isNaN(deposit.ratePercent))
    ? deposit.ratePercent
    : rateForAmount(principal)

  const dailyProfit = principal * (ratePercent / 100)
  const profit = dailyProfit * (minutes / (24 * 60))
  return Number(profit.toFixed(2))
}

export { rateForAmount, businessMinutesBetween }
