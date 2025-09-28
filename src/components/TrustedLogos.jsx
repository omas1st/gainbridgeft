import React from 'react'

export default function TrustedLogos(){
  const logos = ['Bank', 'Pay', 'Chain', 'Secure']
  return (
    <div style={{display:'flex',gap:16,flexWrap:'wrap',alignItems:'center'}}>
      {logos.map((l, i)=>(
        <div key={i} style={{padding:12,borderRadius:8,background:'#fff',boxShadow:'0 4px 10px rgba(0,0,0,0.04)'}}>{l}</div>
      ))}
    </div>
  )
}
