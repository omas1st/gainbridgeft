import React, { useEffect, useRef, useState } from 'react'
import '../styles/testimonials.css'

const demo = [
{ name: 'Jane D', text: 'I got paid in 24 hours. Great support!' },
{ name: 'Samuel K', text: 'Clear interface and fast responses.' },
{ name: 'Thabo M', text: 'Started with $500 and I withdraw daily. It covers my transport and groceries.' },
{ name: 'Zanele N', text: 'I invested $1000 and I withdraw every morning. It helps me run my small salon.' },
{ name: 'Pieter V', text: 'I invested $5000 six months ago. Consistent daily withdrawals and excellent customer care.' },
{ name: 'Sipho S', text: 'I began with $20. Small start but steady daily payouts that really add up.' },
{ name: 'Lerato D', text: 'After 8 months I have withdrawn enough to pay off a loan. The platform is reliable.' },
{ name: 'Siya M', text: 'I placed $10000 and make daily withdrawals to my bank. It funds my family living expenses.' },
{ name: 'Nkosi B', text: 'Fast withdrawals and a clear dashboard. I reinvest and still withdraw daily for home needs.' },
{ name: 'Mbali P', text: 'I invested $5000 and have been transacting for over a year. I made more than 10 times my capital on one cycle.' },
{ name: 'Kagiso R', text: 'I started with $1000 and now use daily withdrawals to buy stock for my shop.' },
{ name: 'Nomsa T', text: 'I made a $20 deposit to try it out. Withdrawals are instant and the support team is helpful.' },
{ name: 'Mbongeni K', text: 'I invested $20000 and use daily withdrawals for payroll. The system handles large transactions smoothly.' },
{ name: 'Sibusiso L', text: 'Consistent daily payouts helped me save for a wedding. I have been with Gainbridge for 9 months.' },
{ name: 'Johan B', text: 'I invested $5000 and withdraw daily to pay bills. Simple and trustworthy.' },
{ name: 'Thandi M', text: 'Within 6 months I grew my $1000 and often withdraw for groceries and school fees.' },
{ name: 'Themba N', text: 'I started with $500 and now regularly withdraw profits to expand my side business.' },
{ name: 'Ruan S', text: 'After 7 months I have completed many withdrawals and reinvested profits. Great transparency.' },
{ name: 'Khanyisile Z', text: 'I made over 10 times my first deposit of $500 in one investment cycle and withdrawals were smooth.' },
{ name: 'Lebogang P', text: 'Daily withdrawals go straight to my bank. I use them to support my family every day.' },
{ name: 'Precious S', text: 'I invested $1000 and after regular daily withdrawals I could buy new equipment for my bakery.' },
{ name: 'Mpho K', text: 'Been transacting for over 6 months. Withdrawals are fast and customer service is always available.' },
{ name: 'Ayanda M', text: 'I started small and now I withdraw daily to pay school fees. Very reliable.' },
{ name: 'Gugu H', text: 'After a year I used my gains to buy a secondhand car. Withdrawals were prompt.' },
{ name: 'Andile P', text: 'I invested $500 and now withdraw daily to stock my grocery business.' },
{ name: 'Retha V', text: 'I invested $10000 and the platform helps me manage payroll for my staff.' },
{ name: 'Kgomotso N', text: 'Daily payouts helped me renovate my kitchen. Smooth withdrawal process.' },
{ name: 'Lesego M', text: 'I started with $20 and now withdraw every day for transport costs.' },
{ name: 'Nthabiseng T', text: 'I invested $5000 and after months of regular withdrawals I bought a new car.' },
{ name: 'Vusi D', text: 'Quick withdrawals and steady returns. I use them to support my family.' },
{ name: 'Palesa S', text: 'I invested $1000 and within months I could pay for my child university fees.' },
{ name: 'Neo K', text: 'I made withdrawals every morning and grew my small capital into a solid income stream.' },
{ name: 'Xolani M', text: 'I have been on the platform for 10 months and used my profits to open a small shop.' },
{ name: 'Anathi B', text: 'I invested $500 and now withdraw daily to manage household expenses.' },
{ name: 'Zuko R', text: 'I placed $20000 and the platform processed large withdrawals quickly and securely.' },
{ name: 'Lindiwe S', text: 'My daily withdrawals pay for my cleaning business supplies.' },
{ name: 'Riaan J', text: 'I invested $5000 and after consistent withdrawals I purchased a new car.' },
{ name: 'Siyabonga N', text: 'I started with $1000 and now withdraw daily to cover employee wages.' },
{ name: 'Bonolo M', text: 'I invested $100 and now make daily withdrawals that make my life easier.' },
{ name: 'Olwethu P', text: 'After 6 months I had enough to put a deposit on a house. Withdrawals were reliable.' },
{ name: 'Zinhle C', text: 'I withdraw daily and use profits to grow my catering business.' },
{ name: 'Mandla H', text: 'I deposited $5000 and after steady withdrawals I built a savings cushion for emergencies.' },
{ name: 'Noluthando G', text: 'I have been with Gainbridge for over a year and I recently bought a car from my earnings.' },
{ name: 'Fikile T', text: 'Daily withdrawals are quick and I use them to support my family and small trade.' },
{ name: 'Keabetswe S', text: 'I invested $1000 and withdrew enough to expand my stock. Excellent platform.' },
{ name: 'Tshepo M', text: 'I made regular withdrawals every day for six months and then used profits to pay off debt.' },
{ name: 'Smanga L', text: 'I started with $20 and now I withdraw daily to help with groceries.' },
{ name: 'Hloniphani K', text: 'After 9 months I had enough to buy a reliable car for my taxi work.' },
{ name: 'Lerato K', text: 'I invested $500 and it helped me open a secondhand clothing stall with daily withdrawals.' },
{ name: 'Zuko M', text: 'I invested $10000 and daily withdrawals made payroll easy for my business.' },
{ name: 'Hlengiwe D', text: 'I made several withdrawals and after a year I bought a small house. The process was smooth.' },
{ name: 'Mosa P', text: 'I withdraw every day and the income covers my school fees and living costs.' },
{ name: 'Lebo N', text: 'I invested $5000 and in a few cycles I made enough profit to renovate my home.' },
{ name: 'Tebogo S', text: 'Daily withdrawals helped me build a safety net for my family.' },
{ name: 'Sanele R', text: 'I started with $100 and now I withdraw daily to pay for my children needs.' },
{ name: 'Katlego V', text: 'I used daily withdrawals to start a small delivery service. Support is dependable.' },
{ name: 'Nolwazi B', text: 'I invested $1000 and received fast withdrawals to pay my medical bills.' },
{ name: 'Busi Z', text: 'After 6 months I used earnings to buy land. Withdrawals were punctual.' },
{ name: 'Thulani M', text: 'I withdraw every morning and the money funds my construction tools.' },
{ name: 'Amogelang K', text: 'I invested $500 and have been consistently withdrawing to support my market stall.' },
{ name: 'Fanie J', text: 'I used the platform for business cash flow and daily withdrawals arrive on time.' },
{ name: 'Masego L', text: 'I invested $1000 and in 10 months I bought a new car from my profits.' },
{ name: 'Kgothatso P', text: 'I have been transacting for over 6 months and I make daily withdrawals for living costs.' },
{ name: 'Siya B', text: 'I started with $500 and now withdraw to afford school fees and extra costs.' },
{ name: 'Unathi T', text: 'I invested $5000 and after months of withdrawals I bought a small property.' },
{ name: 'Mapaseka S', text: 'Daily withdrawals helped me open a small cafe. The support team is helpful.' },
{ name: 'Themba P', text: 'I invested $1000 and after regular withdrawals I was able to fund a wedding.' },
{ name: 'Lunga M', text: 'I started with $20 and am now withdrawing daily to support my family.' },
{ name: 'Ayabonga N', text: 'I withdrew daily for months and used proceeds to buy a motorbike for deliveries.' },
{ name: 'Rorisang T', text: 'I used my earnings to pay for a training course. Withdrawals were instant.' },
{ name: 'Zanele P', text: 'I invested $500 and after a while bought furniture for my home from withdrawals.' },
{ name: 'Pieter S', text: 'I invested $5000 and have been withdrawing daily to run my online store.' },
{ name: 'Lerato B', text: 'I withdrew every day and after a year I purchased a small family car.' },
{ name: 'Siphelele M', text: 'I started with limited funds and now withdraw daily to cover school costs.' },
{ name: 'Rethabile N', text: 'I made daily withdrawals to pay suppliers and grow my business.' },
{ name: 'Thabo S', text: 'I used the platform for 6 months and made steady withdrawals to fund my house renovation.' },
{ name: 'Nandi T', text: 'I invested $100 and it grew steadily. Withdrawals are dependable.' },
{ name: 'Mbulelo P', text: 'I invested $2000 and use daily withdrawals to support my family and expand my shop.' },
{ name: 'Zodwa M', text: 'I made regular withdrawals and bought a better car for my family transport.' },
{ name: 'Sipho K', text: 'I withdraw every day to pay for petrol and small business expenses.' },
{ name: 'Johan C', text: 'I invested $10000 and used daily withdrawals to secure a rental property.' },
{ name: 'Thuli M', text: 'I started small and after months of withdrawals I bought appliances for my home.' },
{ name: 'Luyanda N', text: 'Daily withdrawals are dependable and help me fund my groceries and utilities.' },
{ name: 'Sizwe P', text: 'I invested $5000 and the profits paid for a new piece of equipment for my workshop.' },
{ name: 'Nonhlanhla S', text: 'I withdrew daily and used profits to open a small beauty salon.' },
{ name: 'Themba L', text: 'I have been transacting for over a year and the platform helped me buy a car.' },
{ name: 'Nkosinathi V', text: 'I invested $1000 and daily withdrawals helped me start a small repairs business.' },
{ name: 'Dineo M', text: 'I withdraw every morning and the money supports my household and my kids school needs.' },
{ name: 'Gcina B', text: 'I used gains to invest in stock for my shop. Withdrawals are timely.' },
{ name: 'Kabelo M', text: 'I invested $500 and now withdraw daily to help with groceries and school uniforms.' },
{ name: 'Tumelo S', text: 'I made regular daily withdrawals and after 9 months purchased a used car.' },
{ name: 'Mmatladi P', text: 'I invested $2000 and daily withdrawals let me pay rent and save the rest.' },
{ name: 'Lerato T', text: 'I withdrew daily and used my profit to start a small beauty business.' },
{ name: 'Boitumelo K', text: 'I made withdrawals every day and bought a small stand to sell snacks.' },
{ name: 'Sipho D', text: 'I invested $5000 and daily withdrawals helped me take care of family expenses.' },
{ name: 'Katleho R', text: 'I used withdrawals to buy tools and grow my handyman business.' },
{ name: 'Nolwandle N', text: 'I started with $100 and daily withdrawals quickly added up to useful cash.' },
{ name: 'Mbongeni P', text: 'I invested $10000 and after consistent withdrawals I was able to purchase a house deposit.' },
{ name: 'Ruan N', text: 'I withdraw daily and it funds my small online venture with steady cash flow.' },
{ name: 'Zukiswa M', text: 'I invested $500 and after months of withdrawals I installed solar at home.' },
{ name: 'Lethabo S', text: 'I have been withdrawing daily for 6 months and it paid for a family holiday.' },
{ name: 'Nthabiseng P', text: 'I invested $1000 and used steady withdrawals to open a daycare centre.' },
{ name: 'Khulekani M', text: 'I withdraw every day and it covers my shop inventory and transport.' },
{ name: 'Teboho N', text: 'I invested $200 and daily withdrawals let me buy a secondhand fridge for my home business.' },
{ name: 'Sibongile M', text: 'I made daily withdrawals and after a year I paid off a car loan.' },
{ name: 'Bongi N', text: 'I withdraw daily and it pays for my childrens school supplies.' },
{ name: 'Khanyi T', text: 'I invested $5000 and used withdrawals to expand my salon and hire staff.' },
{ name: 'Jabulani K', text: 'I have been transacting for 6 months and used profits to buy a new laptop and tools.' },
{ name: 'Lerato M', text: 'I started with $1000 and daily withdrawals helped me open a small stall at the market.' },
{ name: 'Ryno P', text: 'I withdraw daily and the platform helped my small business survive slow months.' },
{ name: 'Neo P', text: 'I invested $500 and made steady withdrawals that funded a course for my daughter.' },
{ name: 'Nolusapho M', text: 'I used daily withdrawals to pay for medical bills. Support is responsive.' },
{ name: 'Thabiso S', text: 'I invested $100 and daily payouts helped me cover transport and food.' },
{ name: 'Lerato F', text: 'I made regular withdrawals and used earnings to buy a car for my business.' },
{ name: 'Makhosi B', text: 'I withdraw daily and it helps cover chores and small business costs.' },
{ name: 'Zandile P', text: 'I started with $500 and after months of withdrawals I funded a wedding celebration.' },
{ name: 'Nomalizo T', text: 'I invested $1000 and now withdraw daily to pay for staff wages.' },
{ name: 'Siphesihle K', text: 'I made many withdrawals and after a year I bought a car for my family.' },
{ name: 'Themba G', text: 'I invested $5000 and used withdrawals to open a small warehouse and employ staff.' },
{ name: 'Mzukisi L', text: 'Daily withdrawals allowed me to save and eventually place a deposit on a house.' },
{ name: 'Kgaogelo N', text: 'I invested $100 and used daily withdrawals to grow a small catering service.' },
{ name: 'Phumlani M', text: 'After 6 months of daily withdrawals I bought a fencing machine for my business.' },
{ name: 'Siphiwe M', text: 'I invested $2000 and daily payouts helped me pay for building materials for my home.' },
{ name: 'Nokuthula D', text: 'I withdraw daily and it supports my family and small side hustle.' },
{ name: 'Thabiso M', text: 'I invested $500 and after months of withdrawals I opened a kiosk near the taxi rank.' },
{ name: 'Hlengiwe K', text: 'I used winnings to buy a car and the withdrawal process was smooth.' },
{ name: 'Lindiwe T', text: 'Daily withdrawals helped me buy furniture and pay for renovations.' },
{ name: 'Nokwanda P', text: 'I invested $1000 and used daily withdrawals to expand my catering business.' },
{ name: 'Mxolisi N', text: 'I withdraw every day and it pays my small team while we grow our enterprise.' },
{ name: 'Kgosi M', text: 'I started with $20 and daily payouts now support my household needs.' },
{ name: 'Paballo S', text: 'After regular withdrawals I was able to buy a car for my delivery service.' },
{ name: 'Lethabo M', text: 'I used profits to buy a plot of land and withdrawals were reliable.' },
{ name: 'Nqobile K', text: 'I invested $5000 and daily withdrawals helped me employ extra staff.' },
{ name: 'Xola M', text: 'I withdraw every day and the funds go straight to suppliers and bills.' },
{ name: 'Philani S', text: 'I started with a small amount and now withdraw daily to fund my studies.' },
{ name: 'Sanele M', text: 'I invested $1000 and in several months I bought a secondhand car from profits.' },
{ name: 'Zukile P', text: 'Daily withdrawals are stable and helped me pay for home improvements.' },
{ name: 'Morne V', text: 'I invested $10000 and used daily payouts to start a small distribution business.' },
{ name: 'Anika V', text: 'I made daily withdrawals and after a year I bought a house for my family.' },
{ name: 'Derick P', text: 'I withdraw daily and the income funds my freelance work and tools.' },
{ name: 'Ria N', text: 'I invested $500 and made steady withdrawals to expand my sewing business.' },
{ name: 'Charlene M', text: 'I used consistent withdrawals to secure a home deposit within a year.' },
{ name: 'Pieter M', text: 'I invested $20000 and daily withdrawals make payroll easy for my growing team.' },
{ name: 'Bronwyn K', text: 'Daily withdrawals helped me invest in property and small businesses.' },
{ name: 'Carl T', text: 'I withdraw every morning and the platform funds my mechanics workshop supplies.' },
{ name: 'Nadine S', text: 'I invested $1000 and after months of daily withdrawals I bought a car.' },
{ name: 'Hannes V', text: 'I withdraw daily and use the funds to expand my farming operations.' },
{ name: 'Esihle M', text: 'I used daily withdrawals to pay school fees and save the rest for a home deposit.' },
{ name: 'Frans P', text: 'I invested $5000 and after regular withdrawals I bought a small block of flats.' },
{ name: 'Lebohang K', text: 'I withdraw daily and the income sustains my family and small business.' }
]

export default function Testimonials() {
  const [order, setOrder] = useState(demo.slice())
  const [index, setIndex] = useState(0)
  const intervalRef = useRef(null)

  // Shuffle on mount to produce a random sequence
  useEffect(() => {
    const arr = demo.slice()
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setOrder(arr)
    setIndex(0)
  }, [])

  // Auto-advance every 2 seconds
  useEffect(() => {
    if (!order || order.length === 0) return
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % order.length)
    }, 2000)
    return () => clearInterval(intervalRef.current)
  }, [order])

  return (
    <div className="text-carousel testimonials-text-carousel" aria-live="polite" aria-atomic="true">
      {order.map((t, i) => (
        <div
          key={i}
          className={`carousel-item ${i === index ? 'active' : ''}`}
          role="group"
          aria-hidden={i === index ? 'false' : 'true'}
        >
          <div className="testimonial-card-inner">
            <div className="testimonial-text">"{t.text}"</div>
            <div className="testimonial-name">— {t.name}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
