// src/components/SuccessWithdrawals.jsx
import React, { useEffect, useRef, useState } from 'react'
import '../styles/successWithdrawals.css'

// Helper: South African first names + surnames (mixed from common SA-language pools)
const FIRST_NAMES = [
  'Thabo', 'Sipho', 'Kagiso', 'Lerato', 'Nosipho', 'Sibusiso', 'Nokuthula', 'Mbali',
  'Kopano', 'Tshepo', 'Neo', 'Lesedi', 'Mpho', 'Rethabile', 'Khanya', 'Zanele',
  'Kgolofelo', 'Pule', 'Tebogo', 'Nkosi', 'Nandi', 'Dineo', 'Sibusisiwe', 'Bongani',
  'Lindiwe', 'Andre', 'Jan', 'Pieter', 'Johan', 'Annelize', 'Marie', 'Riaan',
  'Sibongile', 'Thulisile', 'Nkosinathi', 'Luyanda', 'Gugulethu', 'Kabelo', 'Mandla',
  'Fikile', 'Hendrik', 'Anele', 'Zuko', 'Ruan', 'Tumi', 'Vusi', 'Simon', 'Dumisani'
]

const SURNAMES = [
  'Dlamini', 'Khumalo', 'Naidoo', 'van der Merwe', 'Botha', 'Smith', 'Jacobs',
  'Petersen', 'Ndlovu', 'Mokoena', 'Molefe', 'Mthembu', 'Sithole', 'Madlala',
  'Shabalala', 'Mtshali', 'Mabena', 'Munyai', 'Mabaso', 'Nkosi', 'Moyo', 'Maseko',
  'Masehla', 'Pillay', 'Chetty', 'Muller', 'van Wyk', 'Groenewald', 'Makhanya',
  'Makhubela', 'Mphahlele', 'Makala', 'Kekana', 'Makhanya', 'Mokoena', 'Mkhize'
]

// Create a random integer between min and max inclusive
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate a readable time string from 1 minute to 3 days
function randomTimeString() {
  // Choose minutes, hours or days with weighted chance
  const pick = Math.random()
  if (pick < 0.5) {
    // minutes: 1 - 59
    const m = randInt(1, 59)
    return m === 1 ? '1 minute ago' : `${m} minutes ago`
  } else if (pick < 0.9) {
    // hours: 1 - 23
    const h = randInt(1, 23)
    return h === 1 ? '1 hour ago' : `${h} hours ago`
  } else {
    // days: 1 - 3
    const d = randInt(1, 3)
    return d === 1 ? '1 day ago' : `${d} days ago`
  }
}

// Generate a list of unique-ish South African name combinations
function generateName(index) {
  // to help variety, mix index into seed pick
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const surname = SURNAMES[(Math.floor(index / FIRST_NAMES.length) + index) % SURNAMES.length]
  return `${first} ${surname}`
}

// Generate the withdrawal objects (count default 200)
// NOTE: amount always ends with "0" by generating multiples of 10 between 10 and 10000.
function generateWithdrawals(count = 200) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const name = generateName(i)
    // generate a multiple-of-10 between 10 and 10000 (1..1000 * 10)
    const amount = randInt(1, 1000) * 10
    const time = randomTimeString()
    arr.push({ id: i + 1, name, amount, time })
  }
  return arr
}

export default function SuccessWithdrawals() {
  // order holds the list of withdrawals (we mutate items in-place intentionally)
  const [order, setOrder] = useState(() => generateWithdrawals(200))
  const [index, setIndex] = useState(0)
  const advanceRef = useRef(null)
  const mutateRef = useRef(null)

  // Shuffle on mount to randomize initial order
  useEffect(() => {
    const arr = order.slice()
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setOrder(arr)
    setIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run only once on mount

  // Advance carousel index every 2 seconds
  useEffect(() => {
    if (!order || order.length === 0) return
    advanceRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % order.length)
    }, 2000) // 2 seconds
    return () => {
      clearInterval(advanceRef.current)
    }
  }, [order])

  // Mutate a random entry's amount/time every interval
  useEffect(() => {
    // pick interval
    mutateRef.current = setInterval(() => {
      setOrder((prev) => {
        if (!prev || prev.length === 0) return prev
        // copy array shallowly
        const copy = prev.slice()
        // pick a random index to update
        const i = randInt(0, copy.length - 1)
        // produce new amount/time - ensure amount ends with '0'
        const newAmount = randInt(1, 1000) * 10
        const newTime = randomTimeString()
        // replace with new object to ensure React sees change
        const updated = { ...copy[i], amount: newAmount, time: newTime }
        copy[i] = updated
        return copy
      })
    }, 3000) // change every 3s (adjust as needed)

    return () => {
      clearInterval(mutateRef.current)
    }
  }, [])

  return (
    <div className="text-carousel withdrawals-text-carousel" aria-live="polite" aria-atomic="true">
      {order.map((w, i) => (
        <div
          key={w.id}
          className={`carousel-item ${i === index ? 'active' : ''}`}
          role="group"
          aria-hidden={i === index ? 'false' : 'true'}
        >
          <div className="item-top">
            <span className="item-name">{w.name}</span>
            <span className="item-amount">${w.amount.toLocaleString()}</span>
          </div>
          <div className="item-time muted small">{w.time}</div>
        </div>
      ))}
    </div>
  )
}
