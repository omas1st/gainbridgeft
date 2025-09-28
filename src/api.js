import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'
const AV_KEY = process.env.REACT_APP_AV_API_KEY

export const backend = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Helper to fetch FX rates from Alpha Vantage
export async function fetchPairPrice(symbol) {
  // symbol examples: 'EURUSD', 'GBPUSD', 'AUDUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'
  if (!AV_KEY) throw new Error('Alpha Vantage key not configured')

  // handle common symbols
  try {
    if (symbol === 'BTCUSD') {
      // Digital currency endpoint (example using Alpha Vantage DIGITAL_CURRENCY_INTRADAY or TIME_SERIES)
      // but to keep simple here we return null and let backend handle or fallback
      return { price: null }
    }
    if (symbol === 'XAUUSD') {
      // Metals endpoint isn't available on free AV; fallback to null
      return { price: null }
    }

    const from = symbol.slice(0,3)
    const to = symbol.slice(3)
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${AV_KEY}`
    const res = await axios.get(url)
    const data = res.data['Realtime Currency Exchange Rate']
    if (!data) return { price: null }
    const price = data['5. Exchange Rate']
    return { price: parseFloat(price) }
  } catch (err) {
    console.error('fetchPairPrice error', err)
    return { price: null }
  }
}

export default backend
