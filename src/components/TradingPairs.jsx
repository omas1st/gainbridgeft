// src/components/TradingPairs.jsx
import React, { useEffect, useState, useCallback } from 'react'
import '../styles/tradingpairs.css'

/**
 * TradingPairs.jsx
 *
 * - Fetches live FX rates from exchangerate.host
 * - Shows a small day-over-day percent change and directional arrow
 * - Includes a manual refresh button
 *
 * Notes:
 * - Uses the public exchangerate.host API (no key). If you want another provider, replace the fetch URLs.
 * - Keeps UX lightweight (no external libraries).
 */

const PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'USD/NGN'
]

// Helper to format numbers
function fmtRate(n){
  if (!isFinite(n)) return '—'
  if (n >= 100) return n.toFixed(2)
  if (n >= 1) return n.toFixed(4)
  return n.toPrecision(6)
}

function fmtPct(n){
  if (!isFinite(n)) return '—'
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
}

// returns YYYY-MM-DD for a JS Date
function toYMD(date){
  return date.toISOString().slice(0,10)
}

// get previous calendar day (attempt 1 day back). If you want business-day logic, we can extend it.
function prevCalendarDay(date){
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d
}

export default function TradingPairs(){
  const [items, setItems] = useState([]) // { pair, rate, prevRate, changePct, date }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchPairRate = useCallback(async (pair) => {
    // pair format "BASE/QUOTE"
    const [base, quote] = pair.split('/').map(s => s.trim().toUpperCase())
    if (!base || !quote) throw new Error('Invalid pair')

    // use today and previous day endpoints
    const today = new Date()
    const prevDate = prevCalendarDay(today)

    const todayUrl = `https://api.exchangerate.host/${toYMD(today)}?base=${base}&symbols=${quote}`
    const prevUrl  = `https://api.exchangerate.host/${toYMD(prevDate)}?base=${base}&symbols=${quote}`

    // fetch both
    const [todayRes, prevRes] = await Promise.all([
      fetch(todayUrl).then(r => r.json()),
      fetch(prevUrl).then(r => r.json())
    ])

    // API returns { rates: { QUOTE: value }, date: 'YYYY-MM-DD' }
    const rate = todayRes?.rates?.[quote]
    let prevRate = prevRes?.rates?.[quote]

    // if prevRate is missing (holiday/weekend), try two days back
    if (typeof prevRate === 'undefined' || prevRate === null){
      const prev2 = prevCalendarDay(prevDate)
      const prev2Url = `https://api.exchangerate.host/${toYMD(prev2)}?base=${base}&symbols=${quote}`
      try{
        const prev2Res = await fetch(prev2Url).then(r => r.json())
        prevRate = prev2Res?.rates?.[quote]
      }catch(_){}
    }

    const changePct = (prevRate && rate) ? ((rate - prevRate) / prevRate) * 100 : NaN
    const dataDate = todayRes?.date || toYMD(today)

    return { pair, rate, prevRate, changePct, date: dataDate }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try{
      const results = await Promise.allSettled(PAIRS.map(p => fetchPairRate(p)))
      const mapped = results.map((r, idx) => {
        if (r.status === 'fulfilled') return r.value
        return { pair: PAIRS[idx], error: r.reason?.message || 'Failed' }
      })
      setItems(mapped)
      setLastUpdated(new Date())
    }catch(err){
      setError(err.message || 'Failed to load trading pairs')
    }finally{
      setLoading(false)
    }
  }, [fetchPairRate])

  useEffect(()=>{ load() }, [load])

  return (
    <div className="trading-pairs-wrapper">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
        <div style={{fontWeight:700}}>Live FX pairs</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="btn small" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
          <div className="muted small">{ lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : '' }</div>
        </div>
      </div>

      { error ? (
        <div className="muted" style={{padding:8, borderRadius:8, background:'#fff3f2', color:'#9b1c1c'}}>Error: {error}</div>
      ) : null }

      <div className="trading-pairs">
        { items.length === 0 && !loading ? (
          <div className="muted">No data available</div>
        ) : items.map((it) => {
          if (it.error){
            return (
              <div className="trading-pair" key={it.pair}>
                <div>
                  <div className="pair">{it.pair}</div>
                  <div className="info muted small">Error loading</div>
                </div>
              </div>
            )
          }

          const up = it.changePct > 0
          const changeClass = up ? 'positive' : (it.changePct < 0 ? 'negative' : 'neutral')

          return (
            <div className="trading-pair" key={it.pair}>
              <div>
                <div className="pair">{it.pair}</div>
                <div className="info muted small">As of {it.date}</div>
              </div>

              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700}}>{fmtRate(it.rate)}</div>
                <div className={`info small ${changeClass}`} >
                  { isFinite(it.changePct) ? (
                    <>
                      <span style={{marginRight:6}}>{fmtPct(it.changePct)}</span>
                      <span aria-hidden>{ up ? '▲' : (it.changePct < 0 ? '▼' : '—') }</span>
                    </>
                  ) : <span className="muted">—</span> }
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{marginTop:8}} className="muted small">Rates provided by exchangerate.host — for informational purposes only.</div>
    </div>
  )
}
