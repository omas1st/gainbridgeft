// src/utils/calcProfit.js
// Frontend helper updated to match backend rules:
// - Profit compounds only over business days (weekdays).
// - Profit accrues starting after 24 hours from deposit approval (frontend uses approximation for display).
export function calcDailyProfit(capital, ratePercent, days){
  const rate = ratePercent/100
  // Approximate business days in the window (60 calendar days -> ~42 weekdays)
  const businessDays = Math.floor(days * 5 / 7)
  let total = Number(capital)
  for(let i=0;i<businessDays;i++) total = total * (1+rate)
  const totalProfit = total - capital
  const dailyProfit = capital * rate
  return { dailyProfit: Number(dailyProfit.toFixed(2)), totalAfterDays: Number(total.toFixed(2)), totalProfit: Number(totalProfit.toFixed(2)), businessDays }
}
