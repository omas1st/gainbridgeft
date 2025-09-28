// src/services/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
export const AV_KEY = process.env.REACT_APP_AV_API_KEY || 'BFMWIW7V1WQ186I1';

const backend = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header if token present in localStorage (gb_user stored by AuthContext)
backend.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('gb_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.token) config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (err) {
    // ignore parse errors
  }
  return config;
}, (err) => Promise.reject(err));

/**
 * fetchPairPrice(symbol)
 * - Attempts to fetch a live price and simple percent change for common symbols/pairs using Alpha Vantage.
 * - Returns { price: Number|null, changePercent: Number|null, raw: object }.
 */
export async function fetchPairPrice(symbol) {
  if (!symbol) return { price: null, changePercent: null, raw: null }

  const s = String(symbol).trim().toUpperCase()

  // Helper to call AV
  async function callAV(params) {
    const url = 'https://www.alphavantage.co/query'
    const resp = await axios.get(url, { params: { ...params, apikey: AV_KEY } })
    return resp.data
  }

  try {
    // Crypto (Bitcoin)
    if (s === 'BITCOIN' || s === 'BTC') {
      const data = await callAV({ function: 'CURRENCY_EXCHANGE_RATE', from_currency: 'BTC', to_currency: 'USD' })
      const rate = data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate']
      const price = rate ? Number(rate) : null
      return { price, changePercent: null, raw: data }
    }

    // Forex pairs like EURUSD, GBPUSD, USDJPY (6 chars)
    if (s.length === 6) {
      const from = s.slice(0,3)
      const to = s.slice(3,6)
      const data = await callAV({ function: 'CURRENCY_EXCHANGE_RATE', from_currency: from, to_currency: to })
      const rate = data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate']
      const price = rate ? Number(rate) : null
      return { price, changePercent: null, raw: data }
    }

    // Gold (XAUUSD)
    if (s === 'XAUUSD' || s === 'XAU' || s.includes('GOLD')) {
      const data = await callAV({ function: 'CURRENCY_EXCHANGE_RATE', from_currency: 'XAU', to_currency: 'USD' })
      const rate = data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate']
      const price = rate ? Number(rate) : null
      return { price, changePercent: null, raw: data }
    }

    // Fallback: try GLOBAL_QUOTE (for tickers)
    const global = await callAV({ function: 'GLOBAL_QUOTE', symbol: s })
    const quote = global?.['Global Quote']
    if (quote) {
      const price = quote['05. price'] ? Number(quote['05. price']) : null
      const changePercentRaw = quote['10. change percent'] ? quote['10. change percent'] : null
      const changePercent = changePercentRaw ? Number(changePercentRaw.replace('%','')) : null
      return { price, changePercent, raw: global }
    }

    return { price: null, changePercent: null, raw: null }
  } catch (err) {
    return { price: null, changePercent: null, raw: { error: err?.message || err } }
  }
}

export default backend;
