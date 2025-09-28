// src/components/CountdownTimer.jsx
import React, { useEffect, useState } from 'react'

/**
 * CountdownTimer
 *
 * - startDate: the date/time (string or Date) when the countdown started (usually deposit approval time)
 * - days: number of calendar days to count down (default 60)
 *
 * This component counts down calendar days (not business days) and renders remaining time.
 * It does not mutate server state — the server is responsible for resetting user capital when the period completes.
 */
export default function CountdownTimer({ startDate, days = 60 }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!startDate) return
    const start = new Date(startDate).getTime()
    const end = start + days * 24 * 60 * 60 * 1000
    function tick() {
      const now = Date.now()
      const diff = Math.max(0, end - now)
      setRemaining(diff)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [startDate, days])

  if (!startDate) return null
  if (remaining <= 0) return <div className="muted small">Deposit period finished</div>

  const sec = Math.floor(remaining / 1000) % 60
  const min = Math.floor(remaining / (1000 * 60)) % 60
  const hrs = Math.floor(remaining / (1000 * 60 * 60)) % 24
  const daysLeft = Math.floor(remaining / (1000 * 60 * 60 * 24))

  return (
    <div className="small muted">
      Time remaining: {daysLeft}d {hrs}h {min}m {sec}s
    </div>
  )
}
